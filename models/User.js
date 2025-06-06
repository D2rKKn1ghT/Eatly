class User {
  static async create({ name, email, password }, db) {
    try {
      const result = await db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, password]
      );
      return result.lastID;
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  }

  static async findByEmail(email, db) {
    try {
      const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      console.error('Ошибка при поиске пользователя:', error);
      throw error;
    }
  }

  static async findById(id, db) {
    try {
      const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Ошибка при поиске пользователя:', error);
      throw error;
    }
  }
}

module.exports = User;