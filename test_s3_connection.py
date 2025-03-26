import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def test_s3_connection():
    """Test S3 connection and list buckets"""
    
    # Get credentials from environment variables
    aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
    region_name = os.environ.get('AWS_REGION', 'us-east-1')
    bucket_name = os.environ.get('S3_BUCKET_NAME')
    
    print(f"Testing S3 connection with:")
    print(f"- Region: {region_name}")
    print(f"- Bucket: {bucket_name}")
    print(f"- Access Key: {aws_access_key[:5]}{'*' * 10}")
    
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region_name
        )
        
        # List all available buckets
        response = s3_client.list_buckets()
        print("\nAvailable buckets:")
        if 'Buckets' in response:
            for bucket in response['Buckets']:
                print(f"- {bucket['Name']}")
            print(f"Total buckets: {len(response['Buckets'])}")
        else:
            print("No buckets found")
        
        # Check if the specific bucket exists
        try:
            s3_client.head_bucket(Bucket=bucket_name)
            print(f"\nBucket '{bucket_name}' exists and is accessible")
            
            # Try to list objects in the bucket
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                MaxKeys=10
            )
            
            if 'Contents' in response:
                print(f"\nObjects in bucket '{bucket_name}':")
                for obj in response['Contents']:
                    print(f"- {obj['Key']} (Size: {obj['Size']} bytes, Last Modified: {obj['LastModified']})")
                print(f"Total objects: {response.get('KeyCount', 0)}")
            else:
                print(f"\nBucket '{bucket_name}' is empty")
            
        except ClientError as e:
            print(f"\nError accessing bucket '{bucket_name}': {e}")
        
        return True
        
    except Exception as e:
        print(f"\nError connecting to S3: {e}")
        return False

if __name__ == "__main__":
    success = test_s3_connection()
    if success:
        print("\nS3 connection test completed successfully")
    else:
        print("\nS3 connection test failed") 