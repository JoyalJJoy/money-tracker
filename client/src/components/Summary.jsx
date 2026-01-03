const Summary = ({ summary, loading }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const categoryColors = {
        Food: 'from-orange-500 to-red-500',
        Travel: 'from-blue-500 to-cyan-500',
        Bills: 'from-yellow-500 to-amber-500',
        Shopping: 'from-pink-500 to-rose-500',
        Entertainment: 'from-purple-500 to-violet-500',
        Healthcare: 'from-green-500 to-emerald-500',
        Other: 'from-slate-500 to-gray-500',
    };

    const categoryIcons = {
        Food: '🍔',
        Travel: '✈️',
        Bills: '📄',
        Shopping: '🛍️',
        Entertainment: '🎬',
        Healthcare: '💊',
        Other: '📦',
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass rounded-2xl p-6 h-32 bg-slate-700/50" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Expenses */}
                <div className="glass rounded-2xl p-6 card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Expenses</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(summary?.total)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Monthly Total */}
                <div className="glass rounded-2xl p-6 card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">This Month</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(summary?.monthlyTotal)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Today's Total */}
                <div className="glass rounded-2xl p-6 card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Today</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(summary?.dailyTotal)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {summary?.byCategory && summary.byCategory.length > 0 && (
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Expenses by Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {summary.byCategory.map((cat) => (
                            <div
                                key={cat.category}
                                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{categoryIcons[cat.category] || '📦'}</span>
                                    <span className="text-slate-300 text-sm">{cat.category}</span>
                                </div>
                                <p className="text-white font-semibold">{formatCurrency(cat.total)}</p>
                                <p className="text-slate-500 text-xs">{cat.count} expense{cat.count !== 1 ? 's' : ''}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Summary;
