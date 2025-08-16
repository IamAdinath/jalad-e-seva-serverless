"""
get blogs by category
"""
import os
import uuid
import json
import base64
import logging
from datetime import datetime, timedelta
from requests_toolbelt.multipart import decoder
import boto3
from common.s3 import get_s3_file_url
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
        category = event["queryStringParameters"].get("category")
        if not category:
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Missing 'category' query parameter."},
            )
        logger.info(f"Fetching blogs for category: {category}")
        # Fetch blogs from DynamoDB
        table = dynamodb.Table(BLOGS_TABLE)
        response = table.query(
            IndexName="CategoryIndex",
            KeyConditionExpression=boto3.dynamodb.conditions.Key("category").eq(category)
        )
        blogs = response.get("Items", [])
        if not blogs:
            return build_response(
                StatusCodes.NOT_FOUND,
                Headers.NOT_FOUND,
                {"message": "No blogs found for the specified category."},
            )
        logger.info(f"Found {len(blogs)} blogs for category: {category}")
        # Format the response
        formatted_blogs = []
        for blog in blogs:
            formatted_blog = {
                "id": blog.get("id"),
                "title": blog.get("title"),
                "content": blog.get("content"),
                "category": blog.get("category"),
                "image_url": get_s3_file_url(S3_BUCKET, blog.get("image", [])[0]),
                "created_at": blog.get("created_at"),
            }
            formatted_blogs.append(formatted_blog)  
        return build_response(
            StatusCodes.OK,
            Headers.DEFAULT,
            {"blogs": formatted_blogs},
        )
    except Exception as e:
        logger.error(f"Error fetching blogs by category: {str(e)}")
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERRORS,
            {"message": "An error occurred while fetching blogs."},
        )