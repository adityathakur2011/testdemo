from fastapi import FastAPI, APIRouter
from pydantic import BaseModel
from typing import List, Optional
import datetime

# ----------------------------
# Pydantic Schemas
# ----------------------------

class CalorieLog(BaseModel):
    id: Optional[int]
    food_item: str
    calorie_count: int
    portion_size: Optional[str]
    date_logged: Optional[str]

class CalorieResponse(BaseModel):
    id: int
    food_item: str
    calorie_count: int
    date_logged: str

# ----------------------------
# Service Layer
# ----------------------------

class CalorieService:
    def __init__(self):
        self.logs = []

    def log_calories(self, calorie_log: CalorieLog) -> CalorieResponse:
        log_entry = {
            **calorie_log.dict(),
            'id': len(self.logs) + 1,
            'date_logged': datetime.datetime.now().isoformat()
        }
        self.logs.append(log_entry)
        return CalorieResponse(**log_entry)

    def get_calorie_logs(self) -> List[CalorieResponse]:
        return [CalorieResponse(**log) for log in self.logs]

# ----------------------------
# Router Setup
# ----------------------------

router = APIRouter()
service = CalorieService()

@router.post('/log', response_model=CalorieResponse)
def log_calories(calorie_log: CalorieLog):
    return service.log_calories(calorie_log)

@router.get('/logs', response_model=List[CalorieResponse])
def get_logs():
    return service.get_calorie_logs()

# ----------------------------
# FastAPI App
# ----------------------------

app = FastAPI(title="Calorie Tracker API")

app.include_router(router, prefix="/api/v1", tags=["Calories"])
