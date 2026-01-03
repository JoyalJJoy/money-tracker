import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    getSubCategories, getSubCategoriesByCategory, createSubCategory, updateSubCategory, deleteSubCategory,
    getPlatforms, createPlatform, updatePlatform, deletePlatform,
    getModes, createMode, updateMode, deleteMode,
    getStatuses, createStatus, updateStatus, deleteStatus,
    getAccounts, createAccount, updateAccount, deleteAccount
} from '../controllers/mastersController.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// SubCategories
router.get('/subcategories', getSubCategories);
router.get('/subcategories/category/:categoryId', getSubCategoriesByCategory);
router.post('/subcategories', createSubCategory);
router.put('/subcategories/:id', updateSubCategory);
router.delete('/subcategories/:id', deleteSubCategory);

// Platforms
router.get('/platforms', getPlatforms);
router.post('/platforms', createPlatform);
router.put('/platforms/:id', updatePlatform);
router.delete('/platforms/:id', deletePlatform);

// Modes
router.get('/modes', getModes);
router.post('/modes', createMode);
router.put('/modes/:id', updateMode);
router.delete('/modes/:id', deleteMode);

// Statuses
router.get('/statuses', getStatuses);
router.post('/statuses', createStatus);
router.put('/statuses/:id', updateStatus);
router.delete('/statuses/:id', deleteStatus);

// Accounts
router.get('/accounts', getAccounts);
router.post('/accounts', createAccount);
router.put('/accounts/:id', updateAccount);
router.delete('/accounts/:id', deleteAccount);

export default router;

