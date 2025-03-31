import json
import os
import boto3
from botocore.exceptions import ClientError
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize S3 client
s3 = boto3.client('s3')

# Get the S3 bucket name from environment variables or use a default
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME', 'portfolio-website-prod-website')

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
    logger.info(f"Received event: {json.dumps(event)}")
    
    # Handle OPTIONS request for CORS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'CORS preflight request successful'})
        }
    
    try:
        # Fetch site configuration from S3
        content_type = event.get('queryStringParameters', {}).get('type', 'site_config')
        logger.info(f"Fetching content of type: {content_type}")
        
        # Map content type to file path
        content_files = {
            'site_config': 'data/site_config.json',
            'projects': 'data/projects.json',
            'experience': 'data/experience.json',
            'education': 'data/education.json',
            'certifications': 'data/certifications.json',
            'content': 'data/content.json'
        }
        
        file_path = content_files.get(content_type, 'data/site_config.json')
        
        # Get file from S3
        response = s3.get_object(
            Bucket=S3_BUCKET_NAME,
            Key=file_path
        )
        
        # Read and parse the file content
        content = response['Body'].read().decode('utf-8')
        data = json.loads(content)
        
        # Return the content with CORS headers
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(data)
        }
        
    except ClientError as e:
        logger.error(f"S3 error: {str(e)}")
        error_message = "Error retrieving content"
        
        if e.response['Error']['Code'] == 'NoSuchKey':
            error_message = f"The requested content ({content_type}) does not exist"
            
        return {
            'statusCode': 404,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'error': error_message,
                'message': str(e)
            })
        }
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        } 