from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone
import uuid as uuid_pkg


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class BingoBoard(SQLModel, table=True):
    __tablename__ = "bingo_boards"
    
    id: uuid_pkg.UUID = Field(default_factory=uuid_pkg.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=_utcnow)
    title: str
    description: Optional[str] = None
    is_active: bool = Field(default=True)


class BingoBoardActivity(SQLModel, table=True):
    __tablename__ = "bingo_board_activities"
    
    id: uuid_pkg.UUID = Field(default_factory=uuid_pkg.uuid4, primary_key=True)
    board_id: uuid_pkg.UUID = Field(foreign_key="bingo_boards.id")
    activity_id: uuid_pkg.UUID = Field(foreign_key="activities.id")
    position: int  # 0-24 for the 25 boxes


class UserBoardProgress(SQLModel, table=True):
    __tablename__ = "user_board_progress"
    
    id: uuid_pkg.UUID = Field(default_factory=uuid_pkg.uuid4, primary_key=True)
    user_id: uuid_pkg.UUID = Field(foreign_key="profiles.id")
    board_id: uuid_pkg.UUID = Field(foreign_key="bingo_boards.id")
    activity_id: uuid_pkg.UUID = Field(foreign_key="activities.id")
    submission_id: uuid_pkg.UUID = Field(foreign_key="submissions.id")
    completed_at: Optional[datetime] = Field(default_factory=_utcnow)


# Request/Response Models
class BingoBoardCreate(SQLModel):
    title: str
    description: Optional[str] = None
    activity_ids: List[uuid_pkg.UUID]  # Must be exactly 25 activities


class BingoBoardResponse(SQLModel):
    id: uuid_pkg.UUID
    created_at: datetime
    title: str
    description: Optional[str] = None
    is_active: bool


class BingoBoardActivityResponse(SQLModel):
    position: int
    activity_id: uuid_pkg.UUID
    activity_title: str
    activity_description: str


class BingoBoardWithActivities(SQLModel):
    id: uuid_pkg.UUID
    created_at: datetime
    title: str
    description: Optional[str] = None
    is_active: bool
    activities: List[BingoBoardActivityResponse]


class UserProgressResponse(SQLModel):
    board_id: uuid_pkg.UUID
    board_title: str
    total_activities: int
    completed_activities: int
    completed_positions: List[int]
