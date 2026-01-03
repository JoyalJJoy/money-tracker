import express from 'express';
import {
    createTransaction,
    getTransactions,
    getTransaction,
    getTransactionByTxnId,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary,
    bulkCreateTransactions
} from '../controllers/transactionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Transaction routes
router.post('/', createTransaction);
router.post('/bulk', bulkCreateTransactions);
router.get('/', getTransactions);
router.get('/summary', getTransactionSummary);
router.get('/txn/:transactionId', getTransactionByTxnId);
router.get('/:id', getTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
