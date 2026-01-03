import { useState } from 'react';

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Healthcare', 'Other'];

const Filters = ({ onFilterChange, onAddClick }) => {
    const [dateFilter, setDateFilter] = useState('all');
    const [category, setCategory] = useState('');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const handleDateFilterChange = (value) => {
        setDateFilter(value);
        let startDate = '';
        let endDate = '';

        const today = new Date();

        if (value === 'today') {
            startDate = today.toISOString().split('T')[0];
            endDate = startDate;
        } else if (value === 'month') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            endDate = today.toISOString().split('T')[0];
        } else if (value === 'custom') {
            startDate = customStartDate;
            endDate = customEndDate;
        }

        applyFilters({ startDate, endDate });
    };

    const applyFilters = (overrides = {}) => {
        const filters = {
            startDate: overrides.startDate ?? (dateFilter === 'custom' ? customStartDate : ''),
            endDate: overrides.endDate ?? (dateFilter === 'custom' ? customEndDate : ''),
            category: overrides.category ?? category,
            minAmount: overrides.minAmount ?? minAmount,
            maxAmount: overrides.maxAmount ?? maxAmount,
            sortBy: overrides.sortBy ?? sortBy,
            sortOrder: overrides.sortOrder ?? sortOrder,
        };

        // Handle today filter
        if (dateFilter === 'today' && !overrides.startDate) {
            const today = new Date().toISOString().split('T')[0];
            filters.startDate = today;
            filters.endDate = today;
        }

        // Handle month filter
        if (dateFilter === 'month' && !overrides.startDate) {
            const today = new Date();
            filters.startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            filters.endDate = today.toISOString().split('T')[0];
        }

        onFilterChange(filters);
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        applyFilters({ category: value });
    };

    const handleSortChange = (field) => {
        if (sortBy === field) {
            const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
            setSortOrder(newOrder);
            applyFilters({ sortOrder: newOrder });
        } else {
            setSortBy(field);
            setSortOrder('desc');
            applyFilters({ sortBy: field, sortOrder: 'desc' });
        }
    };

    const handleAmountFilter = () => {
        applyFilters({ minAmount, maxAmount });
    };

    const clearFilters = () => {
        setDateFilter('all');
        setCategory('');
        setCustomStartDate('');
        setCustomEndDate('');
        setMinAmount('');
        setMaxAmount('');
        setSortBy('date');
        setSortOrder('desc');
        onFilterChange({});
    };

    return (
        <div className="glass rounded-2xl p-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-white">Filters & Actions</h3>
                <button
                    onClick={onAddClick}
                    className="btn-primary px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Filter */}
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Date Range</label>
                    <select
                        value={dateFilter}
                        onChange={(e) => handleDateFilterChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 input-focus"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Category</label>
                    <select
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 input-focus"
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Sort */}
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Sort By</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSortChange('date')}
                            className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === 'date'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                        </button>
                        <button
                            onClick={() => handleSortChange('amount')}
                            className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === 'amount'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
                        </button>
                    </div>
                </div>

                {/* Clear Filters */}
                <div>
                    <label className="block text-sm text-slate-400 mb-2">&nbsp;</label>
                    <button
                        onClick={clearFilters}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
                <div className="mt-4 flex flex-wrap gap-4 items-end animate-fade-in">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">End Date</label>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => applyFilters({ startDate: customStartDate, endDate: customEndDate })}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                        Apply
                    </button>
                </div>
            )}

            {/* Amount Range */}
            <div className="mt-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Min Amount</label>
                    <input
                        type="number"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        placeholder="0"
                        className="w-28 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Max Amount</label>
                    <input
                        type="number"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        placeholder="∞"
                        className="w-28 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <button
                    onClick={handleAmountFilter}
                    className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                    Apply Amount
                </button>
            </div>
        </div>
    );
};

export default Filters;
