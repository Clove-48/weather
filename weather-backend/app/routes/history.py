from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, History
from app.schemas import HistoryOut
from app.utils import get_current_user
from typing import List

router = APIRouter(prefix="/api/history")

@router.get("/", response_model=List[HistoryOut])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, description="Maximum number of records to return")
):
    try:
        history = db.query(History).filter(
            History.user_id == current_user.id
        ).order_by(History.query_time.desc()).limit(limit).all()
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/")
def clear_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db.query(History).filter(History.user_id == current_user.id).delete()
        db.commit()
        return {"message": "History cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{history_id}")
def delete_history_item(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        history_item = db.query(History).filter(
            History.id == history_id,
            History.user_id == current_user.id
        ).first()
        
        if not history_item:
            raise HTTPException(status_code=404, detail="History item not found")
        
        db.delete(history_item)
        db.commit()
        return {"message": "History item deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
def get_history_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        total_count = db.query(History).filter(History.user_id == current_user.id).count()
        return {"total_records": total_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
