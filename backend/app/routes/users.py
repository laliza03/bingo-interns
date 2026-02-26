from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.models.user import Profile, UserSync, UserResponse
from app.db.connection import get_session
import uuid as uuid_pkg

router = APIRouter()


@router.post("/users/sync", response_model=UserResponse, status_code=status.HTTP_200_OK)
def sync_user_profile(user_data: UserSync, session: Session = Depends(get_session)):
    """
    Ensure a profile row exists for a Supabase-authenticated user.

    This endpoint is intended to be called after Supabase sign-up/sign-in so
    backend tables that reference profiles.id continue to work.
    """
    existing_by_id = session.get(Profile, user_data.id)
    if existing_by_id:
        if existing_by_id.email != user_data.email:
            existing_by_id.email = user_data.email
            session.add(existing_by_id)
            session.commit()
            session.refresh(existing_by_id)
        return existing_by_id

    existing_by_email = session.exec(
        select(Profile).where(Profile.email == user_data.email)
    ).first()
    if existing_by_email and existing_by_email.id != user_data.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists for another profile",
        )

    new_profile = Profile(id=user_data.id, email=user_data.email)
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)
    return new_profile


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: uuid_pkg.UUID, session: Session = Depends(get_session)):
    """Get a user by ID"""
    user = session.get(Profile, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/users", response_model=list[UserResponse])
def list_users(session: Session = Depends(get_session)):
    """List all users"""
    users = session.exec(select(Profile)).all()
    return users
