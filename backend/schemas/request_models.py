from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ClassificationRequest(BaseModel):
    """Request model for single image classification"""
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    
class BatchClassificationRequest(BaseModel):
    """Request model for batch image classification"""
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    max_images: Optional[int] = Field(50, ge=1, le=100, description="Maximum number of images to process")

class ModelRetrainRequest(BaseModel):
    """Request model for model retraining"""
    dataset_path: str = Field(..., description="Path to new training dataset")
    epochs: Optional[int] = Field(20, ge=1, le=100, description="Number of training epochs")
    batch_size: Optional[int] = Field(16, ge=1, le=64, description="Training batch size")

class UserRegistrationRequest(BaseModel):
    """Request model for user registration"""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password")

class UserLoginRequest(BaseModel):
    """Request model for user login"""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")

class ResultFilterRequest(BaseModel):
    """Request model for filtering classification results"""
    user_id: Optional[str] = Field(None, description="Filter by user ID")
    prediction: Optional[str] = Field(None, description="Filter by prediction result")
    min_confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Minimum confidence threshold")
    start_date: Optional[datetime] = Field(None, description="Start date for filtering")
    end_date: Optional[datetime] = Field(None, description="End date for filtering")
    limit: Optional[int] = Field(50, ge=1, le=1000, description="Maximum number of results")
    offset: Optional[int] = Field(0, ge=0, description="Number of results to skip") 