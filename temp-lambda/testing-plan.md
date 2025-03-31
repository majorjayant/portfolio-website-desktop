# Testing Plan to Fix Lambda 502 Errors

## Step 1: Check CloudWatch Logs

1. Go to the AWS Console
2. Navigate to CloudWatch > Log Groups
3. Find the log group for your Lambda function (typically `/aws/lambda/website-portfolio`)
4. Check recent log streams for errors, especially those related to:
   - Database connection issues
   - Unhandled exceptions
   - Missing table columns
   - Syntax errors

## Step 2: Update Lambda Configuration

1. Go to Lambda Function > Configuration
2. Increase **Timeout** to at least 15 seconds
3. Verify **Memory** is at least 128MB
4. Check **Environment Variables** to ensure they match your RDS database:
   - DB_HOST: website.ct8aqqkk828w.eu-north-1.rds.amazonaws.com
   - DB_USER: majorjayant
   - DB_PASSWORD: komalduhlani
   - DB_NAME: website
   - DB_PORT: 3306

## Step 3: Check Database Permissions

1. Connect to your RDS database using a MySQL client
2. Run the following commands to verify user permissions:
   ```sql
   SELECT user, host FROM mysql.user WHERE user = 'majorjayant';
   SHOW GRANTS FOR 'majorjayant'@'%';
   ```
3. If permissions are missing, run the grant command:
   ```sql
   GRANT ALL PRIVILEGES ON website.* TO 'majorjayant'@'%';
   FLUSH PRIVILEGES;
   ```

## Step 4: Verify Table Structure

1. Connect to your RDS database
2. Check if the site_config table exists and has the right structure:
   ```sql
   SHOW TABLES;
   DESCRIBE site_config;
   ```
3. If the table is missing or has wrong columns, run the create table SQL script

## Step 5: Update Lambda Function Code

1. Go to your Lambda function
2. Replace the current code with the improved version in `fix-lambda.js`
3. Deploy the changes
4. Test with this basic test event:
   ```json
   {
     "httpMethod": "POST",
     "body": "{\"action\":\"update_site_config\",\"site_config\":{\"about_title\":\"Test Title\",\"about_subtitle\":\"Test Subtitle\"}}"
   }
   ```

## Step 6: Test API Gateway Integration

1. Go to API Gateway in AWS Console
2. Select your API
3. Click on POST method for your endpoint
4. Click "Test" in the right panel
5. Enter request body:
   ```json
   {
     "action": "update_site_config",
     "site_config": {
       "about_title": "Test Title",
       "about_subtitle": "Test Subtitle" 
     }
   }
   ```
6. Click "Test" and check the response

## Step 7: Implement Frontend Fallback (Optional)

If the backend is still having issues, implement a localStorage fallback in the admin dashboard:

1. Add code to save form data locally when API fails
2. Add code to load data from localStorage when API fails
3. Add visual indicator that data is saved locally only

## Common 502 Causes and Solutions

| Problem | Solution |
|---------|----------|
| Missing response object | Ensure Lambda always returns statusCode, headers, and body |
| Database timeout | Add connection timeout and close connections properly |
| Query errors | Validate table exists and has expected columns |
| Memory issues | Increase Lambda memory allocation |
| Execution timeout | Increase Lambda timeout setting |
| CORS issues | Ensure proper CORS headers are returned | 