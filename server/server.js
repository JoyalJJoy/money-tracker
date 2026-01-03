import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import mastersRoutes from './routes/mastersRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import User from './models/User.js';
import Category from './models/Category.js';
import { Platform, Mode, Status, Account } from './models/Masters.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for development and production
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/masters', mastersRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize default data for user
const initializeUserDefaults = (userId) => {
    Category.initializeDefaults(userId);
    Platform.initializeDefaults(userId);
    Mode.initializeDefaults(userId);
    Status.initializeDefaults(userId);
    Account.initializeDefaults(userId);
};

// Initialize database and start server
const startServer = async () => {
    try {
        await initDb();
        console.log('Database initialized');

        const user = User.initializeDefaultUser();

        // Initialize default masters for admin user
        const adminUser = User.findByUsername('admin');
        if (adminUser) {
            initializeUserDefaults(adminUser.id);
            console.log('Default masters initialized for admin user');
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
