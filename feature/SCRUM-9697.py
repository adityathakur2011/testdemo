from fastapi import FastAPI, APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import os
from dotenv import load_dotenv

# Load environment variables (e.g. DATABASE_URL)
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=True, bind=engine)
Base = declarative_base()

# Define ORM model
class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)

# Create tables (for SQLite or first run)
Base.metadata.create_all(bind=engine)

# Pydantic schema
class ItemSchema(BaseModel):
    name: str
    description: str

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI app and router setup
app = FastAPI()

router = APIRouter(prefix="/items", tags=["Items"])

@router.get("/")
def get_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return items

@router.post("/")
def add_item(item: ItemSchema, db: Session = Depends(get_db)):
    db_item = Item(name=item.name, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return {"message": "Item added successfully", "item": db_item}

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI React full-stack application!"}
