import { useState, useEffect } from 'react';

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Healthcare', 'Other'];

const ExpenseModal = ({ isOpen, onClose, onSubmit, expense = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (expense) {
            setFormData({
                title: expense.title,
                amount: expense.amount.toString(),
                category: expense.category,
                date: expense.date,
                notes: expense.notes || '',
            });
        } else {
            setFormData({
                title: '',
                amount: '',
                category: 'Food',
                date: new Date().toISOString().split('T')[0],
                notes: '',
            });
        }
        setErrors({});
    }, [expense, isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.date) newErrors.date = 'Date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                title: formData.title.trim(),
                amount: parseFloat(formData.amount),
                category: formData.category,
                date: formData.date,
                notes: formData.notes.trim(),
            });
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to save expense' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md glass rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {expense ? 'Edit Expense' : 'Add Expense'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {errors.submit && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                            {errors.submit}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={handleChange('title')}
                            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none input-focus ${errors.title ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                                }`}
                            placeholder="e.g., Grocery shopping"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
                    </div>

                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
                            Amount ($)
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={formData.amount}
                            onChange={handleChange('amount')}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none input-focus ${errors.amount ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                                }`}
                            placeholder="0.00"
                        />
                        {errors.amount && <p className="mt-1 text-sm text-red-400">{errors.amount}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                            Category
                        </label>
                        <select
                            id="category"
                            value={formData.category}
                            onChange={handleChange('category')}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 input-focus"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={formData.date}
                            onChange={handleChange('date')}
                            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white focus:outline-none input-focus ${errors.date ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                                }`}
                        />
                        {errors.date && <p className="mt-1 text-sm text-red-400">{errors.date}</p>}
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
                            Notes <span className="text-slate-500">(optional)</span>
                        </label>
                        <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={handleChange('notes')}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 input-focus resize-none"
                            placeholder="Add any additional details..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 btn-primary px-4 py-3 text-white font-medium rounded-xl disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;
