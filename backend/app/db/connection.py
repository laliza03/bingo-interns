import os
from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv
from typing import Generator

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing!")

# Supabase uses PostgreSQL
engine = create_engine(
    DATABASE_URL,
    echo=True,
)


def create_db_and_tables():
    """
    Create all database tables.
    Note: For Supabase, tables are already created, so this is optional.
    Only use if you need to create tables programmatically.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Database session dependency for FastAPI routes"""
    with Session(engine) as session:
        yield session

