import { getDb, saveDb } from '../config/database.js';

const Expense = {
    create(userId, data) {
        const db = getDb();
        const now = new Date().toISOString();
        db.run(
            `INSERT INTO expenses (userId, title, amount, category, date, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, data.title, data.amount, data.category, data.date, data.notes || null, now, now]
        );
        const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        saveDb();
        return this.findById(id);
    },

    findById(id) {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    },

    findByIdAndUser(id, userId) {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM expenses WHERE id = ? AND userId = ?');
        stmt.bind([id, userId]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    },

    findAllByUser(userId, filters = {}) {
        const db = getDb();
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

        const results = [];
        const stmt = db.prepare(query);
        stmt.bind(params);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    },

    update(id, userId, data) {
        const db = getDb();
        const now = new Date().toISOString();
        db.run(
            `UPDATE expenses 
       SET title = ?, amount = ?, category = ?, date = ?, notes = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`,
            [data.title, data.amount, data.category, data.date, data.notes || null, now, id, userId]
        );
        saveDb();
        return this.findById(id);
    },

    delete(id, userId) {
        const db = getDb();
        const existing = this.findByIdAndUser(id, userId);
        if (!existing) return false;
        db.run('DELETE FROM expenses WHERE id = ? AND userId = ?', [id, userId]);
        saveDb();
        return true;
    },

    getSummary(userId) {
        const db = getDb();

        // Total expenses
        let result = db.exec('SELECT SUM(amount) as total FROM expenses WHERE userId = ?', [userId]);
        const total = result.length > 0 && result[0].values[0][0] ? result[0].values[0][0] : 0;

        // By category
        result = db.exec(
            `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM expenses WHERE userId = ? 
       GROUP BY category`,
            [userId]
        );
        const byCategory = result.length > 0 ? result[0].values.map(row => ({
            category: row[0],
            total: row[1],
            count: row[2]
        })) : [];

        // This month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        result = db.exec('SELECT SUM(amount) as total FROM expenses WHERE userId = ? AND date >= ?', [userId, startOfMonth]);
        const monthlyTotal = result.length > 0 && result[0].values[0][0] ? result[0].values[0][0] : 0;

        // Today
        const today = now.toISOString().split('T')[0];
        result = db.exec('SELECT SUM(amount) as total FROM expenses WHERE userId = ? AND date = ?', [userId, today]);
        const dailyTotal = result.length > 0 && result[0].values[0][0] ? result[0].values[0][0] : 0;

        return {
            total,
            monthlyTotal,
            dailyTotal,
            byCategory
        };
    }
};

export default Expense;
