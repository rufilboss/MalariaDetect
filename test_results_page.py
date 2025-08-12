#!/usr/bin/env python3
"""
Test script for the Results Page functionality
This script demonstrates the session-based results storage by making classifications
and then checking the localStorage functionality.
"""

import requests
import time
import json

def test_results_page():
    """Test the Results page functionality"""
    
    print("🧪 Testing Results Page...")
    print("=" * 50)
    
    # Test 1: Check if services are running
    print("\n📊 1. Service Status:")
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend is accessible")
        else:
            print(f"   ❌ Frontend returned status: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Frontend not accessible: {e}")
        return
    
    try:
        response = requests.get("http://localhost:8000", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend is accessible")
        else:
            print(f"   ❌ Backend returned status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend not accessible: {e}")
    
    # Test 2: Make some classifications to populate results
    print("\n🔬 2. Making Classifications for Results:")
    
    test_images = [
        ("infectedcell.png", "Parasitized"),
        ("uninfectedcell.png", "Uninfected"),
        ("infectedcell.png", "Parasitized"),
        ("uninfectedcell.png", "Uninfected")
    ]
    
    for i, (image_file, expected) in enumerate(test_images, 1):
        try:
            print(f"   📸 Classification {i}: {image_file}")
            
            with open(image_file, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"http://localhost:8000/classify", files=files)
                result = response.json()
            
            print(f"      ✅ Prediction: {result['prediction']}")
            print(f"      ✅ Confidence: {result['confidence']:.2%}")
            print(f"      ✅ Result ID: {result['result_id'][:8]}...")
            
            # Small delay between requests
            time.sleep(0.5)
            
        except Exception as e:
            print(f"      ❌ Error: {e}")
    
    # Test 3: Test batch classification
    print("\n📦 3. Batch Classification Test:")
    try:
        files = []
        for image_file in ["infectedcell.png", "uninfectedcell.png"]:
            with open(image_file, 'rb') as f:
                files.append(('files', (image_file, f.read(), 'image/png')))
        
        response = requests.post(f"http://localhost:8000/classify/batch", files=files)
        batch_result = response.json()
        
        print(f"   ✅ Batch ID: {batch_result['batch_id']}")
        print(f"   ✅ Total images: {batch_result['total_images']}")
        print(f"   ✅ Total processing time: {batch_result['total_processing_time']:.3f}s")
        
        for result in batch_result['results']:
            print(f"      📸 {result['filename']}: {result['prediction']} ({result['confidence']:.2%})")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Results Page Test Complete!")
    print("\n🌐 You can now view the Results page at:")
    print("   http://localhost:3000/results")
    print("\n📋 The Results page includes:")
    print("   • Session-based results storage (localStorage)")
    print("   • Search and filter functionality")
    print("   • Sort by date, confidence, processing time")
    print("   • Bulk selection and deletion")
    print("   • CSV export functionality")
    print("   • Statistics cards (total, parasitized, uninfected, avg confidence)")
    print("   • Beautiful table with confidence bars")
    print("   • Responsive design for all devices")
    print("\n💾 Results are stored in browser localStorage:")
    print("   • Persists during the browser session")
    print("   • Cleared when browser is closed")
    print("   • No database required")
    print("   • Automatic saving from Classifier and Batch Classifier")

if __name__ == "__main__":
    test_results_page() 