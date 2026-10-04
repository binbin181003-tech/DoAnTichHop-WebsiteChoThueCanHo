CREATE DATABASE IF NOT EXISTS rental_app
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE rental_app;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS membership_user;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS membership_packages;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  image_url TEXT DEFAULT NULL,
  status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
  role ENUM('member', 'admin') NOT NULL DEFAULT 'member',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- MEMBERSHIP PACKAGES
-- =========================
CREATE TABLE membership_packages (
  ms_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  duration INT NOT NULL DEFAULT 30,
  post_limit INT NOT NULL DEFAULT 10,
  popular TINYINT(1) NOT NULL DEFAULT 0,
  features JSON DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- POSTS
-- =========================
CREATE TABLE posts (
  post_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  address VARCHAR(255) DEFAULT NULL,
  price BIGINT DEFAULT NULL,
  area INT DEFAULT NULL,
  category VARCHAR(50) DEFAULT NULL,
  post_type ENUM('listing', 'article') NOT NULL DEFAULT 'listing',
  views INT NOT NULL DEFAULT 0,
  status ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'approved',
  user_id VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- =========================
-- IMAGES
-- =========================
CREATE TABLE images (
  image_id VARCHAR(80) PRIMARY KEY,
  img_url LONGTEXT NOT NULL,
  post_id VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_images_post
    FOREIGN KEY (post_id) REFERENCES posts(post_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_images_post_id ON images(post_id);

-- =========================
-- COMMENTS
-- =========================
CREATE TABLE comment (
  comment_id VARCHAR(50) PRIMARY KEY,
  content_comment LONGTEXT NOT NULL,
  rating TINYINT DEFAULT NULL,
  post_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  parent_comment_id VARCHAR(50) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_comment_post
    FOREIGN KEY (post_id) REFERENCES posts(post_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_comment_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_comment_parent
    FOREIGN KEY (parent_comment_id) REFERENCES comment(comment_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_comment_post_id ON comment(post_id);
CREATE INDEX idx_comment_user_id ON comment(user_id);
CREATE INDEX idx_comment_parent_comment_id ON comment(parent_comment_id);

-- =========================
-- MEMBERSHIP USER
-- =========================
CREATE TABLE membership_user (
  member_user_id VARCHAR(50) PRIMARY KEY,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  user_id VARCHAR(50) NOT NULL,
  ms_id VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_membership_user_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_membership_user_package
    FOREIGN KEY (ms_id) REFERENCES membership_packages(ms_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_membership_user_user_id ON membership_user(user_id);
CREATE INDEX idx_membership_user_ms_id ON membership_user(ms_id);
CREATE INDEX idx_membership_user_status ON membership_user(status);
CREATE INDEX idx_membership_user_end_at ON membership_user(end_at);

-- =========================
-- TRANSACTIONS
-- =========================
CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  userAccount VARCHAR(255) NOT NULL,
  method VARCHAR(50) NOT NULL,
  planName VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  content TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_transactions_userId ON transactions(userId);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(date);

-- =========================
-- SAMPLE DATA
-- =========================

-- Admin account
INSERT INTO users (user_id, name, email, phone, password, status, role)
VALUES (
  'admin_001',
  'admin',
  'admin@wrstudios.com',
  '0123456789',
  'admin123',
  'active',
  'admin'
);

-- Sample membership packages
INSERT INTO membership_packages (ms_id, name, description, price, duration, post_limit, popular, active, features)
VALUES
(
  'ms_basic',
  'Basic',
  'Gói cơ bản dành cho người dùng mới',
  299000,
  30,
  10,
  0,
  1,
  JSON_ARRAY('Đăng 10 bài/tháng', 'Hỗ trợ cơ bản', 'Hiển thị tiêu chuẩn')
),
(
  'ms_premium',
  'Premium',
  'Gói phổ biến cho người dùng thường xuyên',
  799000,
  30,
  30,
  1,
  1,
  JSON_ARRAY('Đăng 30 bài/tháng', 'Ưu tiên hiển thị', 'Hỗ trợ nhanh', 'Thống kê nâng cao')
),
(
  'ms_vip',
  'Business',
  'Gói cao cấp dành cho doanh nghiệp',
  1090000,
  30,
  100,
  0,
  1,
  JSON_ARRAY('Đăng 100 bài/tháng', 'Hiển thị nổi bật', 'Hỗ trợ ưu tiên 24/7', 'Báo cáo chi tiết')
);

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS tags (
  tag_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tag_name VARCHAR(60) NOT NULL,
  UNIQUE KEY uq_tags_name (tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_tags (
  post_id VARCHAR(50) NOT NULL,
  tag_id BIGINT UNSIGNED NOT NULL,
  position TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, tag_id),
  KEY idx_post_tags_tag_id (tag_id),
  CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE posts
  ADD COLUMN latitude DECIMAL(10,7) NULL DEFAULT NULL,
  ADD COLUMN longitude DECIMAL(10,7) NULL DEFAULT NULL;