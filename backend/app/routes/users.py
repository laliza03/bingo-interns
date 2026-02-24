from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.models.user import Profile, UserCreate, UserResponse
from app.db.connection import get_session
import uuid as uuid_pkg

router = APIRouter()


@router.post("/users/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, session: Session = Depends(get_session)):
    """
    Create a new user account.
    
    Checks if the email already exists before creating the account.
    """
    # Check if user with this email already exists
    statement = select(Profile).where(Profile.email == user_data.email)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = Profile(
        email=user_data.email,
        password=""  # Temporary, will be set by set_password
    )
    new_user.set_password(user_data.password)
    
    # Save to database
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return new_user


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
