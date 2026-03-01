from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.models.user import Profile, UserResponse
from app.models.activity import Submission, Activity
from app.models.bingo_board import UserBoardProgress
from app.db.connection import get_session
import uuid as uuid_pkg
from typing import List
from pydantic import BaseModel

router = APIRouter()


class LeaderboardEntry(BaseModel):
    user_id: uuid_pkg.UUID
    email: str
    total_points: int
    completed_activities: int
    rank: int


class UserStats(BaseModel):
    user_id: uuid_pkg.UUID
    email: str
    total_points: int
    completed_activities: int


@router.get("/leaderboard/top", response_model=List[LeaderboardEntry])
def get_top_users(
    limit: int = 5,
    session: Session = Depends(get_session)
):
    """
    Get top users by total points earned.
    Default returns top 5, but can be customized with limit parameter.
    """
    # Get approved submissions with activity points
    statement = (
        select(
            Profile.id,
            Profile.email,
            func.sum(Activity.points).label("total_points"),
            func.count(Submission.id).label("completed_activities")
        )
        .join(Submission, Profile.id == Submission.user_id)
        .join(Activity, Submission.activity_id == Activity.id)
        .group_by(Profile.id, Profile.email)
        .order_by(func.sum(Activity.points).desc())
        .limit(limit)
    )
    
    results = session.exec(statement).all()
    
    leaderboard = [
        LeaderboardEntry(
            user_id=user_id,
            email=email,
            total_points=total_points or 0,
            completed_activities=completed_activities or 0,
            rank=idx + 1
        )
        for idx, (user_id, email, total_points, completed_activities) in enumerate(results)
    ]
    
    return leaderboard


@router.get("/leaderboard/board/{board_id}", response_model=List[LeaderboardEntry])
def get_board_leaderboard(
    board_id: uuid_pkg.UUID,
    limit: int = 5,
    session: Session = Depends(get_session)
):
    """
    Get top users for a specific bingo board.
    Returns users ranked by points earned on that board only.
    """
    from app.models.bingo_board import BingoBoard
    
    # Verify board exists
    board = session.get(BingoBoard, board_id)
    if not board:
        return []
    
    statement = (
        select(
            Profile.id,
            Profile.email,
            func.sum(Activity.points).label("total_points"),
            func.count(UserBoardProgress.id).label("completed_activities")
        )
        .join(UserBoardProgress, Profile.id == UserBoardProgress.user_id)
        .join(Activity, UserBoardProgress.activity_id == Activity.id)
        .where(UserBoardProgress.board_id == board_id)
        .group_by(Profile.id, Profile.email)
        .order_by(func.sum(Activity.points).desc())
        .limit(limit)
    )
    
    results = session.exec(statement).all()
    
    leaderboard = [
        LeaderboardEntry(
            user_id=user_id,
            email=email,
            total_points=total_points or 0,
            completed_activities=completed_activities or 0,
            rank=idx + 1
        )
        for idx, (user_id, email, total_points, completed_activities) in enumerate(results)
    ]
    
    return leaderboard


@router.get("/stats/user/{user_id}", response_model=UserStats)
def get_user_stats(user_id: uuid_pkg.UUID, session: Session = Depends(get_session)):
    """Get comprehensive statistics for a specific user"""
    # Verify user exists
    user = session.get(Profile, user_id)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get all submissions with points
    stats_statement = (
        select(
            func.sum(Activity.points).label("total_points"),
            func.count(Submission.id).label("completed_activities")
        )
        .select_from(Submission)
        .join(Activity, Submission.activity_id == Activity.id)
        .where(Submission.user_id == user_id)
    )
    stats_result = session.exec(stats_statement).first()
    total_points = stats_result[0] or 0 if stats_result else 0
    completed_activities = stats_result[1] or 0 if stats_result else 0
    
    return UserStats(
        user_id=user_id,
        email=user.email,
        total_points=int(total_points),
        completed_activities=int(completed_activities)
    )


@router.get("/stats/global")
def get_global_stats(session: Session = Depends(get_session)):
    """Get overall platform statistics"""
    total_users = session.exec(select(func.count(Profile.id))).first() or 0
    total_activities = session.exec(select(func.count(Activity.id))).first() or 0
    total_submissions = session.exec(select(func.count(Submission.id))).first() or 0
    
    return {
        "total_users": total_users,
        "total_activities": total_activities,
        "total_submissions": total_submissions
    }
