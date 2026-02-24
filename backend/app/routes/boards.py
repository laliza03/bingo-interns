from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.models.bingo_board import (
    BingoBoard, BingoBoardActivity, UserBoardProgress,
    BingoBoardCreate, BingoBoardResponse, BingoBoardWithActivities,
    BingoBoardActivityResponse, UserProgressResponse
)
from app.models.activity import Activity
from app.models.user import Profile
from app.db.connection import get_session
import uuid as uuid_pkg
from typing import List

router = APIRouter()


@router.post("/boards", response_model=BingoBoardResponse, status_code=status.HTTP_201_CREATED)
def create_bingo_board(board_data: BingoBoardCreate, session: Session = Depends(get_session)):
    """
    Create a new bingo board with 25 activities.
    activity_ids must contain exactly 25 activity IDs.
    """
    # Validate exactly 25 activities
    if len(board_data.activity_ids) != 25:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bingo board must have exactly 25 activities"
        )
    
    # Verify all activities exist
    for activity_id in board_data.activity_ids:
        activity = session.get(Activity, activity_id)
        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Activity {activity_id} not found"
            )
    
    # Create board
    new_board = BingoBoard(
        title=board_data.title,
        description=board_data.description
    )
    session.add(new_board)
    session.flush()  # Get board ID without committing
    
    # Create board-activity associations
    for position, activity_id in enumerate(board_data.activity_ids):
        board_activity = BingoBoardActivity(
            board_id=new_board.id,
            activity_id=activity_id,
            position=position
        )
        session.add(board_activity)
    
    session.commit()
    session.refresh(new_board)
    return new_board


@router.get("/boards", response_model=List[BingoBoardResponse])
def get_all_boards(
    active_only: bool = True,
    session: Session = Depends(get_session)
):
    """Get all bingo boards. By default, only returns active boards."""
    statement = select(BingoBoard)
    if active_only:
        statement = statement.where(BingoBoard.is_active == True)
    
    boards = session.exec(statement).all()
    return boards


@router.get("/boards/{board_id}", response_model=BingoBoardWithActivities)
def get_board_with_activities(board_id: uuid_pkg.UUID, session: Session = Depends(get_session)):
    """Get a bingo board with all its activities in order"""
    board = session.get(BingoBoard, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Get board activities with activity details
    statement = (
        select(BingoBoardActivity, Activity)
        .where(BingoBoardActivity.board_id == board_id)
        .join(Activity, BingoBoardActivity.activity_id == Activity.id)
        .order_by(BingoBoardActivity.position)
    )
    
    results = session.exec(statement).all()
    
    activities = [
        BingoBoardActivityResponse(
            position=board_activity.position,
            activity_id=activity.id,
            activity_title=activity.title,
            activity_description=activity.description,
            activity_points=activity.points
        )
        for board_activity, activity in results
    ]
    
    return BingoBoardWithActivities(
        id=board.id,
        created_at=board.created_at,
        title=board.title,
        description=board.description,
        is_active=board.is_active,
        activities=activities
    )


@router.get("/boards/{board_id}/progress/{user_id}", response_model=UserProgressResponse)
def get_user_board_progress(
    board_id: uuid_pkg.UUID,
    user_id: uuid_pkg.UUID,
    session: Session = Depends(get_session)
):
    """Get a user's progress on a specific bingo board"""
    # Verify board exists
    board = session.get(BingoBoard, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Verify user exists
    user = session.get(Profile, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get total activities on board
    total_statement = select(BingoBoardActivity).where(BingoBoardActivity.board_id == board_id)
    total_activities = len(session.exec(total_statement).all())
    
    # Get user's completed activities with positions
    progress_statement = (
        select(UserBoardProgress, BingoBoardActivity, Activity)
        .where(UserBoardProgress.board_id == board_id)
        .where(UserBoardProgress.user_id == user_id)
        .join(BingoBoardActivity, UserBoardProgress.activity_id == BingoBoardActivity.activity_id)
        .join(Activity, UserBoardProgress.activity_id == Activity.id)
    )
    
    progress_results = session.exec(progress_statement).all()
    
    completed_positions = [board_activity.position for _, board_activity, _ in progress_results]
    total_points = sum(activity.points for _, _, activity in progress_results)
    
    return UserProgressResponse(
        board_id=board_id,
        board_title=board.title,
        total_activities=total_activities,
        completed_activities=len(progress_results),
        total_points=total_points,
        completed_positions=completed_positions
    )


@router.post("/boards/{board_id}/complete", status_code=status.HTTP_201_CREATED)
def mark_activity_complete(
    board_id: uuid_pkg.UUID,
    user_id: uuid_pkg.UUID,
    activity_id: uuid_pkg.UUID,
    submission_id: uuid_pkg.UUID,
    session: Session = Depends(get_session)
):
    """
    Mark an activity as complete for a user on a specific board.
    Requires an approved submission.
    """
    from app.models.activity import Submission
    
    # Verify submission exists and is approved
    submission = session.get(Submission, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if submission.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission must be approved first"
        )
    
    # Verify the submission matches the user and activity
    if submission.user_id != user_id or submission.activity_id != activity_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission does not match user and activity"
        )
    
    # Check if already marked complete
    existing_statement = select(UserBoardProgress).where(
        UserBoardProgress.board_id == board_id,
        UserBoardProgress.user_id == user_id,
        UserBoardProgress.activity_id == activity_id
    )
    existing = session.exec(existing_statement).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Activity already marked as complete for this user on this board"
        )
    
    # Create progress record
    progress = UserBoardProgress(
        user_id=user_id,
        board_id=board_id,
        activity_id=activity_id,
        submission_id=submission_id
    )
    session.add(progress)
    session.commit()
    
    return {"message": "Activity marked as complete", "progress_id": str(progress.id)}


@router.patch("/boards/{board_id}", response_model=BingoBoardResponse)
def update_board_status(
    board_id: uuid_pkg.UUID,
    is_active: bool,
    session: Session = Depends(get_session)
):
    """Activate or deactivate a bingo board"""
    board = session.get(BingoBoard, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    board.is_active = is_active
    session.add(board)
    session.commit()
    session.refresh(board)
    return board
