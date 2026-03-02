from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid as uuid_pkg

class Profile(SQLModel, table=True):
    __tablename__ = "profiles"
    
    id: uuid_pkg.UUID = Field(default_factory=uuid_pkg.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = Field(default=None)


class UserSync(SQLModel):
    id: uuid_pkg.UUID
    email: str
    name: Optional[str] = None


class UserResponse(SQLModel):
    id: uuid_pkg.UUID
    email: str
    name: Optional[str] = None
    created_at: datetime

