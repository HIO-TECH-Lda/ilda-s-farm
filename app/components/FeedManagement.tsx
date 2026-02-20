'use client';

import { useEffect, useState } from 'react';
import { feedInventory, FeedInventory } from '@/lib/storage';
import { Plus, Minus, AlertTriangle, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface FeedManagementProps {
  userName: string;
}

export default function FeedManagement({ userName }: FeedManagementProps) {
  const [feeds, setFeeds] = useState<FeedInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedType, setSelectedFeedType] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showConsumptionEdit, setShowConsumptionEdit] = useState<Record<string, boolean>>({});
  const [consumptionInput, setConsumptionInput] = useState<Record<string, string>>({});
  const [showConsumptionRecord, setShowConsumptionRecord] = useState<Record<string, boolean>>({});
  const [customConsumption, setCustomConsumption] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFeeds();
  }, []);

  function loadFeeds() {
    try {
      const data = feedInventory.getAll();
      setFeeds(data);
      if (data.length > 0 && !selectedFeedType) {
        setSelectedFeedType(data[0].feed_type);
      }
    } catch (error) {
      console.error('Error loading feeds:', error);
    } finally {
      setLoading(false);
    }
  }

  function getSelectedFeed(): FeedInventory | null {
    if (!selectedFeedType) return null;
    return feeds.find((f) => f.feed_type === selectedFeedType) || null;
  }

  function addStock(feedType: string) {
    const feed = feeds.find((f) => f.feed_type === feedType);
    if (!feed || !inputAmount || Number(inputAmount) <= 0) return;

    const amount = Number(inputAmount);
    try {
      const updated = feedInventory.update(feedType, {
        current_stock_kg: feed.current_stock_kg + amount,
      });

      if (updated) {
        loadFeeds();
        setInputAmount('');
        setShowInput(false);
        toast.success(`✅ ${amount} kg de ração ${feedType} adicionada!`);
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Erro ao adicionar ração');
    }
  }

  function recordConsumption(feedType: string, amount?: number) {
    const feed = feeds.find((f) => f.feed_type === feedType);
    if (!feed) return;

    const consumptionAmount = amount || feed.daily_consumption_kg;
    
    if (consumptionAmount <= 0) {
      toast.error('⚠️ Quantidade inválida!');
      return;
    }

    if (feed.current_stock_kg < consumptionAmount) {
      toast.error('⚠️ Stock insuficiente!');
      return;
    }

    try {
      const updated = feedInventory.update(feedType, {
        current_stock_kg: feed.current_stock_kg - consumptionAmount,
      });

      if (updated) {
        loadFeeds();
        setShowConsumptionRecord({ ...showConsumptionRecord, [feedType]: false });
        setCustomConsumption({ ...customConsumption, [feedType]: '' });
        toast.success(`✅ Consumo registrado: ${consumptionAmount} kg de ${feedType}`);
      }
    } catch (error) {
      console.error('Error recording consumption:', error);
      toast.error('Erro ao registrar consumo');
    }
  }

  function updateDailyConsumption(feedType: string) {
    const feed = feeds.find((f) => f.feed_type === feedType);
    if (!feed) return;

    const inputValue = consumptionInput[feedType];
    const newConsumption = inputValue ? Number(inputValue) : feed.daily_consumption_kg;
    
    if (newConsumption > 0) {
      const updated = feedInventory.update(feedType, {
        daily_consumption_kg: newConsumption,
      });
      if (updated) {
        loadFeeds();
        setShowConsumptionEdit({ ...showConsumptionEdit, [feedType]: false });
        setConsumptionInput({ ...consumptionInput, [feedType]: '' });
        toast.success(`✅ Consumo diário atualizado para ${newConsumption} kg!`);
      }
    } else {
      toast.error('⚠️ O consumo deve ser maior que zero!');
    }
  }

  const getAnimalIcon = (type: string) => {
    const icons: Record<string, string> = {
      Codornezes: '🦆',
      Galinhas: '🐔',
      Porcos: '🐷',
      Patos: '🦆',
    };
    return icons[type] || '🌾';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (feeds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nenhum inventário de ração encontrado</p>
      </div>
    );
  }

  const selectedFeed = getSelectedFeed();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-amber-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Gestão de Ração
        </h2>
        <p className="text-gray-600">
          Sistema de controle visual de stock de alimentação por tipo de animal
        </p>
      </div>

      {/* Feed Type Selector */}
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Selecione o Tipo de Ração:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {feeds.map((feed) => (
            <button
              key={feed.id}
              onClick={() => {
                setSelectedFeedType(feed.feed_type);
                setShowInput(false);
                setShowConsumptionRecord({});
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFeedType === feed.feed_type
                  ? 'bg-green-600 text-white border-green-700 shadow-md'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="text-3xl mb-2">{getAnimalIcon(feed.feed_type)}</div>
              <div className="font-bold text-sm">{feed.feed_type}</div>
              <div className={`text-xs mt-1 ${
                selectedFeedType === feed.feed_type ? 'text-green-100' : 'text-gray-500'
              }`}>
                {feed.current_stock_kg} kg
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Feed Details */}
      {selectedFeed && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getAnimalIcon(selectedFeed.feed_type)}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Ração para {selectedFeed.feed_type}
                  </h3>
                  <p className="text-sm text-gray-600">Stock e consumo diário</p>
                </div>
              </div>
              {(() => {
                const daysRemaining = Math.floor(
                  selectedFeed.current_stock_kg / selectedFeed.daily_consumption_kg
                );
                const stockPercentage = Math.min(
                  (selectedFeed.current_stock_kg / (selectedFeed.daily_consumption_kg * 30)) * 100,
                  100
                );
                const isLowStock = stockPercentage < 30;
                const isCriticalStock = stockPercentage < 15;

                if (isLowStock) {
                  return (
                    <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-red-700 font-semibold text-sm">
                        {isCriticalStock ? 'CRÍTICO' : 'BAIXO'}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Fuel Tank Visual */}
            {(() => {
              const daysRemaining = Math.floor(
                selectedFeed.current_stock_kg / selectedFeed.daily_consumption_kg
              );
              const stockPercentage = Math.min(
                (selectedFeed.current_stock_kg / (selectedFeed.daily_consumption_kg * 30)) * 100,
                100
              );
              const isLowStock = stockPercentage < 30;
              const isCriticalStock = stockPercentage < 15;

              return (
                <div className="relative bg-gray-100 rounded-xl h-64 overflow-hidden border-4 border-gray-300">
                  <div
                    className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${
                      isCriticalStock
                        ? 'bg-gradient-to-t from-red-600 to-red-400'
                        : isLowStock
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                        : 'bg-gradient-to-t from-green-600 to-green-400'
                    }`}
                    style={{ height: `${stockPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  </div>

                  {/* Level Markers */}
                  <div className="absolute inset-0 flex flex-col justify-between py-4 px-4 pointer-events-none">
                    {[100, 75, 50, 25, 0].map((level) => (
                      <div key={level} className="flex items-center">
                        <div className="h-px w-full bg-gray-400/50"></div>
                        <span className="ml-2 text-xs font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">
                          {level}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Current Level Display */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-white/95 backdrop-blur px-6 py-4 rounded-xl shadow-lg">
                    <p className="text-5xl font-bold text-gray-800">
                      {selectedFeed.current_stock_kg}
                      <span className="text-2xl text-gray-600 ml-2">kg</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Stock Atual</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                  <p className="text-blue-600 text-sm font-semibold">
                    Consumo Diário
                  </p>
                </div>
                {!showConsumptionEdit[selectedFeed.feed_type] && (
                  <button
                    onClick={() => {
                      setShowConsumptionEdit({
                        ...showConsumptionEdit,
                        [selectedFeed.feed_type]: true,
                      });
                      setConsumptionInput({
                        ...consumptionInput,
                        [selectedFeed.feed_type]: String(selectedFeed.daily_consumption_kg),
                      });
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Editar
                  </button>
                )}
              </div>
              {showConsumptionEdit[selectedFeed.feed_type] ? (
                <div className="space-y-3">
                  {/* Quick Adjustment Buttons */}
                  <div>
                    <p className="text-xs text-gray-600 mb-2 font-medium">Ajuste Rápido:</p>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => {
                          const current = Number(consumptionInput[selectedFeed.feed_type] || selectedFeed.daily_consumption_kg);
                          const newValue = Math.max(0.1, current - 5);
                          setConsumptionInput({
                            ...consumptionInput,
                            [selectedFeed.feed_type]: String(newValue),
                          });
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-2 rounded-lg transition-all text-sm border-2 border-red-300"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => {
                          const current = Number(consumptionInput[selectedFeed.feed_type] || selectedFeed.daily_consumption_kg);
                          const newValue = Math.max(0.1, current - 1);
                          setConsumptionInput({
                            ...consumptionInput,
                            [selectedFeed.feed_type]: String(newValue),
                          });
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-2 rounded-lg transition-all text-sm border-2 border-red-300"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => {
                          const current = Number(consumptionInput[selectedFeed.feed_type] || selectedFeed.daily_consumption_kg);
                          const newValue = current + 1;
                          setConsumptionInput({
                            ...consumptionInput,
                            [selectedFeed.feed_type]: String(newValue),
                          });
                        }}
                        className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2 px-2 rounded-lg transition-all text-sm border-2 border-green-300"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => {
                          const current = Number(consumptionInput[selectedFeed.feed_type] || selectedFeed.daily_consumption_kg);
                          const newValue = current + 5;
                          setConsumptionInput({
                            ...consumptionInput,
                            [selectedFeed.feed_type]: String(newValue),
                          });
                        }}
                        className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2 px-2 rounded-lg transition-all text-sm border-2 border-green-300"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Custom Value Input */}
                  <div>
                    <p className="text-xs text-gray-600 mb-2 font-medium">Ou defina um valor:</p>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={consumptionInput[selectedFeed.feed_type] || ''}
                      onChange={(e) =>
                        setConsumptionInput({
                          ...consumptionInput,
                          [selectedFeed.feed_type]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="kg/dia"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateDailyConsumption(selectedFeed.feed_type)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition-all text-sm"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setShowConsumptionEdit({
                          ...showConsumptionEdit,
                          [selectedFeed.feed_type]: false,
                        });
                        setConsumptionInput({
                          ...consumptionInput,
                          [selectedFeed.feed_type]: '',
                        });
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-3 rounded-lg transition-all text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-3xl font-bold text-gray-800">
                    {selectedFeed.daily_consumption_kg}
                    <span className="text-lg text-gray-600 ml-1">kg</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">por dia</p>
                </div>
              )}
            </div>

            <div
              className={`rounded-lg p-4 border-2 ${
                (() => {
                  const stockPercentage = Math.min(
                    (selectedFeed.current_stock_kg / (selectedFeed.daily_consumption_kg * 30)) * 100,
                    100
                  );
                  const isCriticalStock = stockPercentage < 15;
                  const isLowStock = stockPercentage < 30;
                  return isCriticalStock
                    ? 'bg-red-50 border-red-200'
                    : isLowStock
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-green-50 border-green-200';
                })()
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle
                  className={`w-5 h-5 ${
                    (() => {
                      const stockPercentage = Math.min(
                        (selectedFeed.current_stock_kg / (selectedFeed.daily_consumption_kg * 30)) * 100,
                        100
                      );
                      const isCriticalStock = stockPercentage < 15;
                      const isLowStock = stockPercentage < 30;
                      return isCriticalStock
                        ? 'text-red-600'
                        : isLowStock
                        ? 'text-amber-600'
                        : 'text-green-600';
                    })()
                  }`}
                />
                <p
                  className={`text-sm font-semibold ${
                    (() => {
                      const stockPercentage = Math.min(
                        (selectedFeed.current_stock_kg / (selectedFeed.daily_consumption_kg * 30)) * 100,
                        100
                      );
                      const isCriticalStock = stockPercentage < 15;
                      const isLowStock = stockPercentage < 30;
                      return isCriticalStock
                        ? 'text-red-600'
                        : isLowStock
                        ? 'text-amber-600'
                        : 'text-green-600';
                    })()
                  }`}
                >
                  Dias Restantes
                </p>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {Math.floor(selectedFeed.current_stock_kg / selectedFeed.daily_consumption_kg)}
                <span className="text-lg text-gray-600 ml-1">dias</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 text-lg"
              >
                <Plus className="w-6 h-6" />
                Entrada de Stock
              </button>
            ) : (
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantidade (kg):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                    placeholder="Ex: 100"
                    autoFocus
                  />
                  <button
                    onClick={() => addStock(selectedFeed.feed_type)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 rounded-lg transition-all"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => {
                      setShowInput(false);
                      setInputAmount('');
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold px-6 rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {!showConsumptionRecord[selectedFeed.feed_type] ? (
              <div className="space-y-2">
                <button
                  onClick={() => recordConsumption(selectedFeed.feed_type)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Minus className="w-6 h-6" />
                  Registrar Consumo Padrão ({selectedFeed.daily_consumption_kg} kg)
                </button>
                <button
                  onClick={() =>
                    setShowConsumptionRecord({
                      ...showConsumptionRecord,
                      [selectedFeed.feed_type]: true,
                    })
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-3"
                >
                  <Minus className="w-5 h-5" />
                  Registrar Consumo Personalizado
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-300">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantidade Consumida (kg):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customConsumption[selectedFeed.feed_type] || ''}
                    onChange={(e) =>
                      setCustomConsumption({
                        ...customConsumption,
                        [selectedFeed.feed_type]: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder={`Padrão: ${selectedFeed.daily_consumption_kg} kg`}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      const amount = customConsumption[selectedFeed.feed_type];
                      if (amount && Number(amount) > 0) {
                        recordConsumption(selectedFeed.feed_type, Number(amount));
                      } else {
                        recordConsumption(selectedFeed.feed_type);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-lg transition-all"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => {
                      setShowConsumptionRecord({
                        ...showConsumptionRecord,
                        [selectedFeed.feed_type]: false,
                      });
                      setCustomConsumption({
                        ...customConsumption,
                        [selectedFeed.feed_type]: '',
                      });
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold px-6 rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Deixe em branco para usar o consumo padrão ({selectedFeed.daily_consumption_kg} kg)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
