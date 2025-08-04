import os
import json
import boto3
import logging

from common.constants import StatusCodes, Headers
from common.utils import build_response
from common.s3 import put_s3_file, get_s3_file_url

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info(f"Received event: {event}")

    media_bucket = os.getenv("MEDIA_BUCKET")
    if not media_bucket:
        logger.error("MEDIA_BUCKET env variable is not set")
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"error": "MEDIA_BUCKET env variable not set"},
        )

    payload = event.get("body")

    file_content = None
    file_name = None

    if payload:
        try:
            data = json.loads(payload)
            file_content = data.get("file_content")
            file_name = data.get("file_name")
        except json.JSONDecodeError:
            logger.error("Invalid JSON payload")
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.DEFAULT,
                {"error": "Invalid JSON payload"},
            )

    if not file_content:
        logger.error("File content is required")
        return build_response(
            StatusCodes.BAD_REQUEST,
            Headers.BAD_REQUEST,
            {"error": "File content is required"},
        )

    if not file_name:
        logger.error("File name is required")
        return build_response(
            StatusCodes.BAD_REQUEST,
            Headers.BAD_REQUEST,
            {"error": "File name is required"},
        )

    try:
        put_s3_file(media_bucket, file_name, file_content)
        file_url = get_s3_file_url(media_bucket, file_name)
        return build_response(
            StatusCodes.CREATED,
            Headers.DEFAULT,
            {"message": "File uploaded successfully", "file_url": file_url},
        )
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"error": str(e)},
        )
