'use client';

import { useEffect, useState } from 'react';
import {
  animalTransactions,
  eggProduction,
  vegetableProduction,
  animalPens,
} from '@/lib/storage';
import { BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StatisticsProps {
  userName: string;
}

export default function Statistics({ userName }: StatisticsProps) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [stats, setStats] = useState({
    animalTransactions: [] as any[],
    eggProduction: [] as any[],
    vegetableProduction: [] as any[],
    sales: [] as any[],
  });

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  function loadStatistics() {
    try {
      const pens = animalPens.getAll();
      const pensMap = new Map(pens.map((p) => [p.id, p]));

      // Get all transactions
      const allTransactions = animalTransactions.getAll();
      const allEggs = eggProduction.getAll();
      const allVegetables = vegetableProduction.getAll();

      // Filter by date range
      const filteredTransactions = allTransactions.filter((t) => {
        const date = new Date(t.created_at).toISOString().split('T')[0];
        return date >= dateRange.start && date <= dateRange.end;
      });

      const filteredEggs = allEggs.filter((e) => {
        const date = e.date;
        return date >= dateRange.start && date <= dateRange.end;
      });

      const filteredVegetables = allVegetables.filter((v) => {
        const date = v.date;
        return date >= dateRange.start && date <= dateRange.end;
      });

      // Group transactions by date
      const transactionsByDate: Record<string, any> = {};
      filteredTransactions.forEach((t) => {
        const date = new Date(t.created_at).toISOString().split('T')[0];
        if (!transactionsByDate[date]) {
          transactionsByDate[date] = {
            date,
            births: 0,
            purchases: 0,
            sales: 0,
            deaths: 0,
          };
        }
        if (t.transaction_type === 'birth') transactionsByDate[date].births += t.quantity;
        if (t.transaction_type === 'purchase')
          transactionsByDate[date].purchases += t.quantity;
        if (t.transaction_type === 'sale') transactionsByDate[date].sales += t.quantity;
        if (t.transaction_type === 'death') transactionsByDate[date].deaths += t.quantity;
      });

      // Group eggs by date
      const eggsByDate: Record<string, number> = {};
      filteredEggs.forEach((e) => {
        eggsByDate[e.date] = (eggsByDate[e.date] || 0) + e.quantity;
      });

      // Group vegetables by date
      const vegetablesByDate: Record<string, number> = {};
      filteredVegetables.forEach((v) => {
        vegetablesByDate[v.date] =
          (vegetablesByDate[v.date] || 0) + v.weight_kg * v.base_price;
      });

      // Calculate sales revenue
      const salesTransactions = filteredTransactions.filter(
        (t) => t.transaction_type === 'sale'
      );
      const salesByDate: Record<string, number> = {};
      salesTransactions.forEach((t) => {
        const date = new Date(t.created_at).toISOString().split('T')[0];
        const pen = pensMap.get(t.pen_id);
        if (pen) {
          salesByDate[date] =
            (salesByDate[date] || 0) + t.quantity * pen.base_price;
        }
      });

      // Convert to arrays for charts
      const transactionChartData = Object.values(transactionsByDate).sort(
        (a, b) => a.date.localeCompare(b.date)
      );
      const eggChartData = Object.entries(eggsByDate)
        .map(([date, quantity]) => ({ date, quantity }))
        .sort((a, b) => a.date.localeCompare(b.date));
      const vegetableChartData = Object.entries(vegetablesByDate)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));
      const salesChartData = Object.entries(salesByDate)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats({
        animalTransactions: transactionChartData,
        eggProduction: eggChartData,
        vegetableProduction: vegetableChartData,
        sales: salesChartData,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate summary statistics
  const totalBirths = stats.animalTransactions.reduce(
    (sum, d) => sum + d.births,
    0
  );
  const totalPurchases = stats.animalTransactions.reduce(
    (sum, d) => sum + d.purchases,
    0
  );
  const totalSales = stats.animalTransactions.reduce(
    (sum, d) => sum + d.sales,
    0
  );
  const totalDeaths = stats.animalTransactions.reduce(
    (sum, d) => sum + d.deaths,
    0
  );
  const totalEggs = stats.eggProduction.reduce(
    (sum, d) => sum + d.quantity,
    0
  );
  const totalVegetablesValue = stats.vegetableProduction.reduce(
    (sum, d) => sum + (d.value || 0),
    0
  );
  const totalSalesRevenue = stats.sales.reduce(
    (sum, d) => sum + d.revenue,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Estatísticas e Análises
        </h2>
        <p className="text-gray-600">
          Visualização de tendências e estatísticas de produção
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data Inicial:
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data Final:
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6" />
            <p className="text-sm font-semibold">Nascimentos</p>
          </div>
          <p className="text-4xl font-bold">{totalBirths}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6" />
            <p className="text-sm font-semibold">Compras</p>
          </div>
          <p className="text-4xl font-bold">{totalPurchases}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-6 h-6" />
            <p className="text-sm font-semibold">Vendas</p>
          </div>
          <p className="text-4xl font-bold">{totalSales}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-6 h-6" />
            <p className="text-sm font-semibold">Óbitos</p>
          </div>
          <p className="text-4xl font-bold">{totalDeaths}</p>
        </div>
      </div>

      {/* Production Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6" />
            <p className="text-sm font-semibold">Total Ovos</p>
          </div>
          <p className="text-4xl font-bold">{totalEggs}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6" />
            <p className="text-sm font-semibold">Hortícolas</p>
          </div>
          <p className="text-3xl font-bold">
            {totalVegetablesValue.toLocaleString('pt-MZ', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            <span className="text-lg ml-1">MT</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6" />
            <p className="text-sm font-semibold">Receita Vendas</p>
          </div>
          <p className="text-3xl font-bold">
            {totalSalesRevenue.toLocaleString('pt-MZ', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            <span className="text-lg ml-1">MT</span>
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Animal Transactions Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Transações Animais
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.animalTransactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('pt-MZ', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="births" fill="#10b981" name="Nascimentos" />
              <Bar dataKey="purchases" fill="#3b82f6" name="Compras" />
              <Bar dataKey="sales" fill="#f59e0b" name="Vendas" />
              <Bar dataKey="deaths" fill="#ef4444" name="Óbitos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Egg Production Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Produção de Ovos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.eggProduction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('pt-MZ', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="quantity"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Ovos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vegetable Production Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Produção Hortícolas (Valor)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.vegetableProduction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('pt-MZ', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                name="Valor (MT)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Receita de Vendas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.sales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('pt-MZ', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8b5cf6" name="Receita (MT)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
