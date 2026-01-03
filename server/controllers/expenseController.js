import Expense from '../models/Expense.js';

// Create expense
export const createExpense = (req, res) => {
    try {
        const { title, amount, category, date, notes } = req.body;

        if (!title || amount === undefined || !category || !date) {
            return res.status(400).json({ error: 'Title, amount, category, and date are required' });
        }

        if (typeof amount !== 'number' || amount < 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        const expense = Expense.create(req.userId, { title, amount, category, date, notes });
        res.status(201).json(expense);
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all expenses with filters
export const getExpenses = (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            category: req.query.category,
            minAmount: req.query.minAmount ? parseFloat(req.query.minAmount) : undefined,
            maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount) : undefined,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder
        };

        const expenses = Expense.findAllByUser(req.userId, filters);
        res.json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single expense
export const getExpense = (req, res) => {
    try {
        const expense = Expense.findByIdAndUser(parseInt(req.params.id), req.userId);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json(expense);
    } catch (error) {
        console.error('Get expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update expense
export const updateExpense = (req, res) => {
    try {
        const { title, amount, category, date, notes } = req.body;
        const expenseId = parseInt(req.params.id);

        const existing = Expense.findByIdAndUser(expenseId, req.userId);
        if (!existing) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        if (!title || amount === undefined || !category || !date) {
            return res.status(400).json({ error: 'Title, amount, category, and date are required' });
        }

        if (typeof amount !== 'number' || amount < 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        const expense = Expense.update(expenseId, req.userId, { title, amount, category, date, notes });
        res.json(expense);
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete expense
export const deleteExpense = (req, res) => {
    try {
        const deleted = Expense.delete(parseInt(req.params.id), req.userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get expense summary
export const getSummary = (req, res) => {
    try {
        const summary = Expense.getSummary(req.userId);
        res.json(summary);
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
