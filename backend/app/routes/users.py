from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.models.user import Profile, UserSync, UserResponse
from app.db.connection import get_session
import uuid as uuid_pkg

router = APIRouter()

@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID",
    description="Retrieve a single user profile by their UUID.",
    response_description="The requested user profile",
    responses={
        200: {"description": "User profile found"},
        404: {"description": "No profile exists for the given `user_id`"},
    },
)
def get_user(user_id: uuid_pkg.UUID, session: Session = Depends(get_session)):
    """Get a user by ID"""
    user = session.get(Profile, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get(
    "/users",
    response_model=list[UserResponse],
    summary="List all users",
    description="Returns every user profile stored in the database.",
    response_description="Array of user profiles",
)
def list_users(session: Session = Depends(get_session)):
    """List all users"""
    users = session.exec(select(Profile)).all()
    return users
