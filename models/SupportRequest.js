const db = require('../config/db');

class SupportRequest {
  static async create({ name, email, problem }) {
    try {
      const result = await db.run(
        'INSERT INTO support_requests (name, email, problem, status) VALUES (?, ?, ?, ?)',
        [name, email, problem, 'new']
      );
      return result.lastID;
    } catch (error) {
      console.error('Ошибка при создании обращения:', error);
      throw error;
    }
  }
}

module.exports = SupportRequest;