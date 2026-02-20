'use client';

import { useEffect, useState } from 'react';
import { animalPens, AnimalPen } from '@/lib/storage';
import { TrendingUp, DollarSign } from 'lucide-react';

interface DashboardProps {
  userName: string;
}

export default function Dashboard({ userName }: DashboardProps) {
  const [pens, setPens] = useState<AnimalPen[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalRevenue = pens.reduce(
    (sum, pen) => sum + pen.current_count * pen.base_price,
    0
  );

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
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bem-vindo, {userName}!
        </h2>
        <p className="text-gray-600">
          Visão geral da sua quinta - Tudo sob controle
        </p>
      </div>

      {/* Revenue Forecast */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium">
              Previsão de Receita
            </p>
            <p className="text-xs text-green-200">Baseado no efetivo atual</p>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <DollarSign className="w-8 h-8 mb-1" />
          <p className="text-4xl font-bold">
            {totalRevenue.toLocaleString('pt-MZ', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <span className="text-lg text-green-100 mb-2">MT</span>
        </div>
      </div>

      {/* Animal Pens Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>Efetivo Pecuário</span>
          <span className="text-sm font-normal text-gray-500">
            (Capoeiras & Pocilgas)
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pens.map((pen) => {
            const revenue = pen.current_count * pen.base_price;
            return (
              <div
                key={pen.id}
                className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 hover:border-green-400 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getAnimalIcon(pen.type)}</div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">
                        {pen.type}
                      </h4>
                      <p className="text-sm text-gray-500">{pen.name}</p>
                    </div>
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full">
                    <p className="text-green-700 font-bold text-sm">
                      {pen.current_count}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço Base:</span>
                    <span className="font-semibold text-gray-800">
                      {pen.base_price.toLocaleString('pt-MZ')} MT
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="font-bold text-green-700">
                      {revenue.toLocaleString('pt-MZ')} MT
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border-2 border-blue-200">
          <p className="text-blue-600 text-sm font-medium mb-1">Total Aves</p>
          <p className="text-2xl font-bold text-gray-800">
            {pens
              .filter((p) =>
                ['Codornezes', 'Galinhas', 'Patos'].includes(p.type)
              )
              .reduce((sum, p) => sum + p.current_count, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-2 border-amber-200">
          <p className="text-amber-600 text-sm font-medium mb-1">Suínos</p>
          <p className="text-2xl font-bold text-gray-800">
            {pens
              .filter((p) => p.type === 'Porcos')
              .reduce((sum, p) => sum + p.current_count, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-2 border-green-200">
          <p className="text-green-600 text-sm font-medium mb-1">Capoeiras</p>
          <p className="text-2xl font-bold text-gray-800">{pens.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-2 border-emerald-200">
          <p className="text-emerald-600 text-sm font-medium mb-1">
            Valor Médio
          </p>
          <p className="text-2xl font-bold text-gray-800">
            {pens.length > 0
              ? Math.round(totalRevenue / pens.length).toLocaleString('pt-MZ')
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
