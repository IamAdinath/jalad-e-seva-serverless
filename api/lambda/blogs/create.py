import os
import uuid
import json
import base64
import logging
from datetime import datetime, timedelta
from requests_toolbelt.multipart import decoder
import boto3
from common.s3 import put_s3_file
from common.utils import build_response
from common.constants import StatusCodes, Headers

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")


def lambda_handler(event, context):
    try:
        BLOGS_TABLE = os.getenv("BLOGS_TABLE")
        S3_BUCKET = os.getenv("BLOG_IMAGES_BUCKET")

        if not BLOGS_TABLE or not S3_BUCKET:
            return build_response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                Headers.INTERNAL_SERVER_ERRORS,
                {"message": "Environment variables BLOGS_TABLE or BLOG_IMAGES_BUCKET not set."},
            )

        logger.info(f"Received event: {event}")

        # Get content-type header
        content_type = event["headers"].get("Content-Type") or event["headers"].get("content-type")
        if not content_type:
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Missing Content-Type header."},
            )

        # Ensure body is bytes
        if event.get("isBase64Encoded"):
            body_bytes = base64.b64decode(event["body"])
        else:
            # Convert string body to bytes explicitly
            body_bytes = event["body"].encode() if isinstance(event["body"], str) else event["body"]

        # Parse multipart form-data
        multipart_data = decoder.MultipartDecoder(body_bytes, content_type)
        fields = {}
        files = []

        for part in multipart_data.parts:
            content_disp = part.headers[b"Content-Disposition"].decode()
            if "filename=" in content_disp:
                files.append(part.content)
            else:
                # Extract the name field safely
                name_token = [token for token in content_disp.split(";") if "name=" in token]
                if name_token:
                    field_name = name_token[0].split("=")[1].strip('" ')
                    fields[field_name] = part.text

        # Extract form fields
        title = fields.get("title")
        content = fields.get("htmlContent")
        summary = fields.get("contentSummary")
        startDate = fields.get("startDate")
        endDate = fields.get("endDate")
        category = fields.get("category")
        blog_status = fields.get("status", "published")

        if not title or not content:
            logger.error(f"Invalid Title: {title} or Content: {content}")
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Title and content are required."},
            )

        # Generate blog ID
        blog_id = str(uuid.uuid4())

        # Upload files to S3
        image_urls = []
        if not files:
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "No files provided."},
            )
        
        for idx, file_content in enumerate(files):
            s3_key = f"blogs/{blog_id}-{idx}"
            uploaded = put_s3_file(S3_BUCKET, s3_key, file_content)
            if not uploaded:
                return build_response(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    Headers.INTERNAL_SERVER_ERROR,
                    {"message": f"Failed to upload file index {idx} to S3."},
                )
            image_urls.append(s3_key)

        # TTL = endDate + 7 days
        ttl_value = None
        if endDate:
            try:
                end_dt = datetime.fromisoformat(endDate)
                ttl_value = int((end_dt + timedelta(days=7)).timestamp())
            except Exception as e:
                logger.warning(f"Invalid endDate format: {endDate} ({e})")

        # Save blog in DynamoDB
        now = datetime.utcnow().isoformat()
        item = {
            "id": blog_id,
            "title": title,
            "content": content,
            "contentSummary": summary,
            "startDate": startDate,
            "endDate": endDate,
            "category": category,
            "status": blog_status,
            "images": image_urls,
            "createdAt": now,
            "updatedAt": now
        }
        if ttl_value:
            item["ttl"] = ttl_value

        table = dynamodb.Table(BLOGS_TABLE)
        table.put_item(Item=item)

        return build_response(
            StatusCodes.CREATED,
            Headers.DEFAULT,
            {"message": "Blog created successfully.", "id": blog_id, "status": "success"}
        )

    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"message": "Failed to create blog."},
        )
