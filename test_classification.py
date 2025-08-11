#!/usr/bin/env python3
"""
Test script to verify malaria classification is working correctly
"""

import requests
import json
import os

def test_classification():
    """Test the classification API with sample images"""
    
    # Test images from your dataset
    test_images = [
        "infectedcell.png",
        "uninfectedcell.png"
    ]
    
    print("🧪 Testing Malaria Classification API...")
    print("=" * 50)
    
    for image_file in test_images:
        if not os.path.exists(image_file):
            print(f"⚠️  Skipping {image_file} - file not found")
            continue
            
        print(f"\n📸 Testing with: {image_file}")
        
        # Test with Parasitized/Uninfected labels (default)
        print("  Testing with 'Parasitized/Uninfected' labels:")
        try:
            with open(image_file, 'rb') as f:
                files = {'file': f}
                response = requests.post('http://localhost:8000/classify', files=files)
                
            if response.status_code == 200:
                result = response.json()
                print(f"    ✅ Prediction: {result['prediction']}")
                print(f"    📊 Confidence: {result['confidence']:.3f}")
                print(f"    ⏱️  Processing Time: {result['processing_time']:.3f}s")
                print(f"    🏷️  Label Type: {result.get('label_type', 'Parasitized/Uninfected')}")
            else:
                print(f"    ❌ Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"    ❌ Exception: {str(e)}")
        
        # Test with Infected/Uninfected labels
        print("  Testing with 'Infected/Uninfected' labels:")
        try:
            with open(image_file, 'rb') as f:
                files = {'file': f}
                params = {'use_infected_labels': 'true'}
                response = requests.post('http://localhost:8000/classify', files=files, params=params)
                
            if response.status_code == 200:
                result = response.json()
                print(f"    ✅ Prediction: {result['prediction']}")
                print(f"    📊 Confidence: {result['confidence']:.3f}")
                print(f"    ⏱️  Processing Time: {result['processing_time']:.3f}s")
                print(f"    🏷️  Label Type: {result.get('label_type', 'Infected/Uninfected')}")
            else:
                print(f"    ❌ Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"    ❌ Exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Test completed!")
    print("\n💡 Expected Results:")
    print("   - infectedcell.png should be classified as 'Parasitized' or 'Infected'")
    print("   - uninfectedcell.png should be classified as 'Uninfected'")

if __name__ == "__main__":
    test_classification() 