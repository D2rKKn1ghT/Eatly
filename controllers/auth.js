const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
}

function validateName(name) {
    const nameRegex = /^[A-Za-zА-Яа-яЁё\s]{2,50}$/;
    return nameRegex.test(name);
}
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    if (!validateName(name)) {
      return res.status(400).json({ error: 'ФИО должно содержать только буквы и быть не короче 2 символов' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Пожалуйста, введите корректный email адрес' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов, включая буквы и цифры' });
    }

    const existingUser = await User.findByEmail(email, req.db);
    if (existingUser) {
      return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await User.create({ name, email, password: hashedPassword }, req.db);

    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret_key', {
      expiresIn: '1h',
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Пожалуйста, введите корректный email адрес' });
    }

    const user = await User.findByEmail(email, req.db);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret_key', {
      expiresIn: '24h'
    });

    res.json({ token });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Поиск пользователя с email:', email);

    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email обязателен' 
      });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Пожалуйста, введите корректный email адрес' 
      });
    }

    const user = await User.findByEmail(email, req.db);
    console.log('Результат поиска:', user);

    if (!user) {
      return res.status(200).json({ 
        success: false,
        error: 'Пользователь не найден' 
      });
    }

    res.json({ 
      success: true,
      message: 'Email найден',
      user: { name: user.name }
    });
  } catch (error) {
    console.error('Ошибка в checkEmail:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка сервера' 
    });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email и пароль обязательны' 
      });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Пожалуйста, введите корректный email адрес' 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        success: false,
        error: 'Пароль должен содержать минимум 6 символов, включая буквы и цифры' 
      });
    }
    
    const user = await User.findByEmail(email, req.db);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Пользователь не найден' 
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await req.db.run(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({ 
      success: true,
      message: 'Пароль успешно обновлен' 
    });
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка сервера' 
    });
  }
};