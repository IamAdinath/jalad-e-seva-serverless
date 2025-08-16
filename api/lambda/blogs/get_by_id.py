"""
Get blogs by their Id
"""
import logging
import os
import boto3
from common.utils import build_response
from common.constants import StatusCodes, Headers
from common.s3 import get_s3_file_url
from boto3.dynamodb.conditions import Key

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
                {"message": "Environment variables BLOGS_TABLE or MEDIA_BUCKET not set."},
            )

        logger.info(f"Received event: {event}")

        # Get blog ID from path parameters
        blog_id = str(event["multiValueQueryStringParameters"].get("id")[0])
        if not blog_id:
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Missing 'id' path parameter."},
            )
        logger.info(f"Fetching blog with ID: {blog_id}")

        # Fetch blog from DynamoDB
        table = dynamodb.Table(BLOGS_TABLE)
        response = table.get_item(Key={"id": blog_id})        
        blog = response.get("Item")
        if not blog:
            return build_response(
                StatusCodes.NOT_FOUND,
                Headers.NOT_FOUND,
                {"message": "Blog not found."},
            )
        
        formatted_blog = {
            "id": blog.get("id"),
            "title": blog.get("title"),
            "summary": blog.get("content"),
            "image": get_s3_file_url(S3_BUCKET, blog.get("images")[0]),
            "htmlContent": blog.get("content"),
            "textContent": "",
            "startDate": blog.get("startDate"),
            "endDate": blog.get("endDate"),
            "category": blog.get("category"),
        }
        
        return build_response(
            StatusCodes.OK,
            Headers.DEFAULT,
            {"post": formatted_blog}
        )
    except Exception as e:
        logger.error(f"Error fetching blog by ID: {e}")
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"message": str(e)}
        )