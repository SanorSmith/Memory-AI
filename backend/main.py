from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

from database import get_db, engine, Base
from models import Topic, Session, Response, MemoryStrength
from chat import chat_with_claude, reset_conversation
from seed import seed_database

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Memory AI - AZ-900 Study Coach")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Models
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class AnswerRequest(BaseModel):
    topic_id: int
    answer: str
    time_seconds: int


class AnswerResponse(BaseModel):
    score: float
    memory_strength: float
    feedback: str


class TopicResponse(BaseModel):
    id: int
    name: str
    category: str
    content_ar: str


class MemoryMapItem(BaseModel):
    topic_id: int
    topic_name: str
    category: str
    strength: float
    last_reviewed: Optional[datetime]
    next_review: Optional[datetime]
    review_count: int


# Startup event
@app.on_event("startup")
def on_startup():
    seed_database()


# Routes
@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        response = chat_with_claude(request.message)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/reset")
def reset_chat():
    reset_conversation()
    return {"message": "Conversation reset successfully"}


@app.get("/topics", response_model=list[TopicResponse])
def get_topics(db: DBSession = Depends(get_db)):
    topics = db.query(Topic).all()
    return topics


@app.post("/answer", response_model=AnswerResponse)
def submit_answer(request: AnswerRequest, db: DBSession = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == request.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Calculate score based on time and answer length
    time_factor = max(0, 1 - (request.time_seconds / 120))  # Faster is better, up to 2 min
    answer_length_factor = min(1, len(request.answer) / 50)  # Longer answers generally better
    score = (time_factor * 0.3 + answer_length_factor * 0.7) * 100

    # Create or get session
    session = db.query(Session).order_by(Session.id.desc()).first()
    if not session or (datetime.utcnow() - session.started_at).seconds > 3600:
        session = Session(user_id="default_user")
        db.add(session)
        db.flush()

    # Save response
    response = Response(
        topic_id=request.topic_id,
        session_id=session.id,
        answer=request.answer,
        time_seconds=request.time_seconds,
        score=score
    )
    db.add(response)

    # Update memory strength
    memory = db.query(MemoryStrength).filter(MemoryStrength.topic_id == request.topic_id).first()
    if not memory:
        memory = MemoryStrength(topic_id=request.topic_id, strength=0.0, review_count=0)
        db.add(memory)

    # Spaced repetition algorithm
    memory.review_count += 1
    memory.last_reviewed = datetime.utcnow()

    # Calculate new strength
    old_strength = memory.strength
    if score >= 80:
        memory.strength = min(100, old_strength + (100 - old_strength) * 0.3)
    elif score >= 50:
        memory.strength = min(100, old_strength + (100 - old_strength) * 0.15)
    else:
        memory.strength = max(0, old_strength - 10)

    # Calculate next review time based on strength
    if memory.strength >= 90:
        memory.next_review = datetime.utcnow() + timedelta(days=7)
    elif memory.strength >= 70:
        memory.next_review = datetime.utcnow() + timedelta(days=3)
    elif memory.strength >= 50:
        memory.next_review = datetime.utcnow() + timedelta(days=1)
    else:
        memory.next_review = datetime.utcnow() + timedelta(hours=4)

    db.commit()

    # Generate feedback
    if score >= 80:
        feedback = "ممتاز! إجابة رائعة. الذاكرة تتعزز بشكل جيد."
    elif score >= 50:
        feedback = "جيد! لكن يمكنك تحسين إجابتك. حاول إضافة المزيد من التفاصيل."
    else:
        feedback = "تحتاج لمراجعة هذا الموضوع مرة أخرى. لا تقلق، التكرار يقوي الذاكرة!"

    return AnswerResponse(
        score=round(score, 1),
        memory_strength=round(memory.strength, 1),
        feedback=feedback
    )


@app.get("/memory-map", response_model=list[MemoryMapItem])
def get_memory_map(db: DBSession = Depends(get_db)):
    results = (
        db.query(Topic, MemoryStrength)
        .outerjoin(MemoryStrength, Topic.id == MemoryStrength.topic_id)
        .all()
    )

    memory_map = []
    for topic, memory in results:
        memory_map.append(MemoryMapItem(
            topic_id=topic.id,
            topic_name=topic.name,
            category=topic.category,
            strength=memory.strength if memory else 0.0,
            last_reviewed=memory.last_reviewed if memory else None,
            next_review=memory.next_review if memory else None,
            review_count=memory.review_count if memory else 0
        ))

    return memory_map


@app.get("/weak-topics", response_model=list[MemoryMapItem])
def get_weak_topics(db: DBSession = Depends(get_db)):
    results = (
        db.query(Topic, MemoryStrength)
        .outerjoin(MemoryStrength, Topic.id == MemoryStrength.topic_id)
        .filter(
            (MemoryStrength.strength < 60) | (MemoryStrength.strength == None)
        )
        .all()
    )

    weak_topics = []
    for topic, memory in results:
        weak_topics.append(MemoryMapItem(
            topic_id=topic.id,
            topic_name=topic.name,
            category=topic.category,
            strength=memory.strength if memory else 0.0,
            last_reviewed=memory.last_reviewed if memory else None,
            next_review=memory.next_review if memory else None,
            review_count=memory.review_count if memory else 0
        ))

    return weak_topics


@app.get("/tonight-review", response_model=list[MemoryMapItem])
def get_tonight_review(db: DBSession = Depends(get_db)):
    now = datetime.utcnow()
    tonight_end = now.replace(hour=23, minute=59, second=59)

    results = (
        db.query(Topic, MemoryStrength)
        .join(MemoryStrength, Topic.id == MemoryStrength.topic_id)
        .filter(
            (MemoryStrength.next_review <= tonight_end) |
            (MemoryStrength.strength < 50)
        )
        .order_by(MemoryStrength.strength.asc())
        .limit(10)
        .all()
    )

    review_topics = []
    for topic, memory in results:
        review_topics.append(MemoryMapItem(
            topic_id=topic.id,
            topic_name=topic.name,
            category=topic.category,
            strength=memory.strength,
            last_reviewed=memory.last_reviewed,
            next_review=memory.next_review,
            review_count=memory.review_count
        ))

    return review_topics


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
