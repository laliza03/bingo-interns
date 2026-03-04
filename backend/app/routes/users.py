from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.models.user import Profile, UserSync, UserResponse
from app.db.connection import get_session
import uuid as uuid_pkg

router = APIRouter()


@router.post(
    "/users/sync",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Sync user profile",
    description=(
        "Upserts a profile row for a Supabase-authenticated user.\n\n"
        "Call this immediately after Supabase sign-up or sign-in so that all "
        "backend tables that reference `profiles.id` remain consistent.\n\n"
        "- If the profile already exists by `id`, the email and name are updated if changed.\n"
        "- If the `id` is new but the email belongs to a different profile, a **409** is returned."
    ),
    response_description="The created or updated user profile",
    responses={
        200: {"description": "Profile already existed and was returned (or updated)"},
        409: {"description": "Email already registered to a different user ID"},
    },
)
def sync_user_profile(user_data: UserSync, session: Session = Depends(get_session)):
    existing_by_id = session.get(Profile, user_data.id)
    if existing_by_id:
        changed = False
        if existing_by_id.email != user_data.email:
            existing_by_id.email = user_data.email
            changed = True
        if user_data.name is not None and existing_by_id.name != user_data.name:
            existing_by_id.name = user_data.name
            changed = True
        if changed:
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

    new_profile = Profile(id=user_data.id, email=user_data.email, name=user_data.name)
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)
    return new_profile


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
    summary="List users",
    description="Returns user profiles with pagination support.",
    response_description="Array of user profiles",
)
def list_users(
    skip: int = 0,
    limit: int = 50,
    session: Session = Depends(get_session),
):
    """List users (paginated)"""
    users = session.exec(select(Profile).offset(skip).limit(limit)).all()
    return users
