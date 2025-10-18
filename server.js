const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

const initSql = fs.readFileSync(path.join(__dirname, 'init_db.sql'), 'utf-8');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    process.exit(1);
  }
  console.log('Подключено к SQLite базе данных');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await db.query('SELECT * FROM restaurants');
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  db.exec(initSql, (err) => {
    if (err) console.error('Ошибка при создании таблиц:', err);
  });
});
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен просрочен' });
    }
    res.status(401).json({ error: 'Неверный токен' });
  }
};

db.query = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
db.runPromise = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};
// Middleware
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  req.db = db;
  next();
});

// Импорт маршрутов
const authRouter = require('./routes/auth');
const restaurantsRouter = require('./routes/restaurants');
const supportRouter = require('./routes/support');

// Регистрация маршрутов
app.use('/auth', authRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/support', supportRouter);


app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Ошибка сервера' });
});
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await db.query(
      'SELECT id, name, delivery_time as deliveryTime, rating, image FROM restaurants WHERE id = ?', 
      [req.params.id]
    );
    res.json(restaurant[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/restaurants/:id/menu', async (req, res) => {
  try {
    const menu = await db.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ?',
      [req.params.id]
    );
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/auth/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email обязателен' });
        }

        const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (!user.length) {
            return res.status(200).json({ 
                success: false,
                error: 'Пользователь с таким email не найден' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Инструкции отправлены на ваш email' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/auth/reset-password', async (req, res) => {
    try {
        const { email, name, password } = req.body;
        
        await db.run(
            'UPDATE users SET name = ?, password = ? WHERE email = ?',
            [name, password, email]
        );
        
        res.json({ message: 'Пароль успешно обновлен' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/auth/refresh-token', async (req, res) => {
  try {
    const user = await authenticateUserSomehow(req);
    
    const newToken = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );
    
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Не удалось обновить токен' });
  }
});
app.post('/api/orders', authenticate, async (req, res) => {
  try {
    const { restaurantId, items, totalAmount } = req.body;

    if (!restaurantId || !items || !totalAmount) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }

    await db.run('BEGIN TRANSACTION');
    
    try {
      const orderResult = await db.runPromise(
        'INSERT INTO orders (user_id, restaurant_id, total_amount) VALUES (?, ?, ?)',
        [req.user.userId, restaurantId, totalAmount]
      );
      
      const orderId = orderResult.lastID;
      console.log('Created order with ID:', orderId);
      
      if (!orderId) {
        throw new Error('Failed to get order ID');
      }
      
      for (const item of items) {
        await db.runPromise(
          'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.menu_item_id, item.quantity, item.price]
        );
      }
      
      await db.run('COMMIT');
      
      res.json({ 
        success: true,
        orderId: orderId,
        message: 'Заказ успешно создан'
      });
      
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка сервера при создании заказа' 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, 
       r.name as restaurant_name, r.image as restaurant_image
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.user_id = ?`,
      [req.params.userId]
    );
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});