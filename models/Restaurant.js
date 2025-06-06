const db = require('../config/db');

class Restaurant {
  static async getAll() {
    try {
      return await db.query('SELECT * FROM restaurants');
    } catch (error) {
      console.error('Ошибка при получении ресторанов:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      if (!id) throw new Error('Restaurant ID is required');
      const rows = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);
      if (!rows || rows.length === 0) throw new Error('Restaurant not found');
      return rows[0];
    } catch (error) {
      console.error('Ошибка при получении ресторана:', error);
      throw error;
    }
  }

  static async getMenu(restaurantId) {
    try {
      return await db.query('SELECT * FROM menu_items WHERE restaurant_id = ?', [restaurantId]);
    } catch (error) {
      console.error('Ошибка при получении меню:', error);
      throw error;
    }
  }
}

module.exports = Restaurant;