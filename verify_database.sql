-- Check if the site_config table exists
SHOW TABLES LIKE 'site_config';

-- Show all records in the site_config table
SELECT * FROM site_config ORDER BY config_key;

-- Count the number of records in the site_config table
SELECT COUNT(*) AS total_config_items FROM site_config;

-- Show the structure of the site_config table
DESCRIBE site_config; 