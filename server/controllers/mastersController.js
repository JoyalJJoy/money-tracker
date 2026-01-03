import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import { Platform, Mode, Status } from '../models/Masters.js';

// =====================
// CATEGORIES
// =====================

export const getCategories = (req, res) => {
    try {
        const categories = Category.findAllByUser(req.userId);
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createCategory = (req, res) => {
    try {
        const { name, type, budget } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const category = Category.create(req.userId, { name, type, budget });
        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateCategory = (req, res) => {
    try {
        const { name, type, budget } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const category = Category.update(parseInt(req.params.id), req.userId, { name, type, budget });
        res.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteCategory = (req, res) => {
    try {
        Category.delete(parseInt(req.params.id), req.userId);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// =====================
// SUBCATEGORIES
// =====================

export const getSubCategories = (req, res) => {
    try {
        const subcategories = SubCategory.findAllByUser(req.userId);
        res.json(subcategories);
    } catch (error) {
        console.error('Get subcategories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSubCategoriesByCategory = (req, res) => {
    try {
        const subcategories = SubCategory.findByCategoryId(parseInt(req.params.categoryId));
        res.json(subcategories);
    } catch (error) {
        console.error('Get subcategories by category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createSubCategory = (req, res) => {
    try {
        const { categoryId, name } = req.body;
        if (!name || !categoryId) {
            return res.status(400).json({ error: 'Name and categoryId are required' });
        }
        const subcategory = SubCategory.create(categoryId, { name });
        res.status(201).json(subcategory);
    } catch (error) {
        console.error('Create subcategory error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateSubCategory = (req, res) => {
    try {
        const { name, categoryId } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const subcategory = SubCategory.update(parseInt(req.params.id), { name, categoryId });
        res.json(subcategory);
    } catch (error) {
        console.error('Update subcategory error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteSubCategory = (req, res) => {
    try {
        SubCategory.delete(parseInt(req.params.id));
        res.json({ message: 'SubCategory deleted' });
    } catch (error) {
        console.error('Delete subcategory error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// =====================
// PLATFORMS
// =====================

export const getPlatforms = (req, res) => {
    try {
        const platforms = Platform.findAllByUser(req.userId);
        res.json(platforms);
    } catch (error) {
        console.error('Get platforms error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createPlatform = (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const platform = Platform.create(req.userId, { name });
        res.status(201).json(platform);
    } catch (error) {
        console.error('Create platform error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updatePlatform = (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const platform = Platform.update(parseInt(req.params.id), req.userId, { name });
        res.json(platform);
    } catch (error) {
        console.error('Update platform error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deletePlatform = (req, res) => {
    try {
        Platform.delete(parseInt(req.params.id), req.userId);
        res.json({ message: 'Platform deleted' });
    } catch (error) {
        console.error('Delete platform error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// =====================
// MODES
// =====================

export const getModes = (req, res) => {
    try {
        const modes = Mode.findAllByUser(req.userId);
        res.json(modes);
    } catch (error) {
        console.error('Get modes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createMode = (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const mode = Mode.create(req.userId, { name });
        res.status(201).json(mode);
    } catch (error) {
        console.error('Create mode error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateMode = (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const mode = Mode.update(parseInt(req.params.id), req.userId, { name });
        res.json(mode);
    } catch (error) {
        console.error('Update mode error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteMode = (req, res) => {
    try {
        Mode.delete(parseInt(req.params.id), req.userId);
        res.json({ message: 'Mode deleted' });
    } catch (error) {
        console.error('Delete mode error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// =====================
// STATUSES
// =====================

export const getStatuses = (req, res) => {
    try {
        const statuses = Status.findAllByUser(req.userId);
        res.json(statuses);
    } catch (error) {
        console.error('Get statuses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createStatus = (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const status = Status.create(req.userId, { name });
        res.status(201).json(status);
    } catch (error) {
        console.error('Create status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateStatus = (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const status = Status.update(parseInt(req.params.id), req.userId, { name });
        res.json(status);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteStatus = (req, res) => {
    try {
        Status.delete(parseInt(req.params.id), req.userId);
        res.json({ message: 'Status deleted' });
    } catch (error) {
        console.error('Delete status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
