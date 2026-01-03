import Transaction from '../models/Transaction.js';

/**
 * Transaction Controller
 * Handles all CRUD operations for Master_Transactions
 */

// Create transaction
export const createTransaction = (req, res) => {
    try {
        const {
            date,
            type,
            categoryId,
            subcategoryId,
            description,
            quantity,
            unitPrice,
            manualAmount,
            accountId,
            statusId,
            modeId,
            platformId,
            notes
        } = req.body;

        // Validate required fields
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        // Validate type
        const validTypes = ['Income', 'Expense', 'Transfer'];
        if (type && !validTypes.includes(type)) {
            return res.status(400).json({ error: 'Type must be Income, Expense, or Transfer' });
        }

        // Validate amount calculation
        const hasQuantityAndPrice = quantity !== undefined && quantity !== null &&
            unitPrice !== undefined && unitPrice !== null;
        const hasManualAmount = manualAmount !== undefined && manualAmount !== null;

        if (!hasQuantityAndPrice && !hasManualAmount) {
            return res.status(400).json({
                error: 'Either Quantity and UnitPrice, or ManualAmount must be provided'
            });
        }

        const transaction = Transaction.create(req.userId, {
            date,
            type: type || 'Expense',
            categoryId,
            subcategoryId,
            description,
            quantity,
            unitPrice,
            manualAmount,
            accountId,
            statusId,
            modeId,
            platformId,
            notes
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all transactions with filters
export const getTransactions = (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            type: req.query.type,
            categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
            subcategoryId: req.query.subcategoryId ? parseInt(req.query.subcategoryId) : undefined,
            accountId: req.query.accountId ? parseInt(req.query.accountId) : undefined,
            statusId: req.query.statusId ? parseInt(req.query.statusId) : undefined,
            modeId: req.query.modeId ? parseInt(req.query.modeId) : undefined,
            platformId: req.query.platformId ? parseInt(req.query.platformId) : undefined,
            financialYear: req.query.financialYear,
            year: req.query.year ? parseInt(req.query.year) : undefined,
            monthNumber: req.query.monthNumber ? parseInt(req.query.monthNumber) : undefined,
            week: req.query.week ? parseInt(req.query.week) : undefined,
            minAmount: req.query.minAmount ? parseFloat(req.query.minAmount) : undefined,
            maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount) : undefined,
            isWeekend: req.query.isWeekend !== undefined ? req.query.isWeekend === 'true' : undefined,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined
        };

        const transactions = Transaction.findAllByUser(req.userId, filters);
        const count = Transaction.count(req.userId, filters);

        res.json({
            transactions,
            total: count,
            limit: filters.limit,
            offset: filters.offset || 0
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single transaction
export const getTransaction = (req, res) => {
    try {
        const transaction = Transaction.findByIdAndUser(parseInt(req.params.id), req.userId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get transaction by TransactionID
export const getTransactionByTxnId = (req, res) => {
    try {
        const transaction = Transaction.findByTransactionId(req.params.transactionId);
        if (!transaction || transaction.userId !== req.userId) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        console.error('Get transaction by txnId error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update transaction
export const updateTransaction = (req, res) => {
    try {
        const transactionId = parseInt(req.params.id);
        const existing = Transaction.findByIdAndUser(transactionId, req.userId);

        if (!existing) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const {
            date,
            type,
            categoryId,
            subcategoryId,
            description,
            quantity,
            unitPrice,
            manualAmount,
            accountId,
            statusId,
            modeId,
            platformId,
            notes
        } = req.body;

        // Validate type if provided
        if (type) {
            const validTypes = ['Income', 'Expense', 'Transfer'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ error: 'Type must be Income, Expense, or Transfer' });
            }
        }

        const transaction = Transaction.update(transactionId, req.userId, {
            date,
            type,
            categoryId,
            subcategoryId,
            description,
            quantity,
            unitPrice,
            manualAmount,
            accountId,
            statusId,
            modeId,
            platformId,
            notes
        });

        res.json(transaction);
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete transaction
export const deleteTransaction = (req, res) => {
    try {
        const deleted = Transaction.delete(parseInt(req.params.id), req.userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get transaction summary
export const getTransactionSummary = (req, res) => {
    try {
        const filters = {
            financialYear: req.query.financialYear,
            year: req.query.year ? parseInt(req.query.year) : undefined,
            monthNumber: req.query.monthNumber ? parseInt(req.query.monthNumber) : undefined,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };

        const summary = Transaction.getSummary(req.userId, filters);
        res.json(summary);
    } catch (error) {
        console.error('Get transaction summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Bulk create transactions
export const bulkCreateTransactions = (req, res) => {
    try {
        const { transactions } = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ error: 'Transactions array is required' });
        }

        const results = [];
        const errors = [];

        transactions.forEach((txn, index) => {
            try {
                if (!txn.date || !txn.description) {
                    errors.push({ index, error: 'Date and description are required' });
                    return;
                }

                const hasAmount = (txn.quantity && txn.unitPrice) || txn.manualAmount;
                if (!hasAmount) {
                    errors.push({ index, error: 'Either Quantity/UnitPrice or ManualAmount required' });
                    return;
                }

                const created = Transaction.create(req.userId, txn);
                results.push(created);
            } catch (err) {
                errors.push({ index, error: err.message });
            }
        });

        res.status(201).json({
            created: results.length,
            failed: errors.length,
            transactions: results,
            errors
        });
    } catch (error) {
        console.error('Bulk create transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
