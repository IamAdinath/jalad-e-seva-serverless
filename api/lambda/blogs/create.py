"""
This package contains all the basic operations for S3.
"""

import boto3
from botocore.exceptions import ClientError
from typing import Optional, List
import logging
import os
logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))

s3_client = boto3.client('s3')


def get_s3_file(bucket: str, key: str) -> Optional[str]:
    """Retrieve a file's content from S3 as a UTF-8 string."""
    try:
        s3_obj = s3_client.get_object(Bucket=bucket, Key=key)
        return s3_obj['Body'].read().decode('utf-8')
    except ClientError as e:
        logging.error(f"Error fetching {key} from bucket {bucket}: {e}")
        return None


def put_s3_file(bucket: str, key: str, content: str) -> bool:
    """Upload a string content to S3."""
    try:
        if isinstance(content, str):
            content = content.encode('utf-8')
        s3_client.put_object(Bucket=bucket, Key=key, Body=content)
        return True
    except ClientError as e:
        logging.error(f"Error putting file to {bucket}/{key}: {e}")
        return False


def delete_s3_file(bucket: str, key: str) -> bool:
    """Delete a file from S3."""
    if not key:
        return False
    try:
        s3_client.delete_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        logging.error(f"Error deleting file {key} from bucket {bucket}: {e}")
        return False


def list_s3_files(bucket: str, prefix: str = '') -> List[str]:
    """List all file keys in a bucket with an optional prefix."""
    try:
        paginator = s3_client.get_paginator('list_objects_v2')
        result = []
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            contents = page.get('Contents', [])
            result.extend([obj['Key'] for obj in contents])
        return result
    except ClientError as e:
        logging.error(f"Error listing files from {bucket}/{prefix}: {e}")
        return []


def list_s3_files_by_suffix(bucket: str, suffix: str) -> List[str]:
    """List all file keys in a bucket that end with a specific suffix."""
    try:
        all_files = list_s3_files(bucket)
        return [f for f in all_files if f.endswith(suffix)]
    except ClientError as e:
        logging.error(f"Error listing files by suffix {suffix} in {bucket}: {e}")
        return []


def get_s3_file_url(bucket: str, key: str, expires_in: int = 3600) -> Optional[str]:
    """Generate a presigned URL for downloading a file."""
    try:
        return s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': key},
            ExpiresIn=expires_in
        )
    except ClientError as e:
        logging.error(f"Error generating URL for {bucket}/{key}: {e}")
        return None


def download_s3_file_to_local(bucket: str, key: str, local_path: str) -> bool:
    """Download a file from S3 and save it to a local path."""
    try:
        s3_client.download_file(bucket, key, local_path)
        return True
    except ClientError as e:
        logging.error(f"Error downloading {bucket}/{key} to {local_path}: {e}")
        return False


def upload_local_file_to_s3(local_path: str, bucket: str, key: str) -> bool:
    """Upload a local file to S3."""
    try:
        s3_client.upload_file(local_path, bucket, key)
        return True
    except ClientError as e:
        logging.error(f"Error uploading {local_path} to {bucket}/{key}: {e}")
        return False


def s3_file_exists(bucket: str, key: str) -> bool:
    """Check if a file exists in S3."""
    try:
        s3_client.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            return False
        logging.error(f"Error checking existence of {bucket}/{key}: {e}")
        return False