import { getDb, saveDb } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = {
    findByUsername(username) {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        stmt.bind([username]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    },

    findById(id) {
        const db = getDb();
        const stmt = db.prepare('SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    },

    create(username, password) {
        const db = getDb();
        const passwordHash = bcrypt.hashSync(password, 10);
        const now = new Date().toISOString();
        db.run(
            'INSERT INTO users (username, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
            [username, passwordHash, now, now]
        );
        const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        saveDb();
        return { id, username };
    },

    validatePassword(user, password) {
        return bcrypt.compareSync(password, user.passwordHash);
    },

    // Initialize default admin user if not exists
    initializeDefaultUser() {
        const existingUser = this.findByUsername('admin');
        if (!existingUser) {
            this.create('admin', 'password123');
            console.log('Default admin user created (admin/password123)');
        }
    }
};

export default User;
