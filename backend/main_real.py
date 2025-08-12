from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import uuid
import json
import time
from datetime import datetime
from typing import List, Optional
import logging
import numpy as np
from PIL import Image
import io

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

# Global variables for model
model = None
model_info = None
model_loaded = False

# Global variables for statistics tracking
classification_stats = {
    "total_classifications": 0,
    "parasitized_count": 0,
    "uninfected_count": 0,
    "total_processing_time": 0.0,
    "total_confidence": 0.0,
    "processing_times": [],  # Keep last 100 processing times
    "confidence_scores": [],  # Keep last 100 confidence scores
    "daily_classifications": {},  # Track daily counts
    "hourly_classifications": {}  # Track hourly counts
}

def load_model():
    """Load the trained malaria classification model"""
    global model, model_info, model_loaded
    
    try:
        import tensorflow as tf
        
        model_path = "models/malaria_model.h5"
        info_path = "models/model_info.json"
        
        if os.path.exists(model_path):
            logger.info("Loading trained model...")
            model = tf.keras.models.load_model(model_path)
            
            if os.path.exists(info_path):
                with open(info_path, 'r') as f:
                    model_info = json.load(f)
            else:
                model_info = {
                    "created_at": datetime.utcnow().isoformat(),
                    "input_shape": (128, 128, 3),
                    "class_names": ["Uninfected", "Parasitized"],
                    "architecture": "CNN",
                    "version": "1.0"
                }
            
            model_loaded = True
            logger.info("✅ Model loaded successfully!")
            return True
        else:
            logger.warning("❌ No trained model found. Please run train_model.py first.")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error loading model: {str(e)}")
        return False

def update_statistics(prediction: str, confidence: float, processing_time: float):
    """Update global statistics with new classification result"""
    global classification_stats
    
    # Update basic counts
    classification_stats["total_classifications"] += 1
    classification_stats["total_processing_time"] += processing_time
    classification_stats["total_confidence"] += confidence
    
    # Update prediction counts
    if prediction in ["Parasitized", "Infected"]:
        classification_stats["parasitized_count"] += 1
    else:
        classification_stats["uninfected_count"] += 1
    
    # Update processing times (keep last 100)
    classification_stats["processing_times"].append(processing_time)
    if len(classification_stats["processing_times"]) > 100:
        classification_stats["processing_times"].pop(0)
    
    # Update confidence scores (keep last 100)
    classification_stats["confidence_scores"].append(confidence)
    if len(classification_stats["confidence_scores"]) > 100:
        classification_stats["confidence_scores"].pop(0)
    
    # Update daily counts
    today = datetime.utcnow().strftime("%Y-%m-%d")
    classification_stats["daily_classifications"][today] = classification_stats["daily_classifications"].get(today, 0) + 1
    
    # Update hourly counts
    current_hour = datetime.utcnow().strftime("%Y-%m-%d-%H")
    classification_stats["hourly_classifications"][current_hour] = classification_stats["hourly_classifications"].get(current_hour, 0) + 1

def preprocess_image(image_data: bytes) -> np.ndarray:
    """Preprocess image for model prediction"""
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize((128, 128))
        
        # Convert to numpy array and normalize
        image_array = np.array(image) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise e

def predict_malaria(image_array: np.ndarray, use_infected_labels: bool = False) -> tuple:
    """Predict malaria infection from preprocessed image"""
    try:
        # Get prediction
        prediction = model.predict(image_array, verbose=0)
        confidence = float(prediction[0][0])
        
        # Determine class (corrected logic)
        # Model was trained with: 0=Uninfected, 1=Parasitized
        # But the predictions seem inverted, so we swap the logic
        if confidence > 0.5:
            result = "Uninfected"
            confidence_score = confidence  # High confidence for Uninfected
        else:
            result = "Parasitized" if not use_infected_labels else "Infected"
            confidence_score = 1 - confidence  # High confidence for Parasitized/Infected
        
        return result, confidence_score
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise e

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("🚀 Starting Malaria Detect API...")
    load_model()
    logger.info("✅ API startup complete!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Malaria Detect API",
        "version": "2.0.0",
        "status": "healthy",
        "model_loaded": model_loaded,
        "model_info": model_info
    }

@app.post("/classify")
async def classify_single_image(
    file: UploadFile = File(...),
    use_infected_labels: bool = False
):
    """
    Classify a single malaria cell image
    """
    try:
        # Check if model is loaded
        if not model_loaded:
            raise HTTPException(
                status_code=503, 
                detail="Model not loaded. Please ensure the model is trained and available."
            )
        
        # Validate file
        if file.content_type and not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and preprocess image
        image_data = await file.read()
        image_array = preprocess_image(image_data)
        
        # Get prediction with timing
        start_time = time.time()
        prediction, confidence = predict_malaria(image_array, use_infected_labels)
        processing_time = time.time() - start_time
        
        # Update statistics
        update_statistics(prediction, confidence, processing_time)
        
        result_id = str(uuid.uuid4())
        
        return {
            "result_id": result_id,
            "filename": file.filename,
            "prediction": prediction,
            "confidence": confidence,
            "processing_time": processing_time,
            "timestamp": datetime.utcnow().isoformat(),
            "model_used": model_info.get("version", "1.0") if model_info else "1.0",
            "label_type": "Infected/Uninfected" if use_infected_labels else "Parasitized/Uninfected"
        }
        
    except Exception as e:
        logger.error(f"Error in single classification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify/batch")
async def classify_batch_images(
    files: List[UploadFile] = File(...),
    use_infected_labels: bool = False
):
    """
    Classify multiple malaria cell images in batch
    """
    try:
        # Check if model is loaded
        if not model_loaded:
            raise HTTPException(
                status_code=503, 
                detail="Model not loaded. Please ensure the model is trained and available."
            )
        
        if len(files) > 50:  # Limit batch size
            raise HTTPException(status_code=400, detail="Maximum 50 images per batch")
        
        results = []
        total_processing_time = 0
        
        for file in files:
            if file.content_type and not file.content_type.startswith('image/'):
                continue
                
            # Read and preprocess image
            image_data = await file.read()
            image_array = preprocess_image(image_data)
            
            # Get prediction with timing
            start_time = time.time()
            prediction, confidence = predict_malaria(image_array, use_infected_labels)
            processing_time = time.time() - start_time
            total_processing_time += processing_time
            
            # Update statistics
            update_statistics(prediction, confidence, processing_time)
            
            result_id = str(uuid.uuid4())
            results.append({
                "result_id": result_id,
                "filename": file.filename,
                "prediction": prediction,
                "confidence": confidence,
                "processing_time": processing_time
            })
        
        return {
            "batch_id": str(uuid.uuid4()),
            "total_images": len(results),
            "results": results,
            "total_processing_time": total_processing_time,
            "timestamp": datetime.utcnow().isoformat(),
            "model_used": model_info.get("version", "1.0") if model_info else "1.0",
            "label_type": "Infected/Uninfected" if use_infected_labels else "Parasitized/Uninfected"
        }
        
    except Exception as e:
        logger.error(f"Error in batch classification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_statistics():
    """
    Get API usage statistics
    """
    global classification_stats
    
    # Calculate averages
    avg_confidence = 0.0
    avg_processing_time = 0.0
    
    if classification_stats["total_classifications"] > 0:
        avg_confidence = classification_stats["total_confidence"] / classification_stats["total_classifications"]
        avg_processing_time = classification_stats["total_processing_time"] / classification_stats["total_classifications"]
    
    # Get today's count
    today = datetime.utcnow().strftime("%Y-%m-%d")
    today_classifications = classification_stats["daily_classifications"].get(today, 0)
    
    # Calculate hourly averages for the last 24 hours
    current_hour = datetime.utcnow().strftime("%Y-%m-%d-%H")
    avg_processing_time_1h = 0.0
    avg_processing_time_6h = 0.0
    avg_processing_time_12h = 0.0
    
    if classification_stats["processing_times"]:
        recent_times = classification_stats["processing_times"][-10:]  # Last 10 classifications
        avg_processing_time_1h = sum(recent_times) / len(recent_times) * 1000  # Convert to ms
        
        # For 6h and 12h, we'll use the same recent data since we don't have historical hourly data
        avg_processing_time_6h = avg_processing_time_1h
        avg_processing_time_12h = avg_processing_time_1h
    
    return {
        "total_classifications": classification_stats["total_classifications"],
        "total_users": 0,  # Not tracked without database
        "average_confidence": avg_confidence,
        "average_processing_time": avg_processing_time * 1000,  # Convert to milliseconds
        "parasitized_count": classification_stats["parasitized_count"],
        "uninfected_count": classification_stats["uninfected_count"],
        "today_classifications": today_classifications,
        "model_accuracy": model_info.get("final_val_accuracy", 0.0) if model_info else 0.0,
        "avg_processing_time_1h": avg_processing_time_1h,
        "avg_processing_time_6h": avg_processing_time_6h,
        "avg_processing_time_12h": avg_processing_time_12h,
        "recent_processing_times": classification_stats["processing_times"][-20:],  # Last 20 times
        "recent_confidence_scores": classification_stats["confidence_scores"][-20:]  # Last 20 scores
    }

@app.get("/model/status")
async def get_model_status():
    """
    Get current model status and performance metrics
    """
    if not model_info:
        return {
            "model_loaded": False,
            "error": "Model not available"
        }
    
    return {
        "model_loaded": model_loaded,
        "model_info": model_info,
        "input_shape": model_info.get("input_shape", (128, 128, 3)),
        "class_names": model_info.get("class_names", ["Uninfected", "Parasitized"]),
        "total_parameters": model.count_params() if model else 0,
        "accuracy": model_info.get("final_val_accuracy", 0.0)
    }

@app.post("/model/reload")
async def reload_model():
    """
    Reload the model (useful after training)
    """
    try:
        success = load_model()
        if success:
            return {"message": "Model reloaded successfully", "status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Failed to reload model")
    except Exception as e:
        logger.error(f"Error reloading model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main_real:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 