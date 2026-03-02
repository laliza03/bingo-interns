from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid as uuid_pkg


class Activity(SQLModel, table=True):
    __tablename__ = "activities"
    
    id: uuid_pkg.UUID = Field(default_factory=uuid_pkg.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    title: str
    description: str
    isImageRequired: bool = False
    index: Optional[int] = None

class ActivityCreate(SQLModel):
    title: str
    description: str
    points: int


class ActivityResponse(SQLModel):
    id: uuid_pkg.UUID
    created_at: datetime
    title: str
    description: str
    isImageRequired: bool
    index: Optional[int] = None


class Submission(SQLModel, table=True):
    __tablename__ = "submissions"
    
    id: uuid_pkg.UUID = Field(default_factory=uuid_pkg.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    user_id: uuid_pkg.UUID = Field(foreign_key="profiles.id")
    activity_id: uuid_pkg.UUID = Field(foreign_key="activities.id")


class SubmissionCreate(SQLModel):
    user_id: uuid_pkg.UUID
    activity_id: uuid_pkg.UUID


class SubmissionResponse(SQLModel):
    id: uuid_pkg.UUID
    created_at: datetime
    user_id: uuid_pkg.UUID
    activity_id: uuid_pkg.UUID