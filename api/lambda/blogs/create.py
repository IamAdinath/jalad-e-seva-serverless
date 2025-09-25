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
from json import loads  

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
                Headers.INTERNAL_SERVER_ERROR,
                {"message": "Environment variables BLOGS_TABLE or BLOG_IMAGES_BUCKET not set."},
            )

        logger.info(f"Received event: {event}")

        payload = loads(event.get("body"))
        if not payload:
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Missing request body."},
            )

        title = payload.get("title")
        content = payload.get("htmlContent")
        summary = payload.get("contentSummary")
        startDate = payload.get("startDate")
        endDate = payload.get("endDate")
        imageType = payload.get("imageType")
        category = payload.get("category")
        blog_status = payload.get("status", "published")

        if not title or not content or not imageType:
            logger.error(f"Invalid Title: {title} or Content: {content} or Images: {imageType}")
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Title and content and image are required."},
            )

        blog_id = str(uuid.uuid4())

        ttl_value = None
        if endDate:
            try:
                end_dt = datetime.fromisoformat(endDate)
                ttl_value = int((end_dt + timedelta(days=7)).timestamp())
            except Exception as e:
                logger.warning(f"Invalid endDate format: {endDate} ({e})")

        now = datetime.utcnow().isoformat()
        item = {
            "id": blog_id,
            "title": title,
            "htmlContent": content,  # Changed from 'content' to 'htmlContent'
            "contentSummary": summary,
            "startDate": startDate,
            "endDate": endDate,
            "category": category or "general",  # Ensure category is not None
            "status": blog_status,
            "image": f"{blog_id}{imageType}",
            "createdAt": now,
            "updatedAt": now,
            "publishedAt": now,  # Separate field for the GSI
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
