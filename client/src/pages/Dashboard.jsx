import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Summary from '../components/Summary';
import Filters from '../components/Filters';
import ExpenseList from '../components/ExpenseList';
import ExpenseModal from '../components/ExpenseModal';
import { expensesAPI } from '../services/api';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [currentFilters, setCurrentFilters] = useState({});

    const fetchSummary = useCallback(async () => {
        try {
            const response = await expensesAPI.getSummary();
            setSummary(response.data);
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        }
    }, []);

    const fetchExpenses = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            const response = await expensesAPI.getAll(filters);
            setExpenses(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load expenses');
            console.error('Failed to fetch expenses:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
        fetchSummary();
    }, [fetchExpenses, fetchSummary]);

    const handleFilterChange = (filters) => {
        setCurrentFilters(filters);
        fetchExpenses(filters);
    };

    const handleAddExpense = async (data) => {
        await expensesAPI.create(data);
        await fetchExpenses(currentFilters);
        await fetchSummary();
    };

    const handleUpdateExpense = async (data) => {
        if (!editingExpense) return;
        await expensesAPI.update(editingExpense.id, data);
        await fetchExpenses(currentFilters);
        await fetchSummary();
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            await expensesAPI.delete(id);
            await fetchExpenses(currentFilters);
            await fetchSummary();
        } catch (err) {
            console.error('Failed to delete expense:', err);
            alert('Failed to delete expense');
        }
    };

    const openAddModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleModalSubmit = async (data) => {
        if (editingExpense) {
            await handleUpdateExpense(data);
        } else {
            await handleAddExpense(data);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 animate-fade-in">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Summary Section */}
                    <Summary summary={summary} loading={loading && !summary} />

                    {/* Filters Section */}
                    <Filters onFilterChange={handleFilterChange} onAddClick={openAddModal} />

                    {/* Expenses List */}
                    <ExpenseList
                        expenses={expenses}
                        loading={loading}
                        onEdit={openEditModal}
                        onDelete={handleDeleteExpense}
                    />
                </div>
            </main>

            {/* Add/Edit Modal */}
            <ExpenseModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
                expense={editingExpense}
            />
        </div>
    );
};

export default Dashboard;
