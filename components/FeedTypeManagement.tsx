'use client';

import { useEffect, useMemo, useState } from 'react';
import { feedInventory, FeedInventory, animalPens } from '@/lib/storage';
import { Plus, Trash2, Save, X, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface FeedTypeManagementProps {
  userName: string;
}

export default function FeedTypeManagement({ userName }: FeedTypeManagementProps) {
  const [feeds, setFeeds] = useState<FeedInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingFeed, setEditingFeed] = useState<string | null>(null);
  const [form, setForm] = useState({
    feed_type: '',
    current_stock_kg: '',
    daily_consumption_kg: '',
  });
  const [editForm, setEditForm] = useState<Record<string, { stock: string; consumption: string }>>({});

  useEffect(() => {
    load();
  }, []);

  function load() {
    try {
      const data = feedInventory
        .getAll()
        .slice()
        .sort((a, b) => a.feed_type.localeCompare(b.feed_type));
      setFeeds(data);
    } catch (e) {
      console.error('Error loading feed types:', e);
    } finally {
      setLoading(false);
    }
  }

  const penTypesInUse = useMemo(() => {
    try {
      return new Set(animalPens.getAll().map((p) => p.type));
    } catch {
      return new Set<string>();
    }
  }, []);

  function handleAdd() {
    const feedType = form.feed_type.trim();
    if (!feedType) {
      toast.error('⚠️ Informe o tipo de ração');
      return;
    }
    if (feeds.some((f) => f.feed_type.toLowerCase() === feedType.toLowerCase())) {
      toast.error('⚠️ Já existe este tipo de ração');
      return;
    }

    const stock = Number(form.current_stock_kg || 0);
    const daily = Number(form.daily_consumption_kg || 0);
    if (stock < 0 || daily < 0) {
      toast.error('⚠️ Valores inválidos');
      return;
    }

    try {
      feedInventory.create({
        feed_type: feedType,
        current_stock_kg: stock,
        daily_consumption_kg: daily,
      });
      toast.success('✅ Tipo de ração criado!');
      setShowAdd(false);
      setForm({ feed_type: '', current_stock_kg: '', daily_consumption_kg: '' });
      load();
    } catch (e) {
      console.error('Error creating feed type:', e);
      toast.error('Erro ao criar tipo de ração');
    }
  }

  function handleDelete(feedType: string) {
    if (penTypesInUse.has(feedType)) {
      toast.error(
        '⚠️ Este tipo está em uso em uma capoeira/pocilga. Altere o tipo da capoeira primeiro.'
      );
      return;
    }

    if (!confirm(`Excluir o tipo de ração "${feedType}"?`)) return;

    try {
      const ok = feedInventory.delete(feedType);
      if (ok) {
        toast.success('✅ Tipo de ração excluído!');
        load();
      } else {
        toast.error('Tipo não encontrado');
      }
    } catch (e) {
      console.error('Error deleting feed type:', e);
      toast.error('Erro ao excluir tipo de ração');
    }
  }

  function startEdit(feed: FeedInventory) {
    setEditingFeed(feed.feed_type);
    setEditForm({
      ...editForm,
      [feed.feed_type]: {
        stock: String(feed.current_stock_kg),
        consumption: String(feed.daily_consumption_kg),
      },
    });
  }

  function cancelEdit() {
    setEditingFeed(null);
    setEditForm({});
  }

  function saveEdit(feedType: string) {
    const formData = editForm[feedType];
    if (!formData) return;

    const stock = Number(formData.stock);
    const consumption = Number(formData.consumption);

    if (isNaN(stock) || isNaN(consumption) || stock < 0 || consumption < 0) {
      toast.error('⚠️ Valores inválidos');
      return;
    }

    try {
      const updated = feedInventory.update(feedType, {
        current_stock_kg: stock,
        daily_consumption_kg: consumption,
      });
      if (updated) {
        toast.success('✅ Tipo de ração atualizado!');
        cancelEdit();
        load();
      }
    } catch (e) {
      console.error('Error updating feed:', e);
      toast.error('Erro ao atualizar');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-amber-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tipos de Ração</h2>
            <p className="text-gray-600">
              CRUD de tipos de ração (estoque e consumo por tipo)
            </p>
          </div>
          {!showAdd && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Tipo
            </button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Criar Tipo de Ração</h3>
            <button
              onClick={() => {
                setShowAdd(false);
                setForm({ feed_type: '', current_stock_kg: '', daily_consumption_kg: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo:
              </label>
              <input
                value={form.feed_type}
                onChange={(e) => setForm({ ...form, feed_type: e.target.value })}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                placeholder="Ex: Galinhas"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Inicial (kg):
              </label>
              <input
                type="number"
                value={form.current_stock_kg}
                onChange={(e) => setForm({ ...form, current_stock_kg: e.target.value })}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Consumo Diário (kg):
              </label>
              <input
                type="number"
                value={form.daily_consumption_kg}
                onChange={(e) =>
                  setForm({ ...form, daily_consumption_kg: e.target.value })
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
                setShowAdd(false);
                setForm({ feed_type: '', current_stock_kg: '', daily_consumption_kg: '' });
              }}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {feeds.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 text-center text-gray-600">
            Nenhum tipo de ração cadastrado.
          </div>
        ) : (
          feeds.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-xl shadow-md p-5 border-2 border-gray-200"
            >
              {editingFeed === f.feed_type ? (
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800">Editar {f.feed_type}</h4>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock Atual (kg):
                      </label>
                      <input
                        type="number"
                        value={editForm[f.feed_type]?.stock || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            [f.feed_type]: {
                              ...editForm[f.feed_type],
                              stock: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Consumo Diário (kg):
                      </label>
                      <input
                        type="number"
                        value={editForm[f.feed_type]?.consumption || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            [f.feed_type]: {
                              ...editForm[f.feed_type],
                              consumption: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => saveEdit(f.feed_type)}
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{f.feed_type}</h4>
                      <p className="text-xs text-gray-500">
                        Atualizado: {new Date(f.last_updated).toLocaleString('pt-MZ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(f)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(f.feed_type)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Stock</p>
                      <p className="text-2xl font-bold text-gray-800">{f.current_stock_kg} kg</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Consumo diário</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {f.daily_consumption_kg} kg
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

