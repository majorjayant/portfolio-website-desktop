-- Create the site_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    about_title VARCHAR(255),
    about_subtitle VARCHAR(255),
    about_description TEXT,
    image_favicon_url VARCHAR(1024),
    image_logo_url VARCHAR(1024),
    image_banner_url VARCHAR(1024),
    image_about_profile_url VARCHAR(1024),
    image_about_photo1_url VARCHAR(1024),
    about_photo1_alt VARCHAR(255),
    image_about_photo2_url VARCHAR(1024),
    about_photo2_alt VARCHAR(255),
    image_about_photo3_url VARCHAR(1024),
    about_photo3_alt VARCHAR(255),
    image_about_photo4_url VARCHAR(1024),
    about_photo4_alt VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Grant proper permissions to the Lambda user
-- Replace 'majorjayant' with your actual database user if different
GRANT SELECT, INSERT, UPDATE, DELETE ON site_config TO 'majorjayant'@'%';
FLUSH PRIVILEGES;

-- Insert a default record if the table is empty
INSERT INTO site_config (
    about_title, 
    about_subtitle, 
    about_description,
    image_favicon_url,
    image_logo_url,
    image_banner_url,
    image_about_profile_url,
    image_about_photo1_url,
    about_photo1_alt,
    image_about_photo2_url,
    about_photo2_alt,
    image_about_photo3_url,
    about_photo3_alt,
    image_about_photo4_url,
    about_photo4_alt
)
SELECT 
    'Portfolio Website',
    'Showcase of My Work and Skills',
    'A personal portfolio showcasing projects, skills, and achievements.',
    'https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon',
    'https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo',
    'https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner',
    'https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg',
    'https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0138.jpg',
    'Photo 1 description',
    'https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0915.jpg',
    'Photo 2 description',
    'https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1461.jpg',
    'Photo 3 description',
    'https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1627.jpg',
    'Photo 4 description'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM site_config LIMIT 1); 