const SupportRequest = require('../models/SupportRequest');

exports.createRequest = async (req, res) => {
  try {
    const { name, email, problem } = req.body;

    if (!name || !email || !problem) {
      return res.status(400).json({ 
        success: false,
        error: 'Все поля обязательны для заполнения' 
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