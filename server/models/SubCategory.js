import { getDb, saveDb } from '../config/database.js';

const SubCategory = {
    // Get all subcategories for a category
    findByCategoryId(categoryId) {
        const db = getDb();
        const results = [];
        const stmt = db.prepare('SELECT * FROM subcategories WHERE categoryId = ? AND active = 1 ORDER BY name');
        stmt.bind([categoryId]);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    },

    // Get all subcategories for a user (via categories)
    findAllByUser(userId) {
        const db = getDb();
        const results = [];
        const stmt = db.prepare(`
      SELECT s.*, c.name as categoryName 
      FROM subcategories s 
      JOIN categories c ON s.categoryId = c.id 
      WHERE c.userId = ? AND s.active = 1 
      ORDER BY c.name, s.name
    `);
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
        const stmt = db.prepare('SELECT * FROM subcategories WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    },

    // Create subcategory
    create(categoryId, data) {
        const db = getDb();
        const now = new Date().toISOString();
        db.run(
            'INSERT INTO subcategories (categoryId, name, active, createdAt) VALUES (?, ?, 1, ?)',
            [categoryId, data.name, now]
        );
        const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        saveDb();
        return this.findById(id);
    },

    // Update subcategory
    update(id, data) {
        const db = getDb();
        db.run(
            'UPDATE subcategories SET name = ?, categoryId = ? WHERE id = ?',
            [data.name, data.categoryId, id]
        );
        saveDb();
        return this.findById(id);
    },

    // Soft delete
    delete(id) {
        const db = getDb();
        db.run('UPDATE subcategories SET active = 0 WHERE id = ?', [id]);
        saveDb();
        return true;
    }
};

export default SubCategory;
