import os
import boto3
from botocore.exceptions import ClientError
from io import BytesIO
from PIL import Image
import logging
from flask import url_for

# Set up logging
logger = logging.getLogger(__name__)

class S3Handler:
    def __init__(self, aws_access_key=None, aws_secret_key=None, region_name=None, bucket_name=None):
        """Initialize S3 handler with AWS credentials"""
        self.aws_access_key = aws_access_key or os.environ.get('AWS_ACCESS_KEY_ID')
        self.aws_secret_key = aws_secret_key or os.environ.get('AWS_SECRET_ACCESS_KEY')
        self.region_name = region_name or os.environ.get('AWS_REGION', 'us-east-1')
        self.bucket_name = bucket_name or os.environ.get('S3_BUCKET_NAME')
        
        # Explicitly check DEV_MODE environment variable
        self.dev_mode = os.environ.get('DEV_MODE', 'False').lower() in ('true', '1', 't')
        
        # Also enable dev mode if credentials are missing
        if not all([self.aws_access_key, self.aws_secret_key, self.bucket_name]):
            self.dev_mode = True
            
        if self.dev_mode:
            logger.warning("Running in development mode - files will be stored locally.")
            # Create local storage directory for dev mode
            os.makedirs('app/static/uploads', exist_ok=True)
        else:
            # Initialize S3 client with real credentials
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.aws_access_key,
                aws_secret_access_key=self.aws_secret_key,
                region_name=self.region_name
            )
    
    def upload_image(self, image, file_key, content_type='image/jpeg'):
        """
        Upload an image to S3 bucket or local filesystem in dev mode
        
        Args:
            image: PIL Image object or BytesIO object
            file_key: S3 key for the file
            content_type: MIME type of the image
            
        Returns:
            S3 URL or local URL if successful, None otherwise
        """
        try:
            # Get image format based on content type
            img_format = content_type.split('/')[-1].upper()
            if img_format == 'JPG':
                img_format = 'JPEG'
                
            # For development mode, save to local storage
            if self.dev_mode:
                # Extract filename from key
                filename = os.path.basename(file_key)
                local_path = os.path.join('app/static/uploads', filename)
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                
                # If it's a PIL Image, save directly
                if isinstance(image, Image.Image):
                    image.save(local_path, format=img_format)
                else:
                    # If it's a file-like object, save its content
                    with open(local_path, 'wb') as f:
                        f.write(image.read())
                
                # Return a local URL
                return url_for('static', filename=f'uploads/{filename}')
            
            # For production mode, upload to S3
            # If it's a PIL Image, convert to bytes
            if isinstance(image, Image.Image):
                img_byte_array = BytesIO()
                
                # Save image to BytesIO object
                image.save(img_byte_array, format=img_format)
                img_byte_array.seek(0)
                file_data = img_byte_array
            else:
                file_data = image
            
            # Upload to S3
            self.s3_client.upload_fileobj(
                file_data,
                self.bucket_name,
                file_key,
                ExtraArgs={
                    'ContentType': content_type,
                    'ACL': 'public-read'  # Make the file publicly accessible
                }
            )
            
            # Construct and return the S3 URL
            s3_url = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{file_key}"
            return s3_url
            
        except Exception as e:
            logger.error(f"Error uploading image: {e}")
            print(f"Upload error: {str(e)}")  # Print for debugging
            return None
    
    def delete_image(self, file_key):
        """
        Delete an image from S3 bucket or local filesystem in dev mode
        
        Args:
            file_key: S3 key for the file to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if self.dev_mode:
                # Extract filename from key
                filename = os.path.basename(file_key)
                local_path = os.path.join('app/static/uploads', filename)
                
                # Delete the file if it exists
                if os.path.exists(local_path):
                    os.remove(local_path)
                return True
            
            # For production mode, delete from S3
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            return True
        except Exception as e:
            logger.error(f"Error deleting image: {e}")
            return False
            
    def check_bucket_exists(self):
        """Check if the configured bucket exists or if in dev mode"""
        if self.dev_mode:
            return True
            
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            return True
        except ClientError:
            return False
    
    def list_images(self, prefix=''):
        """
        List all images in the bucket or local directory
        
        Args:
            prefix: Optional prefix to filter objects
            
        Returns:
            List of object keys
        """
        if self.dev_mode:
            # List files in local uploads directory
            upload_dir = 'app/static/uploads'
            return [f for f in os.listdir(upload_dir) if os.path.isfile(os.path.join(upload_dir, f))]
            
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            if 'Contents' in response:
                return [obj['Key'] for obj in response['Contents']]
            return []
            
        except ClientError as e:
            logger.error(f"Error listing objects: {e}")
            return []

# Initialize default S3 handler
s3_handler = S3Handler() 