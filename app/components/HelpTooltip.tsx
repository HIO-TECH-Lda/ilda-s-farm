'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
}

export function HelpTooltip({ content, title }: HelpTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {showTooltip && (
        <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          {title && (
            <div className="font-bold mb-1 flex items-center justify-between">
              <span>{title}</span>
              <button
                onClick={() => setShowTooltip(false)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <p>{content}</p>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Ajuda - Ilda's Farm</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Painel Principal</h3>
            <p className="text-gray-600 mb-2">
              O painel mostra uma visão geral da sua quinta:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Previsão de receita baseada no efetivo atual</li>
              <li>Visualização de todas as capoeiras e pocilgas</li>
              <li>Estatísticas rápidas (total de aves, suínos, etc.)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Gestão de Ração</h3>
            <p className="text-gray-600 mb-2">
              Sistema visual de controle de stock de ração:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>
                <strong>Verde:</strong> Stock saudável (mais de 30%)
              </li>
              <li>
                <strong>Âmbar:</strong> Stock baixo (15-30%)
              </li>
              <li>
                <strong>Vermelho:</strong> Stock crítico (menos de 15%)
              </li>
              <li>Registre entrada de stock e consumo diário</li>
              <li>Edite o consumo diário clicando em "Editar"</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Ciclo de Vida Animal</h3>
            <p className="text-gray-600 mb-2">
              Registre transações de animais rapidamente:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>
                <strong>Nascimentos:</strong> Use os botões +10 ou +30, ou entrada personalizada
              </li>
              <li>
                <strong>Compras:</strong> Clique em "Registrar Compra" e insira a quantidade
              </li>
              <li>
                <strong>Vendas:</strong> Use o botão -5 Venda ou entrada personalizada
              </li>
              <li>
                <strong>Óbitos:</strong> Use o botão -1 Óbito
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Registro de Produção</h3>
            <p className="text-gray-600 mb-2">
              Registre produção de ovos e hortícolas:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>
                <strong>Ovos:</strong> Use botões rápidos (+10, +30, +50, +100) ou entrada manual
              </li>
              <li>
                <strong>Hortícolas:</strong> Selecione o tipo, insira peso (kg) e preço base
              </li>
              <li>O valor do dia é calculado automaticamente</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Vista do Proprietário</h3>
            <p className="text-gray-600 mb-2">
              Recursos adicionais disponíveis apenas para proprietários:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>
                <strong>Capoeiras:</strong> Adicione, edite ou exclua capoeiras
              </li>
              <li>
                <strong>Estatísticas:</strong> Visualize gráficos e tendências de produção
              </li>
              <li>
                <strong>Auditoria:</strong> Veja histórico completo com filtros por tipo e data
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Dicas Rápidas</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Máximo de 3 toques para qualquer entrada</li>
              <li>Use botões rápidos para entrada rápida de dados</li>
              <li>Os dados são salvos automaticamente no navegador</li>
              <li>Troque entre Operador e Proprietário usando o botão no topo</li>
            </ul>
          </section>
        </div>
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
