import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import { transactionsAPI } from '../services/api';

const MasterTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        type: '',
        startDate: '',
        endDate: '',
        search: '' // not implemented in backend yet but we can keep it for future or simple client side
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const offset = (page - 1) * limit;
            const res = await transactionsAPI.getAll({
                ...filters,
                limit,
                offset,
                sortBy: 'date',
                sortOrder: 'desc'
            });
            setTransactions(res.data.transactions);
            setTotal(res.data.total);

            // Fetch summary only on first load or filter change (optional optimization)
            const summaryRes = await transactionsAPI.getSummary(filters);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const handleEdit = (txn) => {
        setEditingTransaction(txn);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await transactionsAPI.delete(id);
                fetchData();
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleSubmit = async (data) => {
        if (editingTransaction) {
            await transactionsAPI.update(editingTransaction.id, data);
        } else {
            await transactionsAPI.create(data);
        }
        fetchData();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to first page
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <Navbar />

            <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Master Transactions
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Manage your complete financial records
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Entry
                    </button>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                            <h3 className="text-sm font-medium text-slate-400">Total Income</h3>
                            <p className="text-2xl font-bold text-emerald-400">₹{summary.totalIncome.toLocaleString()}</p>
                        </div>
                        <div className="card p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
                            <h3 className="text-sm font-medium text-slate-400">Total Expense</h3>
                            <p className="text-2xl font-bold text-rose-400">₹{summary.totalExpense.toLocaleString()}</p>
                        </div>
                        <div className="card p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                            <h3 className="text-sm font-medium text-slate-400">Net Balance</h3>
                            <p className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                ₹{summary.netAmount.toLocaleString()}
                            </p>
                        </div>
                        <div className="card p-6 bg-gradient-to-br from-slate-700/30 to-slate-800/30">
                            <h3 className="text-sm font-medium text-slate-400">Transactions</h3>
                            <p className="text-2xl font-bold text-white">{summary.transactionCount}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="glass p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center">
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                    >
                        <option value="">All Types</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                        <option value="Transfer">Transfer</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">From</span>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">To</span>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                        />
                    </div>

                    <button
                        onClick={() => { setFilters({ type: '', startDate: '', endDate: '', search: '' }); setPage(1); }}
                        className="text-sm text-slate-400 hover:text-white underline ml-auto"
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Table */}
                <div className="glass rounded-xl overflow-hidden border border-slate-700/50 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-medium whitespace-nowrap">Date</th>
                                    <th scope="col" className="px-6 py-4 font-medium whitespace-nowrap">ID</th>
                                    <th scope="col" className="px-6 py-4 font-medium whitespace-nowrap">Description</th>
                                    <th scope="col" className="px-6 py-4 font-medium whitespace-nowrap">Type</th>
                                    <th scope="col" className="px-6 py-4 font-medium whitespace-nowrap">Category</th>
                                    <th scope="col" className="px-6 py-4 font-medium whitespace-nowrap text-right">Amount</th>
                                    <th scope="col" className="px-6 py-4 font-medium whitespace-nowrap">Account</th>
                                    <th scope="col" className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
                                    <th scope="col" className="px-6 py-4 font-medium whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                                            No transactions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((txn) => (
                                        <tr key={txn.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{txn.date}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{txn.transactionId}</td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate" title={txn.description}>{txn.description}</div>
                                                {txn.notes && <div className="text-xs text-slate-500 truncate max-w-xs">{txn.notes}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${txn.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        txn.type === 'Expense' ? 'bg-rose-500/10 text-rose-400' :
                                                            'bg-blue-500/10 text-blue-400'
                                                    }`}>
                                                    {txn.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-200">{txn.category || '-'}</div>
                                                <div className="text-xs text-slate-500">{txn.subCategory}</div>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-medium ${txn.type === 'Income' ? 'text-emerald-400' :
                                                    txn.type === 'Expense' ? 'text-rose-400' : 'text-blue-400'
                                                }`}>
                                                ₹{txn.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">{txn.account || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs ${txn.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                                                        txn.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                            'bg-slate-700 text-slate-400'
                                                    }`}>
                                                    {txn.status || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEdit(txn)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(txn.id)} className="p-1 text-slate-400 hover:text-red-400 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/30 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Showing <span className="font-medium text-white">{transactions.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium text-white">{Math.min(page * limit, total)}</span> of <span className="font-medium text-white">{total}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 text-sm bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalPages === 0}
                                className="px-3 py-1 text-sm bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                transaction={editingTransaction}
            />
        </div>
    );
};

export default MasterTransactions;
