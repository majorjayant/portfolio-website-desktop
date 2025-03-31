import json
import os

# Define CORS headers
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Content-Type': 'application/json'
}

def handler(event, context):
    """
    Lambda function handler to fetch content data from S3.
    This replaces the Netlify function to provide dynamic content.
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Handle OPTIONS request for CORS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'CORS preflight request successful'})
        }
    
    try:
        # For now, just return dummy data to test deployment
        dummy_data = {
            "about_content": {
                "title": "Jayant Arora",
                "subtitle": "Curious Mind. Data Geek. Product Whisperer.",
                "description": "Portfolio website content.",
                "profile_image": "/static/img/profile-photo.png",
                "photos": []
            },
            "message": "This is a placeholder response from AWS Lambda"
        }
        
        # Return the content with CORS headers
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(dummy_data)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        } 