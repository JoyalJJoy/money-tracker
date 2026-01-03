import { getDb, saveDb } from '../config/database.js';

/**
 * Master_Transactions Model
 * 
 * Mandatory Columns:
 * - TransactionID (auto-generated)
 * - Date
 * - Week
 * - Year (derived)
 * - FinancialYear (derived)
 * - Month (derived)
 * - MonthNumber (derived)
 * - WeekdayNumber (derived)
 * - IsWeekend (derived)
 * - Type (Income / Expense / Transfer)
 * - Category
 * - SubCategory
 * - Description
 * - Quantity
 * - UnitPrice
 * - ManualAmount
 * - Amount (auto-calculated)
 * - Account
 * - Status
 * - Mode
 * - Platform
 * - Notes
 * - EntryTimestamp
 * 
 * Rules:
 * - Amount = Quantity × UnitPrice if both present, else ManualAmount
 * - Derived date fields are locked (computed from Date)
 * - This is the only place where manual entries are allowed
 */

// Helper Functions for Derived Date Fields
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Generate a unique Transaction ID
 * Format: TXN-YYYYMMDD-XXXXXX (where X is random alphanumeric)
 */
const generateTransactionId = (date) => {
    const dateStr = date.replace(/-/g, '');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TXN-${dateStr}-${suffix}`;
};

/**
 * Get ISO week number from a date
 */
const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Calculate Financial Year (April to March)
 * Format: FY2025-26
 */
const getFinancialYear = (date) => {
    const d = new Date(date);
    const month = d.getMonth(); // 0-11
    const year = d.getFullYear();

    // If month is April (3) or later, FY starts this year
    // If month is before April, FY started previous year
    const fyStartYear = month >= 3 ? year : year - 1;
    const fyEndYear = fyStartYear + 1;

    return `FY${fyStartYear}-${String(fyEndYear).slice(-2)}`;
};

/**
 * Derive all date-related fields from the transaction date
 */
const deriveDateFields = (dateStr) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    return {
        week: getWeekNumber(dateStr),
        year: date.getFullYear(),
        financialYear: getFinancialYear(dateStr),
        month: MONTHS[date.getMonth()],
        monthNumber: date.getMonth() + 1, // 1-12
        weekdayNumber: dayOfWeek, // 0-6 (Sunday = 0)
        isWeekend: (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0
    };
};

/**
 * Calculate Amount based on rules:
 * Amount = Quantity × UnitPrice if both present, else ManualAmount
 */
const calculateAmount = (quantity, unitPrice, manualAmount) => {
    if (quantity !== null && quantity !== undefined &&
        unitPrice !== null && unitPrice !== undefined) {
        return quantity * unitPrice;
    }
    return manualAmount || 0;
};

const Transaction = {
    /**
     * Create a new transaction
     * Only Date, Type, Description are required. Amount is auto-calculated.
     */
    create(userId, data) {
        const db = getDb();
        const now = new Date().toISOString();

        // Generate Transaction ID
        const transactionId = generateTransactionId(data.date);

        // Derive all date fields
        const dateFields = deriveDateFields(data.date);

        // Calculate Amount
        const amount = calculateAmount(data.quantity, data.unitPrice, data.manualAmount);

        db.run(
            `INSERT INTO master_transactions (
                transactionId, userId,
                date, week, year, financialYear, month, monthNumber, weekdayNumber, isWeekend,
                type, categoryId, subcategoryId,
                description, quantity, unitPrice, manualAmount, amount,
                accountId, statusId, modeId, platformId,
                notes, entryTimestamp, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                transactionId, userId,
                data.date, dateFields.week, dateFields.year, dateFields.financialYear,
                dateFields.month, dateFields.monthNumber, dateFields.weekdayNumber, dateFields.isWeekend,
                data.type || 'Expense',
                data.categoryId || null, data.subcategoryId || null,
                data.description,
                data.quantity || null, data.unitPrice || null, data.manualAmount || null, amount,
                data.accountId || null, data.statusId || null, data.modeId || null, data.platformId || null,
                data.notes || null, now, now, now
            ]
        );

        const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        saveDb();
        return this.findById(id);
    },

    /**
     * Find transaction by internal ID
     */
    findById(id) {
        const db = getDb();
        const stmt = db.prepare(`
            SELECT 
                t.*,
                c.name as categoryName,
                sc.name as subcategoryName,
                a.name as accountName,
                s.name as statusName,
                m.name as modeName,
                p.name as platformName
            FROM master_transactions t
            LEFT JOIN categories c ON t.categoryId = c.id
            LEFT JOIN subcategories sc ON t.subcategoryId = sc.id
            LEFT JOIN accounts a ON t.accountId = a.id
            LEFT JOIN statuses s ON t.statusId = s.id
            LEFT JOIN modes m ON t.modeId = m.id
            LEFT JOIN platforms p ON t.platformId = p.id
            WHERE t.id = ?
        `);
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return this.formatTransaction(row);
        }
        stmt.free();
        return null;
    },

    /**
     * Find transaction by TransactionID
     */
    findByTransactionId(transactionId) {
        const db = getDb();
        const stmt = db.prepare(`
            SELECT 
                t.*,
                c.name as categoryName,
                sc.name as subcategoryName,
                a.name as accountName,
                s.name as statusName,
                m.name as modeName,
                p.name as platformName
            FROM master_transactions t
            LEFT JOIN categories c ON t.categoryId = c.id
            LEFT JOIN subcategories sc ON t.subcategoryId = sc.id
            LEFT JOIN accounts a ON t.accountId = a.id
            LEFT JOIN statuses s ON t.statusId = s.id
            LEFT JOIN modes m ON t.modeId = m.id
            LEFT JOIN platforms p ON t.platformId = p.id
            WHERE t.transactionId = ?
        `);
        stmt.bind([transactionId]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return this.formatTransaction(row);
        }
        stmt.free();
        return null;
    },

    /**
     * Find transaction by ID and User
     */
    findByIdAndUser(id, userId) {
        const db = getDb();
        const stmt = db.prepare(`
            SELECT 
                t.*,
                c.name as categoryName,
                sc.name as subcategoryName,
                a.name as accountName,
                s.name as statusName,
                m.name as modeName,
                p.name as platformName
            FROM master_transactions t
            LEFT JOIN categories c ON t.categoryId = c.id
            LEFT JOIN subcategories sc ON t.subcategoryId = sc.id
            LEFT JOIN accounts a ON t.accountId = a.id
            LEFT JOIN statuses s ON t.statusId = s.id
            LEFT JOIN modes m ON t.modeId = m.id
            LEFT JOIN platforms p ON t.platformId = p.id
            WHERE t.id = ? AND t.userId = ?
        `);
        stmt.bind([id, userId]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return this.formatTransaction(row);
        }
        stmt.free();
        return null;
    },

    /**
     * Find all transactions for a user with optional filters
     */
    findAllByUser(userId, filters = {}) {
        const db = getDb();
        let query = `
            SELECT 
                t.*,
                c.name as categoryName,
                sc.name as subcategoryName,
                a.name as accountName,
                s.name as statusName,
                m.name as modeName,
                p.name as platformName
            FROM master_transactions t
            LEFT JOIN categories c ON t.categoryId = c.id
            LEFT JOIN subcategories sc ON t.subcategoryId = sc.id
            LEFT JOIN accounts a ON t.accountId = a.id
            LEFT JOIN statuses s ON t.statusId = s.id
            LEFT JOIN modes m ON t.modeId = m.id
            LEFT JOIN platforms p ON t.platformId = p.id
            WHERE t.userId = ?
        `;
        const params = [userId];

        // Date range filter
        if (filters.startDate) {
            query += ' AND t.date >= ?';
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            query += ' AND t.date <= ?';
            params.push(filters.endDate);
        }

        // Type filter
        if (filters.type) {
            query += ' AND t.type = ?';
            params.push(filters.type);
        }

        // Category filter
        if (filters.categoryId) {
            query += ' AND t.categoryId = ?';
            params.push(filters.categoryId);
        }

        // Subcategory filter
        if (filters.subcategoryId) {
            query += ' AND t.subcategoryId = ?';
            params.push(filters.subcategoryId);
        }

        // Account filter
        if (filters.accountId) {
            query += ' AND t.accountId = ?';
            params.push(filters.accountId);
        }

        // Financial Year filter
        if (filters.financialYear) {
            query += ' AND t.financialYear = ?';
            params.push(filters.financialYear);
        }

        // Year filter
        if (filters.year) {
            query += ' AND t.year = ?';
            params.push(filters.year);
        }

        // Month filter
        if (filters.monthNumber) {
            query += ' AND t.monthNumber = ?';
            params.push(filters.monthNumber);
        }

        // Week filter
        if (filters.week) {
            query += ' AND t.week = ?';
            params.push(filters.week);
        }

        // Amount range filter
        if (filters.minAmount !== undefined) {
            query += ' AND t.amount >= ?';
            params.push(filters.minAmount);
        }
        if (filters.maxAmount !== undefined) {
            query += ' AND t.amount <= ?';
            params.push(filters.maxAmount);
        }

        // Status filter
        if (filters.statusId) {
            query += ' AND t.statusId = ?';
            params.push(filters.statusId);
        }

        // Mode filter
        if (filters.modeId) {
            query += ' AND t.modeId = ?';
            params.push(filters.modeId);
        }

        // Platform filter
        if (filters.platformId) {
            query += ' AND t.platformId = ?';
            params.push(filters.platformId);
        }

        // Weekend filter
        if (filters.isWeekend !== undefined) {
            query += ' AND t.isWeekend = ?';
            params.push(filters.isWeekend ? 1 : 0);
        }

        // Sorting
        const sortBy = filters.sortBy || 'date';
        const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY t.${sortBy} ${sortOrder}`;

        // Pagination
        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }
        }

        const results = [];
        const stmt = db.prepare(query);
        stmt.bind(params);
        while (stmt.step()) {
            results.push(this.formatTransaction(stmt.getAsObject()));
        }
        stmt.free();
        return results;
    },

    /**
     * Update a transaction
     * Note: Date fields are recalculated if date changes
     */
    update(id, userId, data) {
        const db = getDb();
        const now = new Date().toISOString();

        // Fetch existing transaction
        const existing = this.findByIdAndUser(id, userId);
        if (!existing) return null;

        // If date changed, recalculate derived fields
        let dateFields = {};
        if (data.date && data.date !== existing.date) {
            dateFields = deriveDateFields(data.date);
        }

        // Recalculate amount if quantity, unitPrice, or manualAmount changed
        const quantity = data.quantity !== undefined ? data.quantity : existing.quantity;
        const unitPrice = data.unitPrice !== undefined ? data.unitPrice : existing.unitPrice;
        const manualAmount = data.manualAmount !== undefined ? data.manualAmount : existing.manualAmount;
        const amount = calculateAmount(quantity, unitPrice, manualAmount);

        db.run(
            `UPDATE master_transactions SET
                date = COALESCE(?, date),
                week = COALESCE(?, week),
                year = COALESCE(?, year),
                financialYear = COALESCE(?, financialYear),
                month = COALESCE(?, month),
                monthNumber = COALESCE(?, monthNumber),
                weekdayNumber = COALESCE(?, weekdayNumber),
                isWeekend = COALESCE(?, isWeekend),
                type = COALESCE(?, type),
                categoryId = ?,
                subcategoryId = ?,
                description = COALESCE(?, description),
                quantity = ?,
                unitPrice = ?,
                manualAmount = ?,
                amount = ?,
                accountId = ?,
                statusId = ?,
                modeId = ?,
                platformId = ?,
                notes = ?,
                updatedAt = ?
            WHERE id = ? AND userId = ?`,
            [
                data.date || null,
                dateFields.week || null,
                dateFields.year || null,
                dateFields.financialYear || null,
                dateFields.month || null,
                dateFields.monthNumber || null,
                dateFields.weekdayNumber || null,
                dateFields.isWeekend !== undefined ? dateFields.isWeekend : null,
                data.type || null,
                data.categoryId !== undefined ? data.categoryId : existing.categoryId,
                data.subcategoryId !== undefined ? data.subcategoryId : existing.subcategoryId,
                data.description || null,
                quantity, unitPrice, manualAmount, amount,
                data.accountId !== undefined ? data.accountId : existing.accountId,
                data.statusId !== undefined ? data.statusId : existing.statusId,
                data.modeId !== undefined ? data.modeId : existing.modeId,
                data.platformId !== undefined ? data.platformId : existing.platformId,
                data.notes !== undefined ? data.notes : existing.notes,
                now,
                id, userId
            ]
        );

        saveDb();
        return this.findById(id);
    },

    /**
     * Delete a transaction
     */
    delete(id, userId) {
        const db = getDb();
        const existing = this.findByIdAndUser(id, userId);
        if (!existing) return false;

        db.run('DELETE FROM master_transactions WHERE id = ? AND userId = ?', [id, userId]);
        saveDb();
        return true;
    },

    /**
     * Get summary statistics
     */
    getSummary(userId, filters = {}) {
        const db = getDb();
        let whereClause = 'WHERE userId = ?';
        const params = [userId];

        if (filters.financialYear) {
            whereClause += ' AND financialYear = ?';
            params.push(filters.financialYear);
        }
        if (filters.year) {
            whereClause += ' AND year = ?';
            params.push(filters.year);
        }
        if (filters.monthNumber) {
            whereClause += ' AND monthNumber = ?';
            params.push(filters.monthNumber);
        }
        if (filters.startDate) {
            whereClause += ' AND date >= ?';
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            whereClause += ' AND date <= ?';
            params.push(filters.endDate);
        }

        // Totals by type
        let result = db.exec(`
            SELECT type, SUM(amount) as total, COUNT(*) as count 
            FROM master_transactions ${whereClause}
            GROUP BY type
        `, params);

        const byType = {};
        if (result.length > 0) {
            result[0].values.forEach(row => {
                byType[row[0]] = { total: row[1] || 0, count: row[2] };
            });
        }

        const totalIncome = byType['Income']?.total || 0;
        const totalExpense = byType['Expense']?.total || 0;
        const totalTransfer = byType['Transfer']?.total || 0;
        const netAmount = totalIncome - totalExpense;

        // By category (for expenses)
        result = db.exec(`
            SELECT c.name as category, SUM(t.amount) as total, COUNT(*) as count 
            FROM master_transactions t
            LEFT JOIN categories c ON t.categoryId = c.id
            ${whereClause.replace('WHERE', 'WHERE t.')} AND t.type = 'Expense'
            GROUP BY t.categoryId
            ORDER BY total DESC
        `, params);

        const byCategory = result.length > 0 ? result[0].values.map(row => ({
            category: row[0] || 'Uncategorized',
            total: row[1] || 0,
            count: row[2]
        })) : [];

        // By month
        result = db.exec(`
            SELECT month, monthNumber, SUM(amount) as total, COUNT(*) as count 
            FROM master_transactions ${whereClause}
            GROUP BY monthNumber
            ORDER BY monthNumber
        `, params);

        const byMonth = result.length > 0 ? result[0].values.map(row => ({
            month: row[0],
            monthNumber: row[1],
            total: row[2] || 0,
            count: row[3]
        })) : [];

        return {
            totalIncome,
            totalExpense,
            totalTransfer,
            netAmount,
            transactionCount: (byType['Income']?.count || 0) + (byType['Expense']?.count || 0) + (byType['Transfer']?.count || 0),
            byType,
            byCategory,
            byMonth
        };
    },

    /**
     * Format transaction for API response
     */
    formatTransaction(row) {
        return {
            id: row.id,
            transactionId: row.transactionId,
            date: row.date,
            week: row.week,
            year: row.year,
            financialYear: row.financialYear,
            month: row.month,
            monthNumber: row.monthNumber,
            weekdayNumber: row.weekdayNumber,
            isWeekend: row.isWeekend === 1,
            type: row.type,
            category: row.categoryName || null,
            categoryId: row.categoryId,
            subCategory: row.subcategoryName || null,
            subcategoryId: row.subcategoryId,
            description: row.description,
            quantity: row.quantity,
            unitPrice: row.unitPrice,
            manualAmount: row.manualAmount,
            amount: row.amount,
            account: row.accountName || null,
            accountId: row.accountId,
            status: row.statusName || null,
            statusId: row.statusId,
            mode: row.modeName || null,
            modeId: row.modeId,
            platform: row.platformName || null,
            platformId: row.platformId,
            notes: row.notes,
            entryTimestamp: row.entryTimestamp,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        };
    },

    /**
     * Get count of transactions
     */
    count(userId, filters = {}) {
        const db = getDb();
        let query = 'SELECT COUNT(*) as count FROM master_transactions WHERE userId = ?';
        const params = [userId];

        if (filters.type) {
            query += ' AND type = ?';
            params.push(filters.type);
        }
        if (filters.financialYear) {
            query += ' AND financialYear = ?';
            params.push(filters.financialYear);
        }

        const result = db.exec(query, params);
        return result.length > 0 ? result[0].values[0][0] : 0;
    }
};

export default Transaction;
