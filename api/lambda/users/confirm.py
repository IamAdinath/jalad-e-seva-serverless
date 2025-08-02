
import boto3
import logging
import os
from common.utils import build_response
from common.contsants import Headers, StatusCodes
import json

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event, context):

    """
    Confirm unconfirmed Cognito User
    """
    logger.info(f"EVENT RECIEVED : {event}")
    try:
        if not os.environ.get('USER_POOL_ID'):
            logger.error('USER_POOL_ID not set')
            return build_response(StatusCodes.INTERNAL_SERVER_ERROR, Headers.INTERNAL_SERVER_ERROR, {'message': 'USER_POOL_ID not set'})
        payload = json.loads(event.get('body'))
        if not payload.get('username'):
            logger.error('username not set')
            return build_response(StatusCodes.BAD_REQUEST, Headers.BAD_REQUEST, {'message': 'username not set'})
        client = boto3.client('cognito-idp')
        client.admin_confirm_sign_up(
            UserPoolId=os.environ['USER_POOL_ID'],
            Username=payload['username']
        )
        return build_response(StatusCodes.OK, Headers.Default, {'message': 'User confirmed'})
    except Exception as e:
        logger.error(e)
        return build_response(StatusCodes.INTERNAL_SERVER_ERROR, Headers.INTERNAL_SERVER_ERROR, {'message': str(e)})