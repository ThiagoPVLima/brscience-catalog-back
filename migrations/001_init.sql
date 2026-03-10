-- ─── brscience_catalog — schema inicial ──────────────────────────────────────
-- Execute este arquivo uma vez para criar as tabelas.
-- mysql -u root -p brscience_catalog < migrations/001_init.sql

CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200)    NOT NULL,
  description TEXT,
  price       DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
  image_url   VARCHAR(1000),
  category_id INT UNSIGNED,
  active      TINYINT(1)      NOT NULL DEFAULT 1,
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS banners (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  image_url  VARCHAR(1000) NOT NULL,
  link       VARCHAR(500),
  active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
