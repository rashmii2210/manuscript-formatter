import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def run_test():
    # Make sure you have a dummy 'test.docx' file in the same folder!
    filename = "test.docx"
    
    print(f"--- 1. Testing Upload Agent with {filename} ---")
    with open(filename, "rb") as f:
        upload_response = requests.post(f"{BASE_URL}/upload", files={"file": f})
    
    upload_data = upload_response.json()
    print(json.dumps(upload_data, indent=2))
    
    session_id = upload_data.get("session_id")
    
    if not session_id:
        print("Upload failed, stopping test.")
        return

    print("\n--- 2. Testing Formatting & Rule Engine Agents ---")
    format_payload = {
        "session_id": session_id,
        "target_style": "APA"
    }
    
    format_response = requests.post(f"{BASE_URL}/format", json=format_payload)
    print(json.dumps(format_response.json(), indent=2))

if __name__ == "__main__":
    run_test()