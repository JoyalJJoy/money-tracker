import express from 'express';
import {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getSummary
} from '../controllers/expenseController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/summary', getSummary);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
