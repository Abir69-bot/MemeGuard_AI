#!/usr/bin/env python
"""
Simple test script for the /api/analyze endpoint.
Run this after starting the Flask server.
"""
import requests
import sys

# Create a simple test image (1x1 pixel red PNG)
png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x050\xb5\x1f\xb5\x00\x00\x00\x00IEND\xaeB`\x82'

def test_api():
    # Endpoint
    url = "http://127.0.0.1:5000/api/analyze"
    
    # Test 1: Image with no caption
    print("Test 1: Image with no caption")
    files = {"image": ("test.png", png_bytes, "image/png")}
    data = {}
    resp = requests.post(url, files=files, data=data)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}\n")
    
    # Test 2: Image with caption
    print("Test 2: Image with caption")
    files = {"image": ("test.png", png_bytes, "image/png")}
    data = {"caption": "This is a safe caption"}
    resp = requests.post(url, files=files, data=data)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}\n")

if __name__ == "__main__":
    try:
        test_api()
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure Flask server is running on http://127.0.0.1:5000")
        sys.exit(1)
