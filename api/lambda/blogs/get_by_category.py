"""
get blogs by category with pagination
"""
import os
import json
import logging
import boto3
from boto3.dynamodb.conditions import Key, Attr
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
                Headers.INTERNAL_SERVER_ERROR,
                {"message": "Environment variables BLOGS_TABLE or BLOG_IMAGES_BUCKET not set."},
            )

        logger.info(f"Received event: {event}")

        params = event.get("queryStringParameters") or {}
        category = params.get("category")
        limit = int(params.get("limit", 10))
        last_evaluated_key = params.get("last_evaluated_key")

        if not category:
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Missing 'category' query parameter."},
            )

        table = dynamodb.Table(BLOGS_TABLE)

        query_params = {
            "IndexName": "statusCategoryIndex",
            "KeyConditionExpression": Key("status").eq("published") & Key("category").eq(category),
            "Limit": limit
        }
        if last_evaluated_key:
            try:
                query_params["ExclusiveStartKey"] = json.loads(last_evaluated_key)
            except Exception as e:
                logger.warning(f"Invalid last_evaluated_key: {last_evaluated_key}, error: {e}")

        logger.info(f"Query params: {query_params}")
        
        try:
            response = table.query(**query_params)
            blogs = response.get("Items", [])
        except Exception as query_error:
            logger.error(f"GSI query failed: {query_error}")
            # Fallback to scan if GSI query fails
            logger.info("Falling back to table scan")
            scan_params = {
                "FilterExpression": Attr("category").eq(category) & Attr("status").eq("published"),
                "Limit": limit
            }
            
            response = table.scan(**scan_params)
            blogs = response.get("Items", [])
        
        logger.info(f"Found {len(blogs)} blogs for category {category}")
        logger.info(f"Response keys: {list(response.keys())}")

        if not blogs:
            return build_response(
                StatusCodes.OK,
                Headers.DEFAULT,
                {"blogs": [], "message": "No blogs found for the specified category."},
            )

        formatted_blogs = []
        for blog in blogs:
            image_path = blog.get("image")
            if image_path:
                image = get_s3_file_url(S3_BUCKET, image_path)
            else:
                image = ""

            formatted_blog = {
                "id": blog.get("id"),
                "title": blog.get("title"),
                "summary": blog.get("contentSummary", blog.get("content", "")),
                "image": image,
                "htmlContent": blog.get("htmlContent", blog.get("content", "")),
                "textContent": "",
                "startDate": blog.get("startDate"),
                "endDate": blog.get("endDate"),
                "category": blog.get("category"),
                "publishedAt": blog.get("publishedAt"),
                "status": blog.get("status")
            }
            formatted_blogs.append(formatted_blog)

        return build_response(
            StatusCodes.OK,
            Headers.DEFAULT,
            {
                "blogs": formatted_blogs,
                # "last_evaluated_key": json.dumps(response.get("LastEvaluatedKey")) if "LastEvaluatedKey" in response else None
            },
        )

    except Exception as e:
        logger.error(f"Error fetching blogs by category: {str(e)}", exc_info=True)
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"message": "An error occurred while fetching blogs."},
        )
