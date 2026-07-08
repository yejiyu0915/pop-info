-- 로컬 MySQL 초기 설정 (Docker 불필요)
-- 실행: MySQL Workbench 또는 mysql -u root -p < scripts/init-db.sql

CREATE DATABASE IF NOT EXISTS popup_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'popup_user'@'localhost' IDENTIFIED BY 'popup_password';
GRANT ALL PRIVILEGES ON popup_db.* TO 'popup_user'@'localhost';
FLUSH PRIVILEGES;
