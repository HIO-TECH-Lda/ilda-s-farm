'use client';

import { useEffect, useState } from 'react';
import { animalPens, feedInventory, AnimalPen } from '@/lib/storage';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PenManagementProps {
  userName: string;
}

export default function PenManagement({ userName }: PenManagementProps) {
  const [pens, setPens] = useState<AnimalPen[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPen, setEditingPen] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [useCustomType, setUseCustomType] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    current_count: 0,
    base_price: 0,
  });

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

  function startEdit(pen: AnimalPen) {
    setEditingPen(pen.id);
    setFormData({
      type: pen.type,
      name: pen.name,
      current_count: pen.current_count,
      base_price: pen.base_price,
    });
  }

  function cancelEdit() {
    setEditingPen(null);
    setFormData({ type: '', name: '', current_count: 0, base_price: 0 });
  }

  function saveEdit(penId: string) {
    try {
      const updated = animalPens.update(penId, {
        type: formData.type,
        name: formData.name,
        current_count: formData.current_count,
        base_price: formData.base_price,
      });

      if (updated) {
        loadPens();
        cancelEdit();
        toast.success('✅ Capoeira atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Error updating pen:', error);
      toast.error('Erro ao atualizar capoeira');
    }
  }

  function deletePen(penId: string) {
    if (!confirm('Tem certeza que deseja excluir esta capoeira?')) return;

    try {
      const pens = animalPens.getAll();
      const filtered = pens.filter((p) => p.id !== penId);
      // Update localStorage directly since we don't have a delete method
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'lirio_animal_pens',
          JSON.stringify(filtered)
        );
      }
      loadPens();
      toast.success('✅ Capoeira excluída!');
    } catch (error) {
      console.error('Error deleting pen:', error);
      toast.error('Erro ao excluir capoeira');
    }
  }

  function handleAdd() {
    const animalType = formData.type.trim();
    if (!animalType) {
      toast.error('⚠️ Informe o tipo de animal');
      return;
    }

    try {
      // Create the pen
      animalPens.create({
        type: animalType,
        name: formData.name.trim() || `${animalType} ${pens.length + 1}`,
        current_count: formData.current_count,
        base_price: formData.base_price,
      });

      // Automatically create feed type if it doesn't exist
      const existingFeed = feedInventory.getByType(animalType);
      if (!existingFeed) {
        feedInventory.create({
          feed_type: animalType,
          current_stock_kg: 0,
          daily_consumption_kg: 0,
        });
      }

      loadPens();
      setShowAddForm(false);
      setUseCustomType(false);
      setFormData({ type: '', name: '', current_count: 0, base_price: 0 });
      toast.success('✅ Capoeira adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding pen:', error);
      toast.error('Erro ao adicionar capoeira');
    }
  }

  const getAnimalIcon = (type: string) => {
    const icons: Record<string, string> = {
      Codornezes: '🦆',
      Galinhas: '🐔',
      Porcos: '🐷',
      Patos: '🦆',
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
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Gestão de Capoeiras
            </h2>
            <p className="text-gray-600">
              Adicionar, editar e excluir capoeiras e pocilgas
            </p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Adicionar Capoeira
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Nova Capoeira
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setUseCustomType(false);
                setFormData({ type: '', name: '', current_count: 0, base_price: 0 });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Animal:
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={useCustomType ? '' : formData.type}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setUseCustomType(true);
                        setFormData({ ...formData, type: '' });
                      } else {
                        setUseCustomType(false);
                        setFormData({ ...formData, type: e.target.value });
                      }
                    }}
                    className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                    disabled={useCustomType}
                  >
                    <option value="">Selecione...</option>
                    <option value="Codornezes">Codornezes</option>
                    <option value="Galinhas">Galinhas</option>
                    <option value="Porcos">Porcos</option>
                    <option value="Patos">Patos</option>
                    <option value="custom">➕ Outro (Personalizado)</option>
                  </select>
                </div>
                {useCustomType && (
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-3 text-lg border-2 border-green-500 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none"
                    placeholder="Ex: Perus, Cabras, Ovelhas..."
                    autoFocus
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome da Capoeira:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                placeholder="Ex: Capoeira A"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Efetivo Atual:
              </label>
              <input
                type="number"
                value={formData.current_count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_count: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preço Base (MT):
              </label>
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_price: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setUseCustomType(false);
                setFormData({ type: '', name: '', current_count: 0, base_price: 0 });
              }}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Pens List */}
      <div className="space-y-4">
        {pens.map((pen) => (
          <div
            key={pen.id}
            className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden"
          >
            {editingPen === pen.id ? (
              <div className="p-6 bg-blue-50 border-2 border-blue-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo:
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="Codornezes">Codornezes</option>
                      <option value="Galinhas">Galinhas</option>
                      <option value="Porcos">Porcos</option>
                      <option value="Patos">Patos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome:
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Efetivo:
                    </label>
                    <input
                      type="number"
                      value={formData.current_count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          current_count: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preço Base (MT):
                    </label>
                    <input
                      type="number"
                      value={formData.base_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          base_price: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => saveEdit(pen.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Preço Base</p>
                      <p className="text-lg font-bold text-gray-800">
                        {pen.base_price.toLocaleString('pt-MZ')} MT
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="text-lg font-bold text-green-700">
                        {(pen.current_count * pen.base_price).toLocaleString(
                          'pt-MZ'
                        )}{' '}
                        MT
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(pen)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => deletePen(pen.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
