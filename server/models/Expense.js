import db from '../config/database.js';

const Expense = {
    create(userId, data) {
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      INSERT INTO expenses (userId, title, amount, category, date, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(
            userId,
            data.title,
            data.amount,
            data.category,
            data.date,
            data.notes || null,
            now,
            now
        );
        return this.findById(result.lastInsertRowid);
    },

    findById(id) {
        const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
        return stmt.get(id);
    },

    findByIdAndUser(id, userId) {
        const stmt = db.prepare('SELECT * FROM expenses WHERE id = ? AND userId = ?');
        return stmt.get(id, userId);
    },

    findAllByUser(userId, filters = {}) {
        let query = 'SELECT * FROM expenses WHERE userId = ?';
        const params = [userId];

        // Date range filter
        if (filters.startDate) {
            query += ' AND date >= ?';
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            query += ' AND date <= ?';
            params.push(filters.endDate);
        }

        // Category filter
        if (filters.category) {
            query += ' AND category = ?';
            params.push(filters.category);
        }

        // Amount range filter
        if (filters.minAmount !== undefined) {
            query += ' AND amount >= ?';
            params.push(filters.minAmount);
        }
        if (filters.maxAmount !== undefined) {
            query += ' AND amount <= ?';
            params.push(filters.maxAmount);
        }

        // Sorting
        const sortBy = filters.sortBy || 'date';
        const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortBy} ${sortOrder}`;

        const stmt = db.prepare(query);
        return stmt.all(...params);
    },

    update(id, userId, data) {
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      UPDATE expenses 
      SET title = ?, amount = ?, category = ?, date = ?, notes = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `);
        stmt.run(
            data.title,
            data.amount,
            data.category,
            data.date,
            data.notes || null,
            now,
            id,
            userId
        );
        return this.findById(id);
    },

    delete(id, userId) {
        const stmt = db.prepare('DELETE FROM expenses WHERE id = ? AND userId = ?');
        const result = stmt.run(id, userId);
        return result.changes > 0;
    },

    getSummary(userId) {
        // Total expenses
        const totalStmt = db.prepare('SELECT SUM(amount) as total FROM expenses WHERE userId = ?');
        const total = totalStmt.get(userId)?.total || 0;

        // By category
        const categoryStmt = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count 
      FROM expenses WHERE userId = ? 
      GROUP BY category
    `);
        const byCategory = categoryStmt.all(userId);

        // This month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthStmt = db.prepare('SELECT SUM(amount) as total FROM expenses WHERE userId = ? AND date >= ?');
        const monthlyTotal = monthStmt.get(userId, startOfMonth)?.total || 0;

        // Today
        const today = now.toISOString().split('T')[0];
        const todayStmt = db.prepare('SELECT SUM(amount) as total FROM expenses WHERE userId = ? AND date = ?');
        const dailyTotal = todayStmt.get(userId, today)?.total || 0;

        return {
            total,
            monthlyTotal,
            dailyTotal,
            byCategory
        };
    }
};

export default Expense;
