"""
Debug function to scan all items in the blogs table
"""
import os
import logging
import boto3
from common.utils import build_response
from common.constants import StatusCodes, Headers

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")

def lambda_handler(event, context):
    try:
        BLOGS_TABLE = os.getenv("BLOGS_TABLE")

        if not BLOGS_TABLE:
            return build_response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                Headers.INTERNAL_SERVER_ERROR,
                {"message": "Environment variable BLOGS_TABLE not set."},
            )

        logger.info(f"Scanning table: {BLOGS_TABLE}")

        table = dynamodb.Table(BLOGS_TABLE)
        
        # Scan all items (use with caution in production)
        response = table.scan(Limit=10)  # Limit to 10 items for debugging
        items = response.get("Items", [])
        
        logger.info(f"Found {len(items)} items")
        for item in items:
            logger.info(f"Item: {item}")

        return build_response(
            StatusCodes.OK,
            Headers.DEFAULT,
            {
                "message": f"Found {len(items)} items",
                "items": items,
                "table_name": BLOGS_TABLE
            },
        )

    except Exception as e:
        logger.error(f"Error scanning table: {str(e)}", exc_info=True)
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"message": "An error occurred while scanning the table."},
        )