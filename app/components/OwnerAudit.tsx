'use client';

import { useEffect, useState } from 'react';
import {
  animalTransactions,
  eggProduction,
  vegetableProduction,
  animalPens,
} from '@/lib/storage';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  Search,
} from 'lucide-react';

interface OwnerAuditProps {
  userName: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  quantity: number;
  created_at: string;
  created_by: string;
  pen_id: string;
  pen_type?: string;
  pen_name?: string;
}

interface EggRecord {
  id: string;
  quantity: number;
  date: string;
  created_at: string;
  created_by: string;
  pen_id: string;
  pen_type?: string;
}

interface VegetableRecord {
  id: string;
  vegetable_type: string;
  weight_kg: number;
  base_price: number;
  date: string;
  created_at: string;
  created_by: string;
}

export default function OwnerAudit({ userName }: OwnerAuditProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [eggRecords, setEggRecords] = useState<EggRecord[]>([]);
  const [vegetableRecords, setVegetableRecords] = useState<VegetableRecord[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'animals' | 'eggs' | 'vegetables'>(
    'animals'
  );
  const [transactionFilter, setTransactionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    loadAuditData();
  }, []);

  function loadAuditData() {
    try {
      const pens = animalPens.getAll();
      const pensMap = new Map(pens.map((p) => [p.id, p]));

      const transactionsData = animalTransactions.getAll(50);
      const formattedTransactions = transactionsData.map((t) => {
        const pen = pensMap.get(t.pen_id);
        return {
          ...t,
          pen_type: pen?.type,
          pen_name: pen?.name,
        };
      });

      const eggsData = eggProduction.getAll(50);
      const formattedEggs = eggsData.map((e) => {
        const pen = pensMap.get(e.pen_id);
        return {
          ...e,
          pen_type: pen?.type,
        };
      });

      const veggiesData = vegetableProduction.getAll(50);

      setTransactions(formattedTransactions);
      setEggRecords(formattedEggs);
      setVegetableRecords(veggiesData);
    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'birth':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'purchase':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'sale':
        return <TrendingDown className="w-5 h-5 text-amber-600" />;
      case 'death':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      birth: 'Nascimento',
      purchase: 'Compra',
      sale: 'Venda',
      death: 'Óbito',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterByDateRange = (dateString: string): boolean => {
    if (!dateRange.start && !dateRange.end) return true;
    const recordDate = new Date(dateString).toISOString().split('T')[0];
    if (dateRange.start && recordDate < dateRange.start) return false;
    if (dateRange.end && recordDate > dateRange.end) return false;
    return true;
  };

  const filterBySearch = (item: any): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.pen_type?.toLowerCase().includes(query) ||
      item.pen_name?.toLowerCase().includes(query) ||
      item.transaction_type?.toLowerCase().includes(query) ||
      item.vegetable_type?.toLowerCase().includes(query) ||
      item.created_by?.toLowerCase().includes(query)
    );
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      filterByDateRange(t.created_at) &&
      filterBySearch(t) &&
      (transactionFilter === 'all' || t.transaction_type === transactionFilter)
  );

  const filteredEggRecords = eggRecords.filter(
    (e) => filterByDateRange(e.created_at) && filterBySearch(e)
  );

  const filteredVegetableRecords = vegetableRecords.filter(
    (v) => filterByDateRange(v.created_at) && filterBySearch(v)
  );

  const totalEggs = filteredEggRecords.reduce(
    (sum, record) => sum + record.quantity,
    0
  );
  const totalVegetablesValue = filteredVegetableRecords.reduce(
    (sum, record) => sum + record.weight_kg * record.base_price,
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
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-emerald-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Vista do Proprietário - Fecho de Contas
        </h2>
        <p className="text-gray-600">
          Auditoria completa de todas as transações e produção
        </p>
      </div>

      {/* Search and Date Range */}
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por tipo, nome..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
          </div>
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
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
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
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6" />
            <p className="text-sm font-semibold">Transações Animais</p>
          </div>
          <p className="text-4xl font-bold">{filteredTransactions.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6" />
            <p className="text-sm font-semibold">Total Ovos</p>
          </div>
          <p className="text-4xl font-bold">{totalEggs}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6" />
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
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
        <div className="flex border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('animals')}
            className={`flex-1 py-4 px-6 font-semibold transition-all ${
              activeTab === 'animals'
                ? 'bg-green-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Animais
          </button>
          <button
            onClick={() => setActiveTab('eggs')}
            className={`flex-1 py-4 px-6 font-semibold transition-all ${
              activeTab === 'eggs'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ovos
          </button>
          <button
            onClick={() => setActiveTab('vegetables')}
            className={`flex-1 py-4 px-6 font-semibold transition-all ${
              activeTab === 'vegetables'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Hortícolas
          </button>
        </div>

        <div className="p-4 max-h-[600px] overflow-y-auto">
          {/* Animal Transactions */}
          {activeTab === 'animals' && (
            <div className="space-y-3">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setTransactionFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    transactionFilter === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setTransactionFilter('birth')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    transactionFilter === 'birth'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nascimentos
                </button>
                <button
                  onClick={() => setTransactionFilter('purchase')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    transactionFilter === 'purchase'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Compras
                </button>
                <button
                  onClick={() => setTransactionFilter('sale')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    transactionFilter === 'sale'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Vendas
                </button>
                <button
                  onClick={() => setTransactionFilter('death')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    transactionFilter === 'death'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Óbitos
                </button>
              </div>

              {filteredTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma transação encontrada
                </p>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-green-400 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800">
                              {getTransactionLabel(transaction.transaction_type)}
                            </h4>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                              {transaction.pen_type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {transaction.pen_name}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(transaction.created_at)}
                            </span>
                            <span>Por: {transaction.created_by}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${
                            ['birth', 'purchase'].includes(
                              transaction.transaction_type
                            )
                              ? 'text-green-700'
                              : 'text-red-700'
                          }`}
                        >
                          {['birth', 'purchase'].includes(
                            transaction.transaction_type
                          )
                            ? '+'
                            : '-'}
                          {transaction.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Egg Records */}
          {activeTab === 'eggs' && (
            <div className="space-y-3">
              {filteredEggRecords.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma recolha encontrada
                </p>
              ) : (
                filteredEggRecords.map((record) => (
                  <div
                    key={record.id}
                    className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-800">
                            Recolha de Ovos
                          </h4>
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                            {record.pen_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.created_at)}
                          </span>
                          <span>Por: {record.created_by}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-amber-700">
                          {record.quantity}
                        </p>
                        <p className="text-xs text-gray-600">ovos</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Vegetable Records */}
          {activeTab === 'vegetables' && (
            <div className="space-y-3">
              {filteredVegetableRecords.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma colheita encontrada
                </p>
              ) : (
                filteredVegetableRecords.map((record) => (
                  <div
                    key={record.id}
                    className="bg-green-50 rounded-lg p-4 border-2 border-green-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">
                          {record.vegetable_type}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {record.weight_kg} kg × {record.base_price} MT/kg
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.created_at)}
                          </span>
                          <span>Por: {record.created_by}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-700">
                          {(
                            record.weight_kg * record.base_price
                          ).toLocaleString('pt-MZ', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        <p className="text-xs text-gray-600">MT</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
