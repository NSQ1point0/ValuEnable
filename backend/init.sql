-- Database initialization script for benefit_illustration
-- This script runs automatically when MySQL container starts

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS benefit_illustration;

-- Use the database
USE benefit_illustration;

-- Grant permissions to appuser
GRANT ALL PRIVILEGES ON benefit_illustration.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

-- Show databases to confirm creation
SHOW DATABASES;
