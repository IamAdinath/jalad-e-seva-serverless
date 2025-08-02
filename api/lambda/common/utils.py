
import json

def build_response(status_code, headers, body=None):
    if not body:
        data = json.dumps({})
    else:
        data = json.dumps(body)
    return {
        "statusCode": status_code,
        "headers": headers,
        "body": data
    }