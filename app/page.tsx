'use client';

import { useState } from 'react';
import { User, HelpCircle } from 'lucide-react';
import { HelpModal } from '@/components/HelpTooltip';
import Dashboard from '@/components/Dashboard';
import FeedManagement from '@/components/FeedManagement';
import AnimalLifecycle from '@/components/AnimalLifecycle';
import ProductionRegistry from '@/components/ProductionRegistry';
import OwnerAudit from '@/components/OwnerAudit';
import PenManagement from '@/components/PenManagement';
import Statistics from '@/components/Statistics';
import FeedTypeManagement from '@/components/FeedTypeManagement';

type UserRole = 'operator' | 'owner';
type ActiveView =
  | 'dashboard'
  | 'feed'
  | 'animals'
  | 'production'
  | 'audit'
  | 'pens'
  | 'statistics'
  | 'feedTypes';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserRole>('operator');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [showHelp, setShowHelp] = useState(false);

  const userName = currentUser === 'operator' ? 'Elton' : 'Ilda';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C10.9 2 10 2.9 10 4V5C7.79 5.19 6 7.09 6 9.38V12.38C6 13.91 5.12 15.31 3.71 16C3.26 16.26 3 16.75 3 17.26V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V17.26C21 16.75 20.74 16.26 20.29 16C18.88 15.31 18 13.91 18 12.38V9.38C18 7.09 16.21 5.19 14 5V4C14 2.9 13.1 2 12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Ilda's Farm</h1>
                <p className="text-xs text-green-100">Gestão Agrícola</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelp(true)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all backdrop-blur"
                title="Ajuda"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentUser(currentUser === 'operator' ? 'owner' : 'operator')
                }
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all backdrop-blur"
              >
                <User className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-xs text-green-100">Usuário</p>
                  <p className="font-semibold">{userName}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-green-200 sticky top-[72px] z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-3">
            <NavButton
              active={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
              label="Painel"
            />
            <NavButton
              active={activeView === 'feed'}
              onClick={() => setActiveView('feed')}
              label="Ração"
            />
            <NavButton
              active={activeView === 'animals'}
              onClick={() => setActiveView('animals')}
              label="Animais"
            />
            <NavButton
              active={activeView === 'production'}
              onClick={() => setActiveView('production')}
              label="Produção"
            />
            {currentUser === 'owner' && (
              <>
                <NavButton
                  active={activeView === 'pens'}
                  onClick={() => setActiveView('pens')}
                  label="Capoeiras"
                />
                <NavButton
                  active={activeView === 'feedTypes'}
                  onClick={() => setActiveView('feedTypes')}
                  label="Tipos Ração"
                />
                <NavButton
                  active={activeView === 'statistics'}
                  onClick={() => setActiveView('statistics')}
                  label="Estatísticas"
                />
                <NavButton
                  active={activeView === 'audit'}
                  onClick={() => setActiveView('audit')}
                  label="Auditoria"
                />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20">
        {activeView === 'dashboard' && (
          <Dashboard key="dashboard" userName={userName} />
        )}
        {activeView === 'feed' && (
          <FeedManagement key="feed" userName={userName} />
        )}
        {activeView === 'animals' && (
          <AnimalLifecycle key="animals" userName={userName} />
        )}
        {activeView === 'production' && (
          <ProductionRegistry key="production" userName={userName} />
        )}
        {activeView === 'pens' && currentUser === 'owner' && (
          <PenManagement key="pens" userName={userName} />
        )}
        {activeView === 'feedTypes' && currentUser === 'owner' && (
          <FeedTypeManagement key="feedTypes" userName={userName} />
        )}
        {activeView === 'statistics' && currentUser === 'owner' && (
          <Statistics key="statistics" userName={userName} />
        )}
        {activeView === 'audit' && currentUser === 'owner' && (
          <OwnerAudit key="audit" userName={userName} />
        )}
      </main>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

function NavButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all min-w-[100px]
        ${
          active
            ? 'bg-green-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {label}
    </button>
  );
}
