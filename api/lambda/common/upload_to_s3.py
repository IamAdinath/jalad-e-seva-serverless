import os
import json
import boto3
import logging
import base64
from urllib.parse import parse_qs
from email.message import EmailMessage
from io import BytesIO

from common.constants import StatusCodes, Headers
from common.utils import build_response
from common.s3 import put_s3_file, get_s3_file_url

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def parse_multipart_form_data(body, content_type):
    """Parse multipart form data from API Gateway event."""
    try:
        # Extract boundary from content type
        boundary = content_type.split('boundary=')[1]
        
        # Decode base64 body if it's encoded
        if isinstance(body, str):
            body = base64.b64decode(body)
        
        # Parse multipart data
        parts = body.split(f'--{boundary}'.encode())
        form_data = {}
        
        for part in parts:
            if b'Content-Disposition' in part:
                lines = part.split(b'\r\n')
                
                # Find content disposition line
                content_disposition = None
                for line in lines:
                    if b'Content-Disposition' in line:
                        content_disposition = line.decode()
                        break
                
                if content_disposition:
                    # Extract field name
                    if 'name="' in content_disposition:
                        field_name = content_disposition.split('name="')[1].split('"')[0]
                        
                        # Find the data (after double CRLF)
                        data_start = part.find(b'\r\n\r\n')
                        if data_start != -1:
                            data = part[data_start + 4:].rstrip(b'\r\n')
                            
                            # If it's a file field, keep as bytes, otherwise decode as string
                            if field_name == 'file':
                                form_data[field_name] = data
                            else:
                                form_data[field_name] = data.decode('utf-8')
        
        return form_data
    except Exception as e:
        logger.error(f"Error parsing multipart data: {str(e)}")
        return {}


def lambda_handler(event, context):
    logger.info(f"Received event: {event}")

    media_bucket = os.getenv("MEDIA_BUCKET")
    if not media_bucket:
        logger.error("MEDIA_BUCKET env variable is not set")
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"error": "MEDIA_BUCKET env variable not set"},
        )

    # Get content type and body
    headers = event.get("headers", {})
    content_type = headers.get("content-type") or headers.get("Content-Type", "")
    body = event.get("body", "")
    is_base64_encoded = event.get("isBase64Encoded", False)

    file_content = None
    file_name = None

    # Handle multipart form data (from FormData)
    if "multipart/form-data" in content_type:
        form_data = parse_multipart_form_data(body, content_type)
        file_content = form_data.get("file")
        file_name = form_data.get("filename")
        
        if not file_name and "file" in form_data:
            # Try to extract filename from content disposition if not provided separately
            file_name = "uploaded_file"
    
    # Handle JSON payload (legacy support)
    elif body:
        try:
            if is_base64_encoded:
                body = base64.b64decode(body).decode('utf-8')
            
            data = json.loads(body)
            file_content = data.get("file_content")
            file_name = data.get("file_name")
            
            # If file_content is base64 string, decode it
            if isinstance(file_content, str):
                try:
                    file_content = base64.b64decode(file_content)
                except:
                    file_content = file_content.encode('utf-8')
                    
        except json.JSONDecodeError:
            logger.error("Invalid JSON payload")
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.DEFAULT,
                {"error": "Invalid JSON payload"},
            )

    if not file_content:
        logger.error("File content is required")
        return build_response(
            StatusCodes.BAD_REQUEST,
            Headers.BAD_REQUEST,
            {"error": "File content is required"},
        )

    if not file_name:
        logger.error("File name is required")
        return build_response(
            StatusCodes.BAD_REQUEST,
            Headers.BAD_REQUEST,
            {"error": "File name is required"},
        )

    try:
        # Generate unique filename to avoid conflicts
        import uuid
        import time
        timestamp = int(time.time())
        unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}_{file_name}"
        
        # Determine content type from form data if available
        file_content_type = None
        if "multipart/form-data" in content_type and 'form_data' in locals():
            file_type = form_data.get("fileType")
            if file_type:
                file_content_type = file_type
        
        # Upload to S3
        success = put_s3_file(media_bucket, unique_filename, file_content, file_content_type)
        
        if not success:
            raise Exception("Failed to upload file to S3")
            
        file_url = get_s3_file_url(media_bucket, unique_filename)
        
        return build_response(
            StatusCodes.CREATED,
            Headers.DEFAULT,
            {
                "message": "File uploaded successfully", 
                "file_url": file_url,
                "filename": unique_filename
            },
        )
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"error": str(e)},
        )
