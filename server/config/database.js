import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'money_tracker.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

// Initialize SQL.js and database
const initDb = async () => {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // =====================
  // USERS TABLE
  // =====================
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =====================
  // MASTER TABLES
  // =====================

  // Categories Master
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'Expense',
      budget REAL,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // SubCategories Master
  db.run(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      name TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // Platforms Master (Amazon, Swiggy, etc.)
  db.run(`
    CREATE TABLE IF NOT EXISTS platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Modes Master (Cash, UPI, Card, etc.)
  db.run(`
    CREATE TABLE IF NOT EXISTS modes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Statuses Master
  db.run(`
    CREATE TABLE IF NOT EXISTS statuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // =====================
  // Accounts Master (Bank accounts, wallets, etc.)
  // =====================
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'Bank',
      balance REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // =====================
  // MASTER_TRANSACTIONS TABLE (Enhanced from expenses)
  // Stores all financial transactions with comprehensive fields
  // =====================
  db.run(`
    CREATE TABLE IF NOT EXISTS master_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transactionId TEXT UNIQUE NOT NULL,
      userId INTEGER NOT NULL,
      
      -- Date and Time Fields
      date TEXT NOT NULL,
      week INTEGER NOT NULL,
      year INTEGER NOT NULL,
      financialYear TEXT NOT NULL,
      month TEXT NOT NULL,
      monthNumber INTEGER NOT NULL,
      weekdayNumber INTEGER NOT NULL,
      isWeekend INTEGER NOT NULL DEFAULT 0,
      
      -- Transaction Type
      type TEXT NOT NULL DEFAULT 'Expense' CHECK(type IN ('Income', 'Expense', 'Transfer')),
      
      -- Category Information
      categoryId INTEGER,
      subcategoryId INTEGER,
      
      -- Transaction Details
      description TEXT NOT NULL,
      quantity REAL,
      unitPrice REAL,
      manualAmount REAL,
      amount REAL NOT NULL,
      
      -- Account and Status
      accountId INTEGER,
      statusId INTEGER,
      modeId INTEGER,
      platformId INTEGER,
      
      -- Additional Information
      notes TEXT,
      entryTimestamp TEXT NOT NULL,
      
      -- Audit Fields
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      
      -- Foreign Keys
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories(id),
      FOREIGN KEY (subcategoryId) REFERENCES subcategories(id),
      FOREIGN KEY (accountId) REFERENCES accounts(id),
      FOREIGN KEY (statusId) REFERENCES statuses(id),
      FOREIGN KEY (modeId) REFERENCES modes(id),
      FOREIGN KEY (platformId) REFERENCES platforms(id)
    )
  `);

  // Keep old transactions table for backward compatibility
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT DEFAULT 'Expense',
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      quantity REAL,
      unitPrice REAL,
      categoryId INTEGER,
      subcategoryId INTEGER,
      statusId INTEGER,
      modeId INTEGER,
      platformId INTEGER,
      date TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories(id),
      FOREIGN KEY (subcategoryId) REFERENCES subcategories(id),
      FOREIGN KEY (statusId) REFERENCES statuses(id),
      FOREIGN KEY (modeId) REFERENCES modes(id),
      FOREIGN KEY (platformId) REFERENCES platforms(id)
    )
  `);

  // Keep old expenses table for backward compatibility (will migrate data)
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Indexes for master_transactions
  db.run('CREATE INDEX IF NOT EXISTS idx_master_transactions_userId ON master_transactions(userId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_master_transactions_date ON master_transactions(date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_master_transactions_type ON master_transactions(type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_master_transactions_year ON master_transactions(year)');
  db.run('CREATE INDEX IF NOT EXISTS idx_master_transactions_financialYear ON master_transactions(financialYear)');
  db.run('CREATE INDEX IF NOT EXISTS idx_master_transactions_monthNumber ON master_transactions(monthNumber)');
  db.run('CREATE INDEX IF NOT EXISTS idx_master_transactions_transactionId ON master_transactions(transactionId)');

  // Legacy indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_transactions_userId ON transactions(userId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_categories_userId ON categories(userId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId)');

  // Save database
  saveDb();

  return db;
};

// Save database to file
const saveDb = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// Get database instance
const getDb = () => db;

export { initDb, getDb, saveDb };
