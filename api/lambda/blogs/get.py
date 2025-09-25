"""
Get all blogs with pagination
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
        limit = int(params.get("limit", 10))
        last_evaluated_key = params.get("last_evaluated_key")
        status = params.get("status", "published")  # Default to published blogs

        table = dynamodb.Table(BLOGS_TABLE)

        # First try to scan the table to see if we have any data at all
        try:
            scan_response = table.scan(Limit=5)
            logger.info(f"Sample items from table: {scan_response.get('Items', [])}")
            logger.info(f"Table scan count: {scan_response.get('Count', 0)}")
        except Exception as scan_error:
            logger.error(f"Table scan failed: {scan_error}")
            return build_response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                Headers.INTERNAL_SERVER_ERROR,
                {"message": f"Table access failed: {str(scan_error)}"},
            )
        
        # Query using the status-publishedAt index to get published blogs ordered by date
        query_params = {
            "IndexName": "statusPublishedAtIndex",
            "KeyConditionExpression": Key("status").eq(status),
            "ScanIndexForward": False,  # Sort in descending order (newest first)
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
                "Limit": limit
            }
            if status and status != "all":
                scan_params["FilterExpression"] = Attr("status").eq(status)
            
            response = table.scan(**scan_params)
            blogs = response.get("Items", [])
        
        logger.info(f"Found {len(blogs)} blogs")
        logger.info(f"Response keys: {list(response.keys())}")

        if not blogs:
            return build_response(
                StatusCodes.OK,
                Headers.DEFAULT,
                {"blogs": [], "message": "No blogs found.", "query_params": query_params, "table_items_count": scan_response.get("Count", 0)},
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

        result = {
            "blogs": formatted_blogs,
            "count": len(formatted_blogs)
        }
        
        # Include pagination info if there are more items
        if "LastEvaluatedKey" in response:
            result["last_evaluated_key"] = json.dumps(response["LastEvaluatedKey"])
            result["has_more"] = True
        else:
            result["has_more"] = False

        return build_response(
            StatusCodes.OK,
            Headers.DEFAULT,
            result,
        )

    except Exception as e:
        logger.error(f"Error fetching blogs: {str(e)}", exc_info=True)
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"message": "An error occurred while fetching blogs."},
        )