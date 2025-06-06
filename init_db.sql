CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  problem TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('new', 'in_progress', 'resolved'))
);

CREATE TABLE restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  delivery_time TEXT,
  rating REAL,
  image TEXT,
  tags TEXT
);

CREATE TABLE menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  time TEXT,
  rating REAL,
  image TEXT,
  tags TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  restaurant_id INTEGER,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  CHECK (status IN ('pending', 'completed', 'cancelled'))
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);
INSERT INTO restaurants (name, delivery_time, rating, image, tags) VALUES
('Тот самый Каркарыч', '24 мин', 4.8, 'Assets/Resturent1.png', '["Healthy"]'),
('Биг спэшл', '24 мин', 4.9, 'Assets/Resturent2.png', '["Trending"]'),
('Сказка', '24 мин', 5.0, 'Assets/Resturent3.png', '["Supreme"]');

INSERT INTO menu_items (restaurant_id, name, price, time, rating, image, tags) VALUES
(1, 'Chicken Hell', 599.99, '24 мин', 4.8, 'Assets/Food1.png', '["Healthy"]'),
(1, 'Botanic Panic', 999.99, '34 мин', 4.9, 'Assets/Food2.png', '["Trending"]'),
(2, 'Supreme Dish', 999.99, '34 мин', 4.9, 'Assets/Food3.png', '["Supreme"]'),
(2, 'Chicken Hell', 599.99, '24 мин', 4.8, 'Assets/Food4.png', '["Healthy"]'),
(3, 'Дворецкий', 880.55, '34 мин', 4.9, 'Assets/FoodKisser.png', '["Supreme"]'),
(3, 'Иллюзия', 881.99, '24 мин', 4.9, 'Assets/FoodPig.png', '["Healthy"]');