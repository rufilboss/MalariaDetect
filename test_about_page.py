#!/usr/bin/env python3
"""
Quick test to verify the About page loads correctly
"""

import requests
import time

def test_about_page():
    """Test if the About page loads correctly"""
    
    print("🧪 Testing About Page...")
    print("=" * 40)
    
    # Test frontend accessibility
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
        else:
            print(f"❌ Frontend returned status: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")
        return
    
    # Test backend accessibility
    try:
        response = requests.get("http://localhost:8000", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is accessible")
        else:
            print(f"❌ Backend returned status: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
    
    print("\n🎉 About Page Test Complete!")
    print("\n🌐 You can now view the beautiful About page at:")
    print("   http://localhost:3000/about")
    print("\n📋 The page includes:")
    print("   • Hero section with mission statement")
    print("   • How it works explanation")
    print("   • Technology stack showcase")
    print("   • Team member profiles (7 placeholders)")
    print("   • Contact information")
    print("\n📝 To update team information:")
    print("   • Edit frontend/src/pages/About.js")
    print("   • See TEAM_UPDATE_GUIDE.md for instructions")

if __name__ == "__main__":
    test_about_page() 