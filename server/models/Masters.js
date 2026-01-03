import { getDb, saveDb } from '../config/database.js';

// Generic Master model factory for Platform, Mode, Status
const createMasterModel = (tableName, defaults = []) => ({
    findAllByUser(userId) {
        const db = getDb();
        const results = [];
        const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE userId = ? AND active = 1 ORDER BY name`);
        stmt.bind([userId]);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    },

    findById(id) {
        const db = getDb();
        const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    },

    create(userId, data) {
        const db = getDb();
        const now = new Date().toISOString();
        db.run(
            `INSERT INTO ${tableName} (userId, name, active, createdAt) VALUES (?, ?, 1, ?)`,
            [userId, data.name, now]
        );
        const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        saveDb();
        return this.findById(id);
    },

    update(id, userId, data) {
        const db = getDb();
        db.run(
            `UPDATE ${tableName} SET name = ? WHERE id = ? AND userId = ?`,
            [data.name, id, userId]
        );
        saveDb();
        return this.findById(id);
    },

    delete(id, userId) {
        const db = getDb();
        db.run(`UPDATE ${tableName} SET active = 0 WHERE id = ? AND userId = ?`, [id, userId]);
        saveDb();
        return true;
    },

    initializeDefaults(userId) {
        const existing = this.findAllByUser(userId);
        if (existing.length === 0) {
            defaults.forEach(name => this.create(userId, { name }));
        }
    }
});

// Platform Master (Amazon, Swiggy, etc.)
export const Platform = createMasterModel('platforms', [
    'Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'PhonePe', 'GPay', 'Paytm', 'Offline', 'Other'
]);

// Mode Master (Cash, UPI, Card, etc.)
export const Mode = createMasterModel('modes', [
    'Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Other'
]);

// Status Master
export const Status = createMasterModel('statuses', [
    'Completed', 'Pending', 'Planned', 'Cancelled', 'Refunded', 'Failed'
]);
