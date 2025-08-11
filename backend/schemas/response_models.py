from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ClassificationResult(BaseModel):
    """Individual classification result"""
    result_id: str = Field(..., description="Unique result identifier")
    filename: str = Field(..., description="Original filename")
    prediction: str = Field(..., description="Classification result (Parasitized/Uninfected)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    processing_time: float = Field(..., description="Processing time in seconds")

class ClassificationResponse(BaseModel):
    """Response model for single image classification"""
    result_id: str = Field(..., description="Unique result identifier")
    filename: str = Field(..., description="Original filename")
    prediction: str = Field(..., description="Classification result")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: datetime = Field(..., description="Classification timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class BatchClassificationResponse(BaseModel):
    """Response model for batch image classification"""
    batch_id: str = Field(..., description="Unique batch identifier")
    total_images: int = Field(..., ge=0, description="Total number of processed images")
    results: List[ClassificationResult] = Field(..., description="List of classification results")
    total_processing_time: float = Field(..., description="Total processing time in seconds")
    timestamp: datetime = Field(..., description="Batch processing timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ModelStatusResponse(BaseModel):
    """Response model for model status"""
    model_loaded: bool = Field(..., description="Whether model is loaded")
    model_info: Dict[str, Any] = Field(..., description="Model information")
    input_shape: tuple = Field(..., description="Model input shape")
    class_names: List[str] = Field(..., description="Available class names")
    total_parameters: int = Field(..., description="Total model parameters")
    last_updated: Optional[datetime] = Field(None, description="Last model update timestamp")

class StatisticsResponse(BaseModel):
    """Response model for API statistics"""
    total_classifications: int = Field(..., description="Total number of classifications")
    total_users: int = Field(..., description="Total number of users")
    average_confidence: float = Field(..., description="Average confidence score")
    average_processing_time: float = Field(..., description="Average processing time")
    parasitized_count: int = Field(..., description="Number of parasitized classifications")
    uninfected_count: int = Field(..., description="Number of uninfected classifications")
    today_classifications: int = Field(..., description="Classifications made today")

class UserResultResponse(BaseModel):
    """Response model for user results"""
    user_id: str = Field(..., description="User identifier")
    results: List[ClassificationResult] = Field(..., description="User's classification results")
    total: int = Field(..., description="Total number of results")

class ErrorResponse(BaseModel):
    """Response model for errors"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SuccessResponse(BaseModel):
    """Response model for successful operations"""
    message: str = Field(..., description="Success message")
    status: str = Field(..., description="Operation status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Operation timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 