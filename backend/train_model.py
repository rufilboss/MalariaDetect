import tensorflow as tf
import numpy as np
import os
import json
from datetime import datetime

def train_malaria_model():
    """Train and save the malaria classification model"""
    
    print("🦠 Training Malaria Classification Model...")
    
    # Model parameters
    width = 128
    height = 128
    
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
        target_size=(width, height),
        class_mode='binary',
        batch_size=16,
        subset='training'
    )
    
    # Load validation data
    validation_generator = datagen.flow_from_directory(
        directory='../cell-images-for-detecting-malaria/cell_images/',
        target_size=(width, height),
        class_mode='binary',
        batch_size=16,
        subset='validation'
    )
    
    print(f"Training samples: {len(train_generator)}")
    print(f"Validation samples: {len(validation_generator)}")
    
    # Create the model (same architecture as your notebook)
    model = tf.keras.Sequential([
        tf.keras.layers.Conv2D(16, (3, 3), activation='relu', input_shape=(128, 128, 3)),
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
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    print("Model architecture:")
    model.summary()
    
    # Early stopping callback
    early_stop = tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=3,
        restore_best_weights=True
    )
    
    # Train the model
    print("\n🚀 Starting training...")
    history = model.fit(
        train_generator,
        steps_per_epoch=len(train_generator),
        epochs=15,  # Reduced for faster training
        validation_data=validation_generator,
        validation_steps=len(validation_generator),
        callbacks=[early_stop],
        verbose=1
    )
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Save the model
    model_path = 'models/malaria_model.h5'
    model.save(model_path)
    print(f"\n✅ Model saved to: {model_path}")
    
    # Save model info
    model_info = {
        "created_at": datetime.utcnow().isoformat(),
        "input_shape": (128, 128, 3),
        "class_names": ["Uninfected", "Parasitized"],
        "architecture": "CNN",
        "version": "1.0",
        "training_samples": len(train_generator) * 16,
        "validation_samples": len(validation_generator) * 16,
        "final_accuracy": float(history.history['accuracy'][-1]),
        "final_val_accuracy": float(history.history['val_accuracy'][-1]),
        "model_path": model_path
    }
    
    with open('models/model_info.json', 'w') as f:
        json.dump(model_info, f, indent=2)
    
    print(f"✅ Model info saved to: models/model_info.json")
    print(f"\n📊 Training Results:")
    print(f"   Final Training Accuracy: {model_info['final_accuracy']:.4f}")
    print(f"   Final Validation Accuracy: {model_info['final_val_accuracy']:.4f}")
    print(f"   Total Parameters: {model.count_params():,}")
    
    return model, model_info

if __name__ == "__main__":
    train_malaria_model() 