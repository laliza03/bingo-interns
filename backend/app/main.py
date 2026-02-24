from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, text
from contextlib import asynccontextmanager
from app.db.connection import engine
from app.routes import users, activities, boards, leaderboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Tables already exist in Supabase, no need to create
    # If you need to create tables programmatically, uncomment:
    # from app.db.connection import create_db_and_tables
    # create_db_and_tables()
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    lifespan=lifespan,
    title="Bingo App API",
    description="Backend API for Bingo challenge game with image submissions and leaderboards",
    version="1.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(activities.router, prefix="/api", tags=["activities"])
app.include_router(boards.router, prefix="/api", tags=["bingo-boards"])
app.include_router(leaderboard.router, prefix="/api", tags=["leaderboard"])

@app.get("/")
def root():
    return {
        "message": "Bingo App API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def test_database():
    """Test database connection"""
    try:
        with Session(engine) as session:
            result = session.exec(text("SELECT 1")).scalar_one()
            return {"status": "healthy", "database_connection": "ok", "result": int(result)}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


