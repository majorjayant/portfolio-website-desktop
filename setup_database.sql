-- Create site_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_config (
  config_key VARCHAR(100) PRIMARY KEY,
  config_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default values if they don't exist
INSERT INTO site_config (config_key, config_value) 
VALUES 
  ('image_favicon_url', '/static/img/favicon.png'),
  ('image_logo_url', '/static/img/logo.png'),
  ('image_banner_url', '/static/img/banner_latest.png'),
  ('about_title', 'Jayant'),
  ('about_subtitle', 'Curious Mind. Developer. Explorer.'),
  ('about_description', 'Ever since I was a kid, I''ve been that person who takes apart gadgets just to see how they work - sometimes putting them back together successfully! This curiosity led me naturally into software development, where I get to build, break, fix, and improve every day.'),
  ('image_about_profile_url', '/static/img/profile.jpg'),
  ('image_about_photo1_url', '/static/img/about_photo1.jpg'),
  ('image_about_photo2_url', '/static/img/about_photo2.jpg'),
  ('image_about_photo3_url', '/static/img/about_photo3.jpg'),
  ('image_about_photo4_url', '/static/img/about_photo4.jpg'),
  ('about_photo1_alt', 'Test Photo 1 Alt Text'),
  ('about_photo2_alt', 'Test Photo 2 Alt Text'),
  ('about_photo3_alt', 'Test Photo 3 Alt Text'),
  ('about_photo4_alt', 'Test Photo 4 Alt Text')
ON DUPLICATE KEY UPDATE 
  config_value = VALUES(config_value); 