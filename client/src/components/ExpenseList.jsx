const categoryIcons = {
    Food: '🍔',
    Travel: '✈️',
    Bills: '📄',
    Shopping: '🛍️',
    Entertainment: '🎬',
    Healthcare: '💊',
    Other: '📦',
};

const ExpenseList = ({ expenses, loading, onEdit, onDelete }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="glass rounded-2xl p-6 animate-pulse">
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-slate-700/50 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!expenses || expenses.length === 0) {
        return (
            <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Expenses Yet</h3>
                <p className="text-slate-400">Start tracking your expenses by adding your first one!</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold text-white">
                    Recent Expenses
                    <span className="ml-2 text-sm font-normal text-slate-400">({expenses.length} items)</span>
                </h3>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-800/50">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Title</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Category</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                            <th className="text-right px-6 py-3 text-sm font-medium text-slate-400">Amount</th>
                            <th className="text-right px-6 py-3 text-sm font-medium text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-white font-medium">{expense.title}</p>
                                        {expense.notes && (
                                            <p className="text-slate-500 text-sm truncate max-w-xs">{expense.notes}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">
                                        <span>{categoryIcons[expense.category] || '📦'}</span>
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{formatDate(expense.date)}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-red-400 font-semibold">{formatCurrency(expense.amount)}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(expense)}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(expense.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-700/50">
                {expenses.map((expense) => (
                    <div key={expense.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{categoryIcons[expense.category] || '📦'}</span>
                                <div>
                                    <p className="text-white font-medium">{expense.title}</p>
                                    <p className="text-slate-500 text-sm">{expense.category}</p>
                                </div>
                            </div>
                            <span className="text-red-400 font-semibold">{formatCurrency(expense.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-sm">{formatDate(expense.date)}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onEdit(expense)}
                                    className="p-2 text-slate-400 hover:text-white"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDelete(expense.id)}
                                    className="p-2 text-slate-400 hover:text-red-400"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpenseList;
