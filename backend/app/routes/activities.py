from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.models.activity import (
    Activity, ActivityCreate, ActivityResponse,
    Submission, SubmissionCreate, SubmissionResponse
)
from app.db.connection import get_session
import uuid as uuid_pkg
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()


# Additional request models
class SubmissionUpdate(BaseModel):
    status: str  # "pending", "approved", "rejected"


class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    points: Optional[int] = None


# ============= ACTIVITY ROUTES =============

@router.post("/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(activity_data: ActivityCreate, session: Session = Depends(get_session)):
    """Create a new activity"""
    new_activity = Activity(**activity_data.model_dump())
    session.add(new_activity)
    session.commit()
    session.refresh(new_activity)
    return new_activity


@router.get("/activities", response_model=List[ActivityResponse])
def get_activities(session: Session = Depends(get_session)):
    """Get all activities"""
    statement = select(Activity)
    activities = session.exec(statement).all()
    return activities


@router.get("/activities/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: uuid_pkg.UUID, session: Session = Depends(get_session)):
    """Get an activity by ID"""
    activity = session.get(Activity, activity_id)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    return activity


@router.put("/activities/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: uuid_pkg.UUID,
    activity_data: ActivityUpdate,
    session: Session = Depends(get_session)
):
    """Update an activity"""
    activity = session.get(Activity, activity_id)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    # Update only provided fields
    update_data = activity_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(activity, key, value)
    
    session.add(activity)
    session.commit()
    session.refresh(activity)
    return activity


@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: uuid_pkg.UUID, session: Session = Depends(get_session)):
    """Delete an activity"""
    activity = session.get(Activity, activity_id)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    session.delete(activity)
    session.commit()
    return None


# ============= SUBMISSION ROUTES =============

@router.post("/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(submission_data: SubmissionCreate, session: Session = Depends(get_session)):
    """
    Create a new submission for an activity.
    User submits proof (image_url) that they completed an activity.
    """
    # Verify user exists
    from app.models.user import Profile
    user = session.get(Profile, submission_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify activity exists
    activity = session.get(Activity, submission_data.activity_id)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    # Check if user already submitted for this activity
    statement = select(Submission).where(
        Submission.user_id == submission_data.user_id,
        Submission.activity_id == submission_data.activity_id
    )
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already submitted for this activity"
        )
    
    new_submission = Submission(**submission_data.model_dump())
    session.add(new_submission)
    session.commit()
    session.refresh(new_submission)
    return new_submission


@router.get("/submissions/user/{user_id}", response_model=List[SubmissionResponse])
def get_user_submissions(user_id: uuid_pkg.UUID, session: Session = Depends(get_session)):
    """Get all submissions for a specific user"""
    statement = select(Submission).where(Submission.user_id == user_id)
    submissions = session.exec(statement).all()
    return submissions


@router.get("/submissions/activity/{activity_id}", response_model=List[SubmissionResponse])
def get_activity_submissions(activity_id: uuid_pkg.UUID, session: Session = Depends(get_session)):
    """Get all submissions for a specific activity"""
    statement = select(Submission).where(Submission.activity_id == activity_id)
    submissions = session.exec(statement).all()
    return submissions


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission(submission_id: uuid_pkg.UUID, session: Session = Depends(get_session)):
    """Get a specific submission"""
    submission = session.get(Submission, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    return submission


@router.patch("/submissions/{submission_id}/status", response_model=SubmissionResponse)
def update_submission_status(
    submission_id: uuid_pkg.UUID,
    status_update: SubmissionUpdate,
    session: Session = Depends(get_session)
):
    """
    Update submission status (approve/reject).
    Status options: 'pending', 'approved', 'rejected'
    """
    submission = session.get(Submission, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    valid_statuses = ["pending", "approved", "rejected"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    submission.status = status_update.status
    session.add(submission)
    session.commit()
    session.refresh(submission)
    return submission