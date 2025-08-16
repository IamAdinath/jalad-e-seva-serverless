"""
Get blogs by their Id
"""
import logging
import os
import boto3
from common.utils import build_response
from common.constants import StatusCodes, Headers
from common.s3 import get_s3_file_url
logger = logging.getLogger()
logger.setLevel(logging.INFO)
dynamodb = boto3.resource("dynamodb")
def lambda_handler(event, context):
    try:
        BLOGS_TABLE = os.getenv("BLOGS_TABLE")
        S3_BUCKET = os.getenv("MEDIA_BUCKET")

        if not BLOGS_TABLE or not S3_BUCKET:
            return build_response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                Headers.INTERNAL_SERVER_ERRORS,
                {"message": "Environment variables BLOGS_TABLE or MEDIA_BUCKET not set."},
            )

        logger.info(f"Received event: {event}")

        # Get blog ID from path parameters
        blog_id = event["pathParameters"].get("id")
        if not blog_id:
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Missing 'id' path parameter."},
            )
        logger.info(f"Fetching blog with ID: {blog_id}")

        # Fetch blog from DynamoDB
        table = dynamodb.Table(BLOGS_TABLE)
        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("id").eq(blog_id)
        )
        blogs = response.get("Items", [])
        if not blogs:
            return build_response(
                StatusCodes.NOT_FOUND,
                Headers.NOT_FOUND,
                {"message": "Blog not found."},
            )
        
        blog = blogs[0]
        formatted_blog = {
            "id": blog.get("id"),
            "title": blog.get("title"),
            "content": blog.get("content"),
            "category": blog.get("category"),
            "image_url": get_s3_file_url(S3_BUCKET, blog.get("image", [])[0]),
            "created_at": blog.get("created_at"),
        }
        
        return build_response(
            StatusCodes.OK,
            Headers.OK,
            formatted_blog
        )
    except Exception as e:
        logger.error(f"Error fetching blog by ID: {e}")
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERRORS,
            {"message": str(e)}
        )