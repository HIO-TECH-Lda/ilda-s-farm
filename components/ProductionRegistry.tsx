'use client';

import { useEffect, useState } from 'react';
import { animalPens, eggProduction, vegetableProduction, AnimalPen } from '@/lib/storage';
import { Egg, Apple, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface ProductionRegistryProps {
  userName: string;
}

export default function ProductionRegistry({
  userName,
}: ProductionRegistryProps) {
  const [pens, setPens] = useState<AnimalPen[]>([]);
  const [loading, setLoading] = useState(true);
  const [eggCount, setEggCount] = useState<Record<string, string>>({});
  const [vegetableWeight, setVegetableWeight] = useState('');
  const [vegetablePrice, setVegetablePrice] = useState('');
  const [selectedVegetable, setSelectedVegetable] = useState('Tomates');
  const [todayProduction, setTodayProduction] = useState<{
    eggs: number;
    vegetables: number;
  }>({ eggs: 0, vegetables: 0 });

  const vegetables = [
    { name: 'Tomates', icon: '🍅', defaultPrice: 50 },
    { name: 'Alface', icon: '🥬', defaultPrice: 30 },
    { name: 'Cenouras', icon: '🥕', defaultPrice: 40 },
    { name: 'Pepinos', icon: '🥒', defaultPrice: 35 },
    { name: 'Couve', icon: '🥬', defaultPrice: 25 },
  ];

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    try {
      const pensData = animalPens
        .getAll()
        .filter((p) => ['Codornezes', 'Galinhas', 'Patos'].includes(p.type))
        .sort((a, b) => a.type.localeCompare(b.type));
      setPens(pensData);

      const today = new Date().toISOString().split('T')[0];

      const eggsData = eggProduction.getByDate(today);
      const veggiesData = vegetableProduction.getByDate(today);

      const totalEggs = eggsData.reduce((sum, e) => sum + e.quantity, 0);
      const totalVeggiesValue = veggiesData.reduce(
        (sum, v) => sum + v.weight_kg * v.base_price,
        0
      );

      setTodayProduction({
        eggs: totalEggs,
        vegetables: totalVeggiesValue,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function recordEggs(penId: string) {
    const count = Number(eggCount[penId] || 0);
    if (count <= 0) return;

    try {
      eggProduction.create({
        pen_id: penId,
        quantity: count,
        date: new Date().toISOString().split('T')[0],
        created_by: userName,
      });

      setEggCount({ ...eggCount, [penId]: '' });
      setTodayProduction({
        ...todayProduction,
        eggs: todayProduction.eggs + count,
      });
      toast.success(`✅ ${count} ovos registrados!`);
    } catch (error) {
      console.error('Error recording eggs:', error);
      toast.error('Erro ao registrar ovos');
    }
  }

  function recordVegetable() {
    const weight = Number(vegetableWeight);
    const price = Number(vegetablePrice);

    if (weight <= 0 || price <= 0) {
      toast.error('⚠️ Preencha peso e preço');
      return;
    }

    try {
      vegetableProduction.create({
        vegetable_type: selectedVegetable,
        weight_kg: weight,
        base_price: price,
        date: new Date().toISOString().split('T')[0],
        created_by: userName,
      });

      const value = weight * price;
      setVegetableWeight('');
      setVegetablePrice('');
      setTodayProduction({
        ...todayProduction,
        vegetables: todayProduction.vegetables + value,
      });
      toast.success(
        `✅ ${weight}kg de ${selectedVegetable} registrados! Valor: ${value.toLocaleString(
          'pt-MZ'
        )} MT`
      );
    } catch (error) {
      console.error('Error recording vegetable:', error);
      toast.error('Erro ao registrar hortícola');
    }
  }

  const quickEggButtons = [10, 30, 50, 100];

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
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-amber-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Registro de Produção
        </h2>
        <p className="text-gray-600">Recolha de ovos e hortícolas do dia</p>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Egg className="w-6 h-6" />
            <p className="text-sm font-semibold">Ovos Hoje</p>
          </div>
          <p className="text-4xl font-bold">{todayProduction.eggs}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Apple className="w-6 h-6" />
            <p className="text-sm font-semibold">Hortícolas Hoje</p>
          </div>
          <p className="text-3xl font-bold">
            {todayProduction.vegetables.toLocaleString('pt-MZ', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            <span className="text-lg ml-1">MT</span>
          </p>
        </div>
      </div>

      {/* Egg Collection */}
      <div className="bg-white rounded-xl shadow-md border-2 border-amber-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b-2 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="bg-amber-200 p-2 rounded-lg">
              <Egg className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Recolha de Ovos
              </h3>
              <p className="text-sm text-gray-600">
                Contador rápido por capoeira
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {pens.map((pen) => (
            <div
              key={pen.id}
              className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-800">{pen.type}</h4>
                  <p className="text-sm text-gray-600">{pen.name}</p>
                </div>
                <div className="bg-white rounded-lg px-3 py-1 border-2 border-amber-300">
                  <p className="text-xs text-gray-600">Efetivo</p>
                  <p className="text-lg font-bold text-amber-600">
                    {pen.current_count}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {quickEggButtons.map((count) => (
                  <button
                    key={count}
                    onClick={() =>
                      setEggCount({ ...eggCount, [pen.id]: String(count) })
                    }
                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-3 px-2 rounded-lg transition-all border-2 border-amber-300"
                  >
                    +{count}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={eggCount[pen.id] || ''}
                  onChange={(e) =>
                    setEggCount({ ...eggCount, [pen.id]: e.target.value })
                  }
                  className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                  placeholder="Quantidade"
                />
                <button
                  onClick={() => recordEggs(pen.id)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Registrar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vegetable Production */}
      <div className="bg-white rounded-xl shadow-md border-2 border-green-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-200 p-2 rounded-lg">
              <Apple className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Hortícolas</h3>
              <p className="text-sm text-gray-600">
                Registro de colheita com valor
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Hortícola:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {vegetables.map((veg) => (
                <button
                  key={veg.name}
                  onClick={() => {
                    setSelectedVegetable(veg.name);
                    setVegetablePrice(String(veg.defaultPrice));
                  }}
                  className={`py-3 px-2 rounded-lg font-semibold transition-all border-2 ${
                    selectedVegetable === veg.name
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  }`}
                >
                  <div className="text-2xl mb-1">{veg.icon}</div>
                  <div className="text-xs">{veg.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Peso (kg):
              </label>
              <input
                type="number"
                value={vegetableWeight}
                onChange={(e) => setVegetableWeight(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                placeholder="Ex: 25"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preço Base (MT/kg):
              </label>
              <input
                type="number"
                value={vegetablePrice}
                onChange={(e) => setVegetablePrice(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                placeholder="Ex: 50"
                step="1"
              />
            </div>
          </div>

          {vegetableWeight && vegetablePrice && (
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Valor do Dia:
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {(
                      Number(vegetableWeight) * Number(vegetablePrice)
                    ).toLocaleString('pt-MZ', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    MT
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600" />
              </div>
            </div>
          )}

          <button
            onClick={recordVegetable}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-3 text-lg"
          >
            <Plus className="w-6 h-6" />
            Registrar Colheita
          </button>
        </div>
      </div>
    </div>
  );
}
