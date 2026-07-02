from fastapi import FastAPI
import boto3
import os
from datetime import datetime

app = FastAPI()

BUCKET_NAME = os.getenv("AWS_S3_BUCKET", "dilip-app-backups-2026")

@app.get("/")
def read_root():
    return {"status": "healthy", "message": "Production App is running via HTTPS!"}

@app.post("/backup")
def trigger_backup():
    try:
        # Create a dummy backup file
        filename = f"backup-{datetime.now().strftime('%Y%m%d%H%M%S')}.txt"
        with open(filename, "w") as f:
            f.write("System backup completed successfully.")

        # Upload to S3 using the EC2 instance's IAM Role automatically
        s3 = boto3.client('s3')
        s3.upload_file(filename, BUCKET_NAME, filename)
        
        # Clean up local file
        os.remove(filename)
        return {"status": "success", "uploaded_file": filename}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
