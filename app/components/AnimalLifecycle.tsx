'use client';

import { useEffect, useState } from 'react';
import { animalPens, animalTransactions, AnimalPen } from '@/lib/storage';
import { Plus, Minus, X, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface AnimalLifecycleProps {
  userName: string;
}

export default function AnimalLifecycle({ userName }: AnimalLifecycleProps) {
  const [pens, setPens] = useState<AnimalPen[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPen, setSelectedPen] = useState<string | null>(null);
  const [quickAmount, setQuickAmount] = useState('');

  useEffect(() => {
    loadPens();
  }, []);

  function loadPens() {
    try {
      const data = animalPens.getAll().sort((a, b) => a.type.localeCompare(b.type));
      setPens(data);
    } catch (error) {
      console.error('Error loading pens:', error);
    } finally {
      setLoading(false);
    }
  }

  function addAnimals(penId: string, quantity: number, type: string) {
    const pen = pens.find((p) => p.id === penId);
    if (!pen) return;

    try {
      const newCount = pen.current_count + quantity;

      const updated = animalPens.update(penId, {
        current_count: newCount,
      });

      if (!updated) {
        throw new Error('Failed to update pen');
      }

      animalTransactions.create({
        pen_id: penId,
        transaction_type: type,
        quantity: quantity,
        created_by: userName,
        notes: `${type === 'birth' ? 'Nascimento' : 'Compra'} registrado`,
      });

      setPens(
        pens.map((p) =>
          p.id === penId ? { ...p, current_count: newCount } : p
        )
      );

      setSelectedPen(null);
      setQuickAmount('');
      toast.success(
        `✅ +${quantity} ${pen.type} ${
          type === 'birth' ? 'nascidos' : 'adicionados'
        }!`
      );
    } catch (error) {
      console.error('Error adding animals:', error);
      toast.error('Erro ao adicionar animais');
    }
  }

  function removeAnimals(penId: string, quantity: number, type: string) {
    const pen = pens.find((p) => p.id === penId);
    if (!pen) return;

    if (pen.current_count < quantity) {
      toast.error('⚠️ Quantidade superior ao efetivo atual!');
      return;
    }

    try {
      const newCount = pen.current_count - quantity;

      const updated = animalPens.update(penId, {
        current_count: newCount,
      });

      if (!updated) {
        throw new Error('Failed to update pen');
      }

      animalTransactions.create({
        pen_id: penId,
        transaction_type: type,
        quantity: quantity,
        created_by: userName,
        notes: `${type === 'death' ? 'Óbito' : 'Venda'} registrado`,
      });

      setPens(
        pens.map((p) =>
          p.id === penId ? { ...p, current_count: newCount } : p
        )
      );

      setSelectedPen(null);
      setQuickAmount('');
      toast.success(
        `✅ -${quantity} ${pen.type} ${
          type === 'death' ? 'registrados' : 'vendidos'
        }`
      );
    } catch (error) {
      console.error('Error removing animals:', error);
      toast.error('Erro ao remover animais');
    }
  }

  const getAnimalIcon = (type: string) => {
    const icons: Record<string, string> = {
      Codornezes: '🦆',
      Galinhas: '🐔',
      Porcos: '🐷',
      Patos: '🦆',
      Perus: '🦃',
      Cabras: '🐐',
      Ovelhas: '🐑',
      Vacas: '🐄',
      Coelhos: '🐰',
    };
    return icons[type] || '🐾';
  };

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
          Ciclo de Vida Animal
        </h2>
        <p className="text-gray-600">
          Registro rápido de nascimentos, compras, vendas e óbitos
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-4">
        {pens.map((pen) => (
          <div
            key={pen.id}
            className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden"
          >
            {/* Pen Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getAnimalIcon(pen.type)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {pen.type}
                    </h3>
                    <p className="text-sm text-gray-600">{pen.name}</p>
                  </div>
                </div>
                <div className="text-center bg-white rounded-lg px-4 py-2 shadow-sm border-2 border-green-300">
                  <p className="text-sm text-gray-600 font-medium">Efetivo</p>
                  <p className="text-3xl font-bold text-green-700">
                    {pen.current_count}
                  </p>
                </div>
              </div>
            </div>

              {/* Quick Add Buttons */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => addAnimals(pen.id, 10, 'birth')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all flex flex-col items-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">+10 Nascimentos</span>
                </button>
                <button
                  onClick={() => addAnimals(pen.id, 30, 'birth')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all flex flex-col items-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">+30 Nascimentos</span>
                </button>
              </div>

              {/* Custom Entry Form */}
              {selectedPen === pen.id ? (
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Quantidade:
                    </label>
                    <button
                      onClick={() => {
                        setSelectedPen(null);
                        setQuickAmount('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="number"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
                    placeholder="Digite a quantidade"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      onClick={() => {
                        if (quickAmount && Number(quickAmount) > 0) {
                          addAnimals(pen.id, Number(quickAmount), 'birth');
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Nascimento
                    </button>
                    <button
                      onClick={() => {
                        if (quickAmount && Number(quickAmount) > 0) {
                          removeAnimals(pen.id, Number(quickAmount), 'death');
                        }
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                    >
                      <TrendingDown className="w-4 h-4" />
                      Óbito
                    </button>
                    <button
                      onClick={() => {
                        if (quickAmount && Number(quickAmount) > 0) {
                          addAnimals(pen.id, Number(quickAmount), 'purchase');
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Compra
                    </button>
                    <button
                      onClick={() => {
                        if (quickAmount && Number(quickAmount) > 0) {
                          removeAnimals(pen.id, Number(quickAmount), 'sale');
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
                    >
                      <TrendingDown className="w-4 h-4" />
                      Venda
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedPen(pen.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mb-3"
                >
                  <Plus className="w-5 h-5" />
                  Entrada Personalizada (Nascimento/Óbito/Compra/Venda)
                </button>
              )}

              {/* Quick Remove Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() => removeAnimals(pen.id, 1, 'death')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Minus className="w-5 h-5" />
                  <span className="text-sm">-1 Óbito</span>
                </button>
                <button
                  onClick={() => removeAnimals(pen.id, 10, 'sale')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Minus className="w-5 h-5" />
                  <span className="text-sm">-10 Venda</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
