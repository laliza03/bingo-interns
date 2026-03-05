import os
from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv
from typing import Generator

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing!")

# SQLAlchemy requires 'postgresql+psycopg://' to use the psycopg v3 driver.
# Supabase and most tools give you a plain 'postgresql://' URL, so we
# normalise it here so either form works in the .env file.
if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1).replace(
        "postgresql://", "postgresql+psycopg://", 1
    )

# Supabase uses PostgreSQL
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300,
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

