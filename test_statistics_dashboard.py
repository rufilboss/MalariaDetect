#!/usr/bin/env python3
"""
Test script for the Statistics Dashboard
This script demonstrates the statistics tracking by making multiple classifications
and then checking the updated statistics.
"""

import requests
import time
import json
from datetime import datetime

def test_statistics_dashboard():
    """Test the statistics dashboard functionality"""
    
    base_url = "http://localhost:8000"
    
    print("🚀 Testing Statistics Dashboard...")
    print("=" * 50)
    
    # Test 1: Check initial statistics
    print("\n📊 1. Initial Statistics:")
    try:
        response = requests.get(f"{base_url}/stats")
        stats = response.json()
        print(f"   ✅ Total classifications: {stats['total_classifications']}")
        print(f"   ✅ Model accuracy: {stats['model_accuracy']:.2%}")
        print(f"   ✅ Parasitized count: {stats['parasitized_count']}")
        print(f"   ✅ Uninfected count: {stats['uninfected_count']}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Test 2: Check model status
    print("\n🤖 2. Model Status:")
    try:
        response = requests.get(f"{base_url}/model/status")
        status = response.json()
        print(f"   ✅ Model loaded: {status['model_loaded']}")
        print(f"   ✅ Total parameters: {status['total_parameters']:,}")
        print(f"   ✅ Input shape: {status['input_shape']}")
        print(f"   ✅ Classes: {', '.join(status['class_names'])}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Test 3: Make some classifications to update statistics
    print("\n🔬 3. Making Classifications...")
    
    test_images = [
        ("infectedcell.png", "Parasitized"),
        ("uninfectedcell.png", "Uninfected"),
        ("infectedcell.png", "Parasitized"),
        ("uninfectedcell.png", "Uninfected"),
        ("infectedcell.png", "Parasitized")
    ]
    
    for i, (image_file, expected) in enumerate(test_images, 1):
        try:
            print(f"   📸 Classification {i}: {image_file}")
            
            with open(image_file, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{base_url}/classify", files=files)
                result = response.json()
            
            print(f"      ✅ Prediction: {result['prediction']}")
            print(f"      ✅ Confidence: {result['confidence']:.2%}")
            print(f"      ✅ Processing time: {result['processing_time']:.3f}s")
            
            # Small delay between requests
            time.sleep(0.5)
            
        except Exception as e:
            print(f"      ❌ Error: {e}")
    
    # Test 4: Check updated statistics
    print("\n📈 4. Updated Statistics:")
    try:
        response = requests.get(f"{base_url}/stats")
        stats = response.json()
        
        print(f"   ✅ Total classifications: {stats['total_classifications']}")
        print(f"   ✅ Average confidence: {stats['average_confidence']:.2%}")
        print(f"   ✅ Average processing time: {stats['average_processing_time']:.2f}ms")
        print(f"   ✅ Parasitized count: {stats['parasitized_count']}")
        print(f"   ✅ Uninfected count: {stats['uninfected_count']}")
        print(f"   ✅ Today's classifications: {stats['today_classifications']}")
        
        if stats['recent_processing_times']:
            print(f"   ✅ Recent processing times: {len(stats['recent_processing_times'])} samples")
            print(f"   ✅ Recent confidence scores: {len(stats['recent_confidence_scores'])} samples")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 5: Test batch classification
    print("\n📦 5. Batch Classification Test:")
    try:
        files = []
        for image_file in ["infectedcell.png", "uninfectedcell.png"]:
            with open(image_file, 'rb') as f:
                files.append(('files', (image_file, f.read(), 'image/png')))
        
        response = requests.post(f"{base_url}/classify/batch", files=files)
        batch_result = response.json()
        
        print(f"   ✅ Batch ID: {batch_result['batch_id']}")
        print(f"   ✅ Total images: {batch_result['total_images']}")
        print(f"   ✅ Total processing time: {batch_result['total_processing_time']:.3f}s")
        
        for result in batch_result['results']:
            print(f"      📸 {result['filename']}: {result['prediction']} ({result['confidence']:.2%})")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 6: Final statistics check
    print("\n📊 6. Final Statistics:")
    try:
        response = requests.get(f"{base_url}/stats")
        stats = response.json()
        
        print(f"   ✅ Total classifications: {stats['total_classifications']}")
        print(f"   ✅ Parasitized: {stats['parasitized_count']}")
        print(f"   ✅ Uninfected: {stats['uninfected_count']}")
        print(f"   ✅ Average confidence: {stats['average_confidence']:.2%}")
        print(f"   ✅ Average processing time: {stats['average_processing_time']:.2f}ms")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Statistics Dashboard Test Complete!")
    print("\n🌐 You can now view the beautiful Statistics Dashboard at:")
    print("   http://localhost:3000/statistics")
    print("\n📊 The dashboard will show:")
    print("   • Real-time model performance metrics")
    print("   • Classification distribution charts")
    print("   • Processing time trends")
    print("   • Model architecture information")
    print("   • System status indicators")

if __name__ == "__main__":
    test_statistics_dashboard() 