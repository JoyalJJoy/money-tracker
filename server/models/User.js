import db from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = {
    findByUsername(username) {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username);
    },

    findById(id) {
        const stmt = db.prepare('SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?');
        return stmt.get(id);
    },

    create(username, password) {
        const passwordHash = bcrypt.hashSync(password, 10);
        const now = new Date().toISOString();
        const stmt = db.prepare(
            'INSERT INTO users (username, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?)'
        );
        const result = stmt.run(username, passwordHash, now, now);
        return { id: result.lastInsertRowid, username };
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
