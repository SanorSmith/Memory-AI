from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    content_ar = Column(Text, nullable=False)

    responses = relationship("Response", back_populates="topic")
    memory_strength = relationship("MemoryStrength", back_populates="topic", uselist=False)


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_user")
    started_at = Column(DateTime, default=datetime.utcnow)

    responses = relationship("Response", back_populates="session")


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    answer = Column(Text, nullable=False)
    time_seconds = Column(Integer, nullable=False)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="responses")
    session = relationship("Session", back_populates="responses")


class MemoryStrength(Base):
    __tablename__ = "memory_strength"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), unique=True, nullable=False)
    strength = Column(Float, default=0.0)
    last_reviewed = Column(DateTime, nullable=True)
    next_review = Column(DateTime, nullable=True)
    review_count = Column(Integer, default=0)

    topic = relationship("Topic", back_populates="memory_strength")
