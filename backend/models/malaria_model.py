import tensorflow as tf
import numpy as np
import time
import os
import json
import logging
from datetime import datetime
from typing import Tuple, Dict, Any
import cv2
from PIL import Image
import io

logger = logging.getLogger(__name__)

class MalariaClassifier:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self.model_path = "models/saved_model"
        self.model_info_path = "models/model_info.json"
        self.class_names = ["Uninfected", "Parasitized"]
        self.input_shape = (128, 128, 3)
        
    async def load_model(self):
        """Load the trained malaria classification model"""
        try:
            if os.path.exists(self.model_path):
                self.model = tf.keras.models.load_model(self.model_path)
                logger.info("Model loaded successfully from saved model")
            else:
                # If no saved model exists, create and train a new one
                await self._create_and_train_model()
            
            self.model_loaded = True
            logger.info("Malaria classifier model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise e
    
    async def _create_and_train_model(self):
        """Create and train a new model if no saved model exists"""
        try:
            logger.info("Creating new malaria classification model...")
            
            # Define the CNN architecture (same as in your notebook)
            self.model = tf.keras.Sequential([
                tf.keras.layers.Conv2D(16, (3, 3), activation='relu', input_shape=self.input_shape),
                tf.keras.layers.MaxPool2D(2, 2),
                tf.keras.layers.Dropout(0.2),
                
                tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
                tf.keras.layers.MaxPool2D(2, 2),
                tf.keras.layers.Dropout(0.3),
                
                tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
                tf.keras.layers.MaxPool2D(2, 2),
                tf.keras.layers.Dropout(0.3),
                
                tf.keras.layers.Flatten(),
                tf.keras.layers.Dense(64, activation='relu'),
                tf.keras.layers.Dropout(0.5),
                
                tf.keras.layers.Dense(1, activation='sigmoid')
            ])
            
            self.model.compile(
                optimizer='adam',
                loss='binary_crossentropy',
                metrics=['accuracy']
            )
            
            # Train the model with your dataset
            await self._train_model()
            
            # Save the model
            os.makedirs("models", exist_ok=True)
            self.model.save(self.model_path)
            
            # Save model info
            model_info = {
                "created_at": datetime.utcnow().isoformat(),
                "input_shape": self.input_shape,
                "class_names": self.class_names,
                "architecture": "CNN",
                "version": "1.0"
            }
            
            with open(self.model_info_path, 'w') as f:
                json.dump(model_info, f, indent=2)
                
            logger.info("New model created, trained, and saved successfully")
            
        except Exception as e:
            logger.error(f"Error creating model: {str(e)}")
            raise e
    
    async def _train_model(self):
        """Train the model with the malaria dataset"""
        try:
            # Data augmentation and preprocessing
            datagen = tf.keras.preprocessing.image.ImageDataGenerator(
                rescale=1/255.0,
                validation_split=0.2,
                rotation_range=20,
                width_shift_range=0.2,
                height_shift_range=0.2,
                shear_range=0.2,
                zoom_range=0.2,
                horizontal_flip=True,
                fill_mode='nearest'
            )
            
            # Load training data
            train_generator = datagen.flow_from_directory(
                directory='../cell-images-for-detecting-malaria/cell_images/',
                target_size=(128, 128),
                class_mode='binary',
                batch_size=16,
                subset='training'
            )
            
            # Load validation data
            validation_generator = datagen.flow_from_directory(
                directory='../cell-images-for-detecting-malaria/cell_images/',
                target_size=(128, 128),
                class_mode='binary',
                batch_size=16,
                subset='validation'
            )
            
            # Early stopping callback
            early_stop = tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=3,
                restore_best_weights=True
            )
            
            # Train the model
            history = self.model.fit(
                train_generator,
                steps_per_epoch=len(train_generator),
                epochs=15,  # Reduced for faster training
                validation_data=validation_generator,
                validation_steps=len(validation_generator),
                callbacks=[early_stop]
            )
            
            logger.info("Model training completed successfully")
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise e
    
    async def predict(self, image_data: bytes) -> Tuple[str, float, float]:
        """
        Predict malaria infection from image data
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Tuple of (prediction, confidence, processing_time)
        """
        if not self.model_loaded:
            raise Exception("Model not loaded")
        
        start_time = time.time()
        
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Preprocess image
            image = image.resize((128, 128))
            image_array = np.array(image) / 255.0
            
            # Ensure 3 channels
            if len(image_array.shape) == 2:
                image_array = np.stack((image_array,) * 3, axis=-1)
            elif image_array.shape[2] == 4:
                image_array = image_array[:, :, :3]
            
            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)
            
            # Make prediction
            prediction = self.model.predict(image_array, verbose=0)
            confidence = float(prediction[0][0])
            
            # Determine class
            if confidence > 0.5:
                result = "Parasitized"
                confidence_score = confidence
            else:
                result = "Uninfected"
                confidence_score = 1 - confidence
            
            processing_time = time.time() - start_time
            
            return result, confidence_score, processing_time
            
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            raise e
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model_loaded
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get model status and performance metrics"""
        try:
            model_info = {}
            
            if os.path.exists(self.model_info_path):
                with open(self.model_info_path, 'r') as f:
                    model_info = json.load(f)
            
            return {
                "model_loaded": self.model_loaded,
                "model_info": model_info,
                "input_shape": self.input_shape,
                "class_names": self.class_names,
                "total_parameters": self.model.count_params() if self.model else 0
            }
            
        except Exception as e:
            logger.error(f"Error getting model status: {str(e)}")
            return {"error": str(e)}
    
    async def retrain_model(self):
        """Retrain the model with new data"""
        try:
            logger.info("Starting model retraining...")
            
            # Create backup of current model
            if os.path.exists(self.model_path):
                backup_path = f"{self.model_path}_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                self.model.save(backup_path)
                logger.info(f"Current model backed up to {backup_path}")
            
            # Retrain the model
            await self._train_model()
            
            # Save the new model
            self.model.save(self.model_path)
            
            # Update model info
            model_info = {
                "created_at": datetime.utcnow().isoformat(),
                "input_shape": self.input_shape,
                "class_names": self.class_names,
                "architecture": "CNN",
                "version": "1.1",
                "retrained": True
            }
            
            with open(self.model_info_path, 'w') as f:
                json.dump(model_info, f, indent=2)
            
            logger.info("Model retraining completed successfully")
            
        except Exception as e:
            logger.error(f"Error retraining model: {str(e)}")
            raise e 