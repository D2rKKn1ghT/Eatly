const Restaurant = require('../models/Restaurant');

exports.getAll = async (req, res) => {
  try {
    const restaurants = await Restaurant.getAll();
    res.json(restaurants);
  } catch (error) {
    console.error('Ошибка при получении ресторанов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getById = async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }
    
    const restaurant = await Restaurant.getById(restaurantId);

    res.json(restaurant);
  } catch (error) {
    console.error('Ошибка при получении ресторана:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getMenu = async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const menu = await Restaurant.getMenu(restaurantId);
    
    if (!menu || menu.length === 0) {
      return res.status(404).json({ error: 'Меню не найдено' });
    }

    res.json(menu);
  } catch (error) {
    console.error('Ошибка при получении меню:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};