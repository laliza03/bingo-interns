from sqlmodel import SQLModel, Field
from typing import Optional
from passlib.context import CryptContext
from datetime import datetime
import uuid as uuid_pkg

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Profile(SQLModel, table=True):
    __tablename__ = "profiles"
    
    id: uuid_pkg.UUID = Field(default_factory=uuid_pkg.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    email: str = Field(unique=True, index=True)
    password: str  # hashed password

    def set_password(self, plain_password: str):
        self.password = pwd_context.hash(plain_password)
    
    def verify_password(self, plain_password: str) -> bool:
        return pwd_context.verify(plain_password, self.password)


class UserCreate(SQLModel):
    email: str
    password: str


class UserResponse(SQLModel):
    id: uuid_pkg.UUID
    email: str
    created_at: datetime

