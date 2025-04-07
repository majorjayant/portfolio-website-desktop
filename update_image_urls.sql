-- Update any S3 URLs to local paths

-- Update favicon URL
UPDATE site_config 
SET config_value = '/static/img/favicon.png' 
WHERE config_key = 'image_favicon_url' 
AND config_value LIKE '%s3.eu-north-1.amazonaws.com%';

-- Update logo URL
UPDATE site_config 
SET config_value = '/static/img/logo.png' 
WHERE config_key = 'image_logo_url' 
AND config_value LIKE '%s3.eu-north-1.amazonaws.com%';

-- Update banner URL
UPDATE site_config 
SET config_value = '/static/img/banner_latest.png' 
WHERE config_key = 'image_banner_url' 
AND config_value LIKE '%s3.eu-north-1.amazonaws.com%';

-- Update profile image URL
UPDATE site_config 
SET config_value = '/static/img/profile.jpg' 
WHERE config_key = 'image_about_profile_url' 
AND config_value LIKE '%s3.eu-north-1.amazonaws.com%';

-- Update gallery photo URLs
UPDATE site_config 
SET config_value = '/static/img/about_photo1.jpg' 
WHERE config_key = 'image_about_photo1_url' 
AND config_value LIKE '%s3.eu-north-1.amazonaws.com%';

UPDATE site_config 
SET config_value = '/static/img/about_photo2.jpg' 
WHERE config_key = 'image_about_photo2_url' 
AND config_value LIKE '%s3.eu-north-1.amazonaws.com%';

UPDATE site_config 
SET config_value = '/static/img/about_photo3.jpg' 
WHERE config_key = 'image_about_photo3_url' 
AND config_value LIKE '%s3.eu-north-1.amazonaws.com%';

UPDATE site_config 
SET config_value = '/static/img/about_photo4.jpg' 
WHERE config_key = 'image_about_photo4_url' 
AND config_value LIKE '%s3.eu-north-1.amazonaws.com%';

-- Verify updates
SELECT config_key, config_value, updated_at 
FROM site_config 
WHERE config_key LIKE 'image_%' 
ORDER BY config_key; 