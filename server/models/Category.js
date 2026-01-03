import { getDb, saveDb } from '../config/database.js';

const Category = {
    // Get all categories for a user
    findAllByUser(userId) {
        const db = getDb();
        const results = [];
        const stmt = db.prepare('SELECT * FROM categories WHERE userId = ? AND active = 1 ORDER BY name');
        stmt.bind([userId]);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    },

    // Get all categories including inactive
    findAllByUserIncludingInactive(userId) {
        const db = getDb();
        const results = [];
        const stmt = db.prepare('SELECT * FROM categories WHERE userId = ? ORDER BY name');
        stmt.bind([userId]);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    },

    // Find by ID
    findById(id) {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    },

    // Create category
    create(userId, data) {
        const db = getDb();
        const now = new Date().toISOString();
        db.run(
            'INSERT INTO categories (userId, name, type, budget, active, createdAt) VALUES (?, ?, ?, ?, 1, ?)',
            [userId, data.name, data.type || 'Expense', data.budget || null, now]
        );
        const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        saveDb();
        return this.findById(id);
    },

    // Update category
    update(id, userId, data) {
        const db = getDb();
        db.run(
            'UPDATE categories SET name = ?, type = ?, budget = ? WHERE id = ? AND userId = ?',
            [data.name, data.type || 'Expense', data.budget || null, id, userId]
        );
        saveDb();
        return this.findById(id);
    },

    // Soft delete (set inactive)
    delete(id, userId) {
        const db = getDb();
        db.run('UPDATE categories SET active = 0 WHERE id = ? AND userId = ?', [id, userId]);
        saveDb();
        return true;
    },

    // Initialize default categories for new user
    initializeDefaults(userId) {
        const defaults = [
            { name: 'Food', type: 'Expense' },
            { name: 'Travel', type: 'Expense' },
            { name: 'Bills', type: 'Expense' },
            { name: 'Shopping', type: 'Expense' },
            { name: 'Entertainment', type: 'Expense' },
            { name: 'Healthcare', type: 'Expense' },
            { name: 'Salary', type: 'Income' },
            { name: 'Freelance', type: 'Income' },
            { name: 'Investment', type: 'Income' },
            { name: 'Other', type: 'Expense' }
        ];

        const existing = this.findAllByUser(userId);
        if (existing.length === 0) {
            defaults.forEach(cat => this.create(userId, cat));
        }
    }
};

export default Category;
