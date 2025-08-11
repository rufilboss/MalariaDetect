from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import uuid
import json
from datetime import datetime
from typing import List, Optional
import logging

from models.malaria_model import MalariaClassifier
from utils.image_processor import ImageProcessor
from utils.database import DatabaseManager
from utils.auth import AuthManager
from schemas.request_models import ClassificationRequest, BatchClassificationRequest
from schemas.response_models import ClassificationResponse, BatchClassificationResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Malaria Detect API",
    description="Advanced API for malaria cell classification with batch processing and real-time predictions",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
classifier = MalariaClassifier()
image_processor = ImageProcessor()
db_manager = DatabaseManager()
auth_manager = AuthManager()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("Starting Malaria Detect API...")
    await db_manager.initialize()
    await classifier.load_model()
    logger.info("API startup complete!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Malaria Detect API",
        "version": "2.0.0",
        "status": "healthy",
        "model_loaded": classifier.is_model_loaded()
    }

@app.post("/classify", response_model=ClassificationResponse)
async def classify_single_image(
    file: UploadFile = File(...),
    user_id: Optional[str] = None
):
    """
    Classify a single malaria cell image
    """
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Process image
        image_data = await file.read()
        processed_image = image_processor.preprocess_image(image_data)
        
        # Get prediction
        prediction, confidence, processing_time = await classifier.predict(processed_image)
        
        # Save result to database
        result_id = str(uuid.uuid4())
        await db_manager.save_classification_result(
            result_id=result_id,
            user_id=user_id,
            filename=file.filename,
            prediction=prediction,
            confidence=confidence,
            processing_time=processing_time
        )
        
        return ClassificationResponse(
            result_id=result_id,
            filename=file.filename,
            prediction=prediction,
            confidence=confidence,
            processing_time=processing_time,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error in single classification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify/batch", response_model=BatchClassificationResponse)
async def classify_batch_images(
    files: List[UploadFile] = File(...),
    user_id: Optional[str] = None
):
    """
    Classify multiple malaria cell images in batch
    """
    try:
        if len(files) > 50:  # Limit batch size
            raise HTTPException(status_code=400, detail="Maximum 50 images per batch")
        
        results = []
        total_processing_time = 0
        
        for file in files:
            if not file.content_type.startswith('image/'):
                continue
                
            # Process image
            image_data = await file.read()
            processed_image = image_processor.preprocess_image(image_data)
            
            # Get prediction
            prediction, confidence, processing_time = await classifier.predict(processed_image)
            total_processing_time += processing_time
            
            result_id = str(uuid.uuid4())
            results.append({
                "result_id": result_id,
                "filename": file.filename,
                "prediction": prediction,
                "confidence": confidence,
                "processing_time": processing_time
            })
            
            # Save to database
            await db_manager.save_classification_result(
                result_id=result_id,
                user_id=user_id,
                filename=file.filename,
                prediction=prediction,
                confidence=confidence,
                processing_time=processing_time
            )
        
        return BatchClassificationResponse(
            batch_id=str(uuid.uuid4()),
            total_images=len(results),
            results=results,
            total_processing_time=total_processing_time,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error in batch classification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{result_id}")
async def get_classification_result(result_id: str):
    """
    Get a specific classification result by ID
    """
    try:
        result = await db_manager.get_classification_result(result_id)
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        return result
    except Exception as e:
        logger.error(f"Error retrieving result: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/user/{user_id}")
async def get_user_results(user_id: str, limit: int = 50, offset: int = 0):
    """
    Get all classification results for a specific user
    """
    try:
        results = await db_manager.get_user_results(user_id, limit, offset)
        return {
            "user_id": user_id,
            "results": results,
            "total": len(results)
        }
    except Exception as e:
        logger.error(f"Error retrieving user results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_statistics():
    """
    Get API usage statistics
    """
    try:
        stats = await db_manager.get_statistics()
        return stats
    except Exception as e:
        logger.error(f"Error retrieving statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/model/retrain")
async def retrain_model(background_tasks: BackgroundTasks):
    """
    Trigger model retraining with new data
    """
    try:
        # This would typically be handled by a background task
        background_tasks.add_task(classifier.retrain_model)
        return {"message": "Model retraining started", "status": "processing"}
    except Exception as e:
        logger.error(f"Error starting model retraining: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/status")
async def get_model_status():
    """
    Get current model status and performance metrics
    """
    try:
        status = await classifier.get_model_status()
        return status
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 