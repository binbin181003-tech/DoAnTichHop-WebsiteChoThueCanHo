-- Chạy MỘT LẦN trên database hiện có. Không chạy lại schema.sql vì file đó DROP bảng.
USE rental_app;

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
