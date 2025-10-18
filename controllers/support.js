const SupportRequest = require('../models/SupportRequest');
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateName(name) {
    const nameRegex = /^[A-Za-zА-Яа-яЁё\s]{2,50}$/;
    return nameRegex.test(name);
}

exports.createRequest = async (req, res) => {
  try {
    const { name, email, problem } = req.body;

    if (!name || !email || !problem) {
      return res.status(400).json({ 
        success: false,
        error: 'Все поля обязательны для заполнения' 
      });
    }
    if (!validateName(name)) {
      return res.status(400).json({ 
        success: false,
        error: 'ФИО должно содержать только буквы и быть не короче 2 символов' 
      });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Пожалуйста, введите корректный email адрес' 
      });
    }
    if (problem.length < 10) {
      return res.status(400).json({ 
        success: false,
        error: 'Описание проблемы должно содержать минимум 10 символов' 
      });
    }
    if (problem.length > 1000) {
      return res.status(400).json({ 
        success: false,
        error: 'Описание проблемы слишком длинное (максимум 1000 символов)' 
      });
    }
    const requestId = await SupportRequest.create({ name, email, problem });

    res.status(201).json({ 
      success: true,
      message: 'Ваше обращение успешно отправлено', 
      requestId 
    });
  } catch (error) {
    console.error('Ошибка при обработке обращения:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка сервера' 
    });
  }
};