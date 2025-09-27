"""
Search blogs by title, summary, and content
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
        query = params.get("q", "").strip()
        limit = int(params.get("limit", 20))

        if not query:
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Missing 'q' query parameter for search."},
            )

        if len(query) < 2:
            return build_response(
                StatusCodes.BAD_REQUEST,
                Headers.BAD_REQUEST,
                {"message": "Search query must be at least 2 characters long."},
            )

        table = dynamodb.Table(BLOGS_TABLE)
        
        # Convert query to lowercase for case-insensitive search
        search_term = query.lower()
        
        logger.info(f"Searching for: '{search_term}' with limit: {limit}")

        # Use scan with filter expression to search across title, summary, and content
        # Note: This is not the most efficient for large datasets, but works for moderate sizes
        # For production with large datasets, consider using Amazon OpenSearch or similar
        
        expression_attribute_values = {
            ":search_term": search_term,
            ":status": "published"
        }
        
        expression_attribute_names = {
            "#title": "title",
            "#summary": "contentSummary", 
            "#content": "htmlContent",
            "#status": "status"
        }
        
        # Create filter expression for case-insensitive search
        # DynamoDB doesn't have a native lower() function, so we'll use contains() directly
        # and handle case-insensitivity in the application logic
        filter_expression = (
            "(contains(#title, :search_term) OR "
            "contains(#summary, :search_term) OR "
            "contains(#content, :search_term)) AND "
            "#status = :status"
        )
        
        scan_params = {
            "FilterExpression": filter_expression,
            "ExpressionAttributeNames": expression_attribute_names,
            "ExpressionAttributeValues": expression_attribute_values,
            "Limit": limit * 2  # Get more items to account for filtering
        }
        
        logger.info(f"Scan params: {scan_params}")
        
        response = table.scan(**scan_params)
        all_blogs = response.get("Items", [])
        
        # Since DynamoDB doesn't support case-insensitive search natively,
        # we'll do additional filtering in Python for better results
        blogs = []
        for blog in all_blogs:
            title = (blog.get("title") or "").lower()
            summary = (blog.get("contentSummary") or "").lower()
            content = (blog.get("htmlContent") or "").lower()
            
            if (search_term in title or 
                search_term in summary or 
                search_term in content):
                blogs.append(blog)
        
        logger.info(f"Found {len(blogs)} blogs matching search term after filtering")

        if not blogs:
            return build_response(
                StatusCodes.OK,
                Headers.DEFAULT,
                {"blogs": [], "message": f"No blogs found matching '{query}'."},
            )

        # Sort results by relevance (title matches first, then by date)
        def calculate_relevance(blog):
            title = blog.get("title", "").lower()
            summary = blog.get("contentSummary", "").lower()
            
            # Higher score for title matches
            title_score = 10 if search_term in title else 0
            # Medium score for summary matches
            summary_score = 5 if search_term in summary else 0
            # Base score for content matches (already filtered)
            content_score = 1
            
            # Bonus for exact matches
            if search_term == title:
                title_score += 20
            elif title.startswith(search_term):
                title_score += 10
                
            return title_score + summary_score + content_score

        # Sort by relevance score (descending) and then by date (newest first)
        blogs.sort(key=lambda x: (
            calculate_relevance(x),
            x.get("publishedAt", x.get("startDate", ""))
        ), reverse=True)
        
        # Limit results after sorting
        blogs = blogs[:limit]

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
                "count": len(formatted_blogs),
                "query": query,
                "message": f"Found {len(formatted_blogs)} blogs matching '{query}'."
            },
        )

    except Exception as e:
        logger.error(f"Error searching blogs: {str(e)}", exc_info=True)
        return build_response(
            StatusCodes.INTERNAL_SERVER_ERROR,
            Headers.INTERNAL_SERVER_ERROR,
            {"message": "An error occurred while searching blogs."},
        )