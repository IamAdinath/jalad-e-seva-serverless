import os
import json
import uuid
from datetime import datetime
import boto3
from common.utils import build_response
from common.contsants import StatusCodes, Headers
import logging

dynamodb = boto3.resource("dynamodb")


logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    try:
        BLOGS_TABLE = os.getenv("BLOGS_TABLE")
        if not BLOGS_TABLE:
            return build_response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                Headers.CORS,
                {"message": "BLOGS_TABLE env variable not set."},
            )
        logger.info(f"Received event: {event}")
        # user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        # if not user_id:
        #     return build_response(
        #         StatusCodes.UNAUTHORIZED,
        #         Headers.CORS,
        #         {"message": "User not authenticated."},
        #     )
        # logger.info(f"User ID: {user_id}")
        body = json.loads(event["body"])
        title = body.get("title")
        category = body.get("category")
        start_date = body.get("start_date")
        end_date = body.get("end_date")
        content = body.get("content")
        tags = body.get("tags", [])
        # reading_time = body.get("reading_time", 1)
        blog_status = body.get("status", "published")

        if not title or not content:
            logger.error(f"Invalid Title: {title} and or Content: {content}")
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.CORS,
                {"message": "Title and content are required."},
            )

        blog_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        item = {
            "id": blog_id,
            # "author": user_id,
            "title": title,
            "content": content,
            "tags": tags,
            # "reading_time": reading_time,
            "image": body.get("image")
            "created_at": now,
            "updated_at": now,
            "status": blog_status,
            "category": category,
            "start_date": start_date,
            "end_date": end_date,
            "status_published_at": f"{blog_status}_{now}",
            # "author_index": f"{user_id}_{now}",
            "published_at": now,
        }

        table = dynamodb.Table(BLOGS_TABLE)
        table.put_item(Item=item)

        return build_response(
            StatusCodes.CREATED,
            Headers.CORS,
            {"message": "Blog created successfully.", "blog_id": blog_id},
        )

    except Exception as e:
        logger.eror(f"Error: {e}")
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.CORS,
            {"message": "Failed to create blog."},
        )
