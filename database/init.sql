CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(100),
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  sizes VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  comment TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL DEFAULT 0
);

INSERT INTO products (name, description, category, price, sizes, image_url)
VALUES
('Костюм Active North', 'Спортивный костюм для города, тренировок и повседневной носки.', 'sport', 6990, 'S, M, L, XL', 'https://placehold.co/600x720?text=Active+North'),
('Футболка Basic TETIM', 'Базовая футболка из плотного хлопка.', 'tshirts', 1990, 'S, M, L', 'https://placehold.co/600x720?text=Basic+TETIM'),
('Куртка Outdoor Line', 'Функциональная модель для прогулок и outdoor.', 'outdoor', 8990, 'M, L, XL', 'https://placehold.co/600x720?text=Outdoor+Line'),
('Худи Urban Warm', 'Теплое худи свободного кроя.', 'hoodies', 4290, 'M, L, XL', 'https://placehold.co/600x720?text=Urban+Warm'),
('Комплект Team Motion', 'Форма для команд и секций.', 'team', 5490, 'Под заказ', 'https://placehold.co/600x720?text=Team+Motion')
ON CONFLICT DO NOTHING;