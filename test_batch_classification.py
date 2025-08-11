#!/usr/bin/env python3
"""
Test script for batch classification endpoint
"""

import requests
import time
import json
from pathlib import Path

def test_batch_classification():
    """Test the batch classification endpoint"""
    
    # Test images (using the same test images we have)
    test_images = [
        "infectedcell.png",
        "uninfectedcell.png"
    ]
    
    # Check if test images exist
    for img in test_images:
        if not Path(img).exists():
            print(f"❌ Test image {img} not found")
            return
    
    print("🧪 Testing Batch Classification Endpoint")
    print("=" * 50)
    
    # Test 1: Basic batch classification
    print("\n1. Testing basic batch classification...")
    try:
        files = []
        for img in test_images:
            with open(img, 'rb') as f:
                files.append(('files', (img, f.read(), 'image/png')))
        
        response = requests.post(
            'http://localhost:8000/classify/batch',
            files=files,
            params={'use_infected_labels': False}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Processed {data['total_images']} images")
            print(f"   Total time: {data['total_processing_time']:.3f}s")
            print(f"   Average time per image: {data['total_processing_time']/data['total_images']:.3f}s")
            
            # Show individual results
            print("\n   Individual Results:")
            for result in data['results']:
                print(f"   - {result['filename']}: {result['prediction']} ({result['confidence']*100:.1f}%)")
                
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    # Test 2: Batch classification with infected labels
    print("\n2. Testing batch classification with infected labels...")
    try:
        files = []
        for img in test_images:
            with open(img, 'rb') as f:
                files.append(('files', (img, f.read(), 'image/png')))
        
        response = requests.post(
            'http://localhost:8000/classify/batch',
            files=files,
            params={'use_infected_labels': True}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Processed {data['total_images']} images")
            print(f"   Label type: {data['label_type']}")
            
            # Show individual results
            print("\n   Individual Results:")
            for result in data['results']:
                print(f"   - {result['filename']}: {result['prediction']} ({result['confidence']*100:.1f}%)")
                
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    # Test 3: Health check
    print("\n3. Testing health endpoint...")
    try:
        response = requests.get('http://localhost:8000/health')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed")
            print(f"   Model loaded: {data['model_loaded']}")
            print(f"   Status: {data['status']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Batch classification tests completed!")

if __name__ == "__main__":
    test_batch_classification() 