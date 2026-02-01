import Expense from "../models/Expense.js";
import User from "../models/User.js";

export const getExpenseReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, category, startDate, endDate } = req.query;

    // Build filter object
    const filter = { user: userId };

    // Date filtering
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month && month !== "All Months") {
      const year = new Date().getFullYear();
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      filter.date = {
        $gte: new Date(year, monthIndex, 1),
        $lt: new Date(year, monthIndex + 1, 1)
      };
    }

    // Category filtering
    if (category && category !== "All Categories") {
      filter.category = category;
    }

    // Fetch expenses
    const expenses = await Expense.find(filter).sort({ date: -1 });

    // Calculate statistics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Group by category
    const categoryExpenses = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    // Group by month
    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const month = expense.date.toLocaleString('default', { month: 'short' });
      const year = expense.date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!acc[key]) {
        acc[key] = { month: key, expenses: 0, income: 0 };
      }
      acc[key].expenses += expense.amount;
      return acc;
    }, {});

    // Convert to arrays for charts
    const categoryData = Object.entries(categoryExpenses).map(([name, value], index) => ({
      name,
      value,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    }));

    const monthlyData = Object.values(monthlyExpenses);

    res.json({
      expenses,
      statistics: {
        totalExpenses,
        totalTransactions: expenses.length,
        averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
        categoryBreakdown: categoryExpenses
      },
      chartData: {
        categoryData,
        monthlyData
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const exportExpenseReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { format, month, category, startDate, endDate } = req.query;

    // Build filter object (same as getExpenseReport)
    const filter = { user: userId };

    // Date filtering
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month && month !== "All Months") {
      const year = new Date().getFullYear();
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      filter.date = {
        $gte: new Date(year, monthIndex, 1),
        $lt: new Date(year, monthIndex + 1, 1)
      };
    }

    // Category filtering
    if (category && category !== "All Categories") {
      filter.category = category;
    }

    // Fetch expenses directly
    const expenses = await Expense.find(filter).sort({ date: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = ['Date', 'Title', 'Category', 'Amount', 'Description'];
      const csvRows = expenses.map(expense => [
        expense.date.toISOString().split('T')[0],
        expense.title,
        expense.category,
        expense.amount.toString(),
        expense.description || ''
      ]);

      let csvContent = csvHeaders.join(',') + '\n';
      csvRows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=expense-report-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } else if (format === 'json') {
      // Calculate statistics
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const categoryExpenses = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      }, {});

      // Generate JSON report
      const reportData = {
        generatedAt: new Date().toISOString(),
        filters: { month, category, startDate, endDate },
        statistics: {
          totalExpenses,
          totalTransactions: expenses.length,
          averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
          categoryBreakdown: categoryExpenses
        },
        expenses: expenses.map(expense => ({
          date: expense.date.toISOString().split('T')[0],
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          description: expense.description
        }))
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=expense-report-${new Date().toISOString().split('T')[0]}.json`);
      res.json(reportData);
    } else {
      res.status(400).json({ message: "Unsupported export format" });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
