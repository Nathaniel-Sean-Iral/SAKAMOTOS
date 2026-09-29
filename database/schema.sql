CREATE TABLE IF NOT EXISTS category_table (
  category_code VARCHAR(100) PRIMARY KEY,
  category_name VARCHAR(150) NOT NULL,
  category_status VARCHAR(100) NOT NULL DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS product_table (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(150) NOT NULL,
  product_code VARCHAR(100),
  category_code VARCHAR(100) NOT NULL REFERENCES category_table(category_code),
  product_price NUMERIC(10,2) NOT NULL,
  product_image TEXT,
  product_status VARCHAR(100) NOT NULL DEFAULT 'Available',
  minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_table (
  account_id SERIAL PRIMARY KEY,
  account_username VARCHAR(100) NOT NULL UNIQUE,
  account_email VARCHAR(255) NOT NULL UNIQUE,
  account_password TEXT NOT NULL,
  account_image TEXT,
  is_logged VARCHAR(20) NOT NULL DEFAULT 'NO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_table (
  session_id VARCHAR(255) PRIMARY KEY,
  account_username VARCHAR(100) NOT NULL REFERENCES user_table(account_username) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE TABLE IF NOT EXISTS cart_table (
  cart_id SERIAL PRIMARY KEY,
  acc_username VARCHAR(100) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  cup_size VARCHAR(100) NOT NULL,
  flavor_name VARCHAR(100) NOT NULL,
  add_ons VARCHAR(100) NOT NULL,
  cart_quantity INTEGER NOT NULL DEFAULT 1,
  prod_total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS history_table (
  history_id SERIAL PRIMARY KEY,
  order_username VARCHAR(100) NOT NULL,
  order_product_name VARCHAR(150) NOT NULL,
  order_flavor VARCHAR(100),
  order_cup_size VARCHAR(100),
  order_add_on VARCHAR(100),
  order_quantity INTEGER NOT NULL,
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_total_price NUMERIC(10,2) NOT NULL,
  order_status VARCHAR(100) NOT NULL DEFAULT 'APPROVED',
  is_cancelled VARCHAR(100) NOT NULL DEFAULT 'ORDER',
  cancellation_date TIMESTAMPTZ,
  mode_payment VARCHAR(100),
  list_number INTEGER,
  order_type VARCHAR(100),
  queue_number VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES user_table(account_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS slideshow_table (
  slideshow_id SERIAL PRIMARY KEY,
  slideshow_code INTEGER NOT NULL UNIQUE,
  slideshow_file TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_image_table (
  home_image_id SERIAL PRIMARY KEY,
  home_image_code INTEGER NOT NULL UNIQUE,
  home_image TEXT NOT NULL,
  home_image_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logo_table (
  logo_id VARCHAR(50) PRIMARY KEY,
  logo_image TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS add_on_table (
  add_on_key VARCHAR(100) PRIMARY KEY,
  add_on_name VARCHAR(150) NOT NULL,
  add_on_qty INTEGER NOT NULL DEFAULT 0,
  add_on_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  add_on_status VARCHAR(100) NOT NULL DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS flavor_table (
  flavor_key VARCHAR(100) PRIMARY KEY,
  flavor_name VARCHAR(150) NOT NULL,
  flavor_qty INTEGER NOT NULL DEFAULT 0,
  flavor_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  flavor_status VARCHAR(100) NOT NULL DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS cups_table (
  cup_key VARCHAR(100) PRIMARY KEY,
  cup_type VARCHAR(150) NOT NULL,
  cup_quantity INTEGER NOT NULL DEFAULT 0,
  cup_plus_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cup_status VARCHAR(100) NOT NULL DEFAULT 'Available'
);

INSERT INTO category_table (category_code, category_name, category_status)
VALUES
  ('Coffee', 'Coffee', 'Available')
ON CONFLICT (category_code) DO NOTHING;

INSERT INTO product_table (product_name, product_code, category_code, product_price, product_image, product_status, minutes)
VALUES
  ('Latte', 'C-1', 'Coffee', 120.00, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', 'Available', 5),
  ('Mocha', 'C-2', 'Coffee', 140.00, 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80', 'Available', 6),
  ('Cappuccino', 'C-3', 'Coffee', 130.00, 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80', 'Available', 5)
ON CONFLICT DO NOTHING;
