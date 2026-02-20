# Lírio App - Sistema de Gestão Agrícola

A mobile-first agricultural management application designed to eliminate manual bookkeeping for farm owners. Built with Next.js, Tailwind CSS, and localStorage (ready for Node.js API + MongoDB migration).

## Features

### 1. Painel Principal (Dashboard)
- **"Peace of Mind" summary** with visual "silos" for different animal pens
- Real-time inventory tracking for:
  - Codornezes (Quails)
  - Galinhas (Chickens)
  - Porcos (Pigs)
  - Patos (Ducks)
- **Previsão de Receita** (Revenue Forecast) based on inventory and base prices
- Quick stats showing total birds, swine, pens, and average value

### 2. Gestão de Ração (Feed Management)
- Visual **"fuel gauge"** system showing current stock levels
- Color-coded alerts:
  - Green: Stock is healthy (>30%)
  - Amber: Low stock warning (15-30%)
  - Red: Critical stock (<15%)
- **Entrada de Stock** (Stock Entry) with simple input
- **Consumo Diário** (Daily Consumption) tracking
- Days remaining calculation

### 3. Ciclo de Vida Animal (Animal Lifecycle)
- Quick-add buttons for births/incubation:
  - +10 and +30 quick buttons per pen
  - Custom amount entry
- Track population in **Capoeiras** (pens) with real-time headcounts
- Record transactions:
  - Nascimentos (Births)
  - Compras (Purchases)
  - Vendas (Sales)
  - Óbitos (Deaths)

### 4. Registro de Produção (Production Registry)
- **Recolha de Ovos** (Egg Collection):
  - Simple counter per pen
  - Quick buttons: +10, +30, +50, +100
  - Custom amount entry
- **Hortícolas** (Vegetables):
  - Weight input (kg) for various vegetables:
    - Tomates (Tomatoes)
    - Alface (Lettuce)
    - Cenouras (Carrots)
    - Pepinos (Cucumbers)
    - Couve (Cabbage)
  - **Preço Base** multiplier showing **Valor do Dia** (Day's Value)
  - Visual value calculator

### 5. User Roles

#### Vista do Operador (Elton - Operator View)
- Simplified interface with large touch targets
- All production and lifecycle management features
- Quick-add buttons for fast data entry
- **3-tap maximum** for any entry

#### Vista do Proprietário (Ilda - Owner View)
- All operator features plus:
- **Fecho de Contas** (Accounts Closure) screen
- Comprehensive audit logs:
  - Animal transactions history
  - Egg production records
  - Vegetable harvest records
- Summary statistics and totals
- Transaction filtering by type

## Design Features

- **Mobile-first responsive design** optimized for field use
- **High-contrast UI** with large touch targets
- **Agri-tech aesthetic** using greens and earth tones
- **Frictionless UX**: Maximum 3 taps for any entry
- **Real-time updates** with localStorage (ready for API migration)
- **Toast notifications** for user feedback
- **Portuguese UI** (PT-MZ/PT) throughout

## Technical Stack

- **Frontend**: Next.js 13.5 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Storage**: localStorage (mock data, ready for Node.js API + MongoDB)
- **State Management**: React Hooks
- **Notifications**: Sonner
- **UI Components**: shadcn/ui

## Database Schema

### Tables
- `animal_pens` - Animal housing units with inventory
- `feed_inventory` - Feed stock and consumption tracking
- `animal_transactions` - All animal lifecycle events
- `egg_production` - Daily egg collection records
- `vegetable_production` - Harvest records with pricing
- `app_users` - User management with roles

## Getting Started

1. No environment variables needed! The app uses localStorage with mock data.

2. The app initializes with seed data:
   - 4 animal pens (Codornezes, Galinhas, Porcos, Patos)
   - Initial feed inventory
   - Demo users (Elton - Operator, Ilda - Owner)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## User Experience

### For Operators (Elton)
1. Switch to operator view via the user button
2. Use quick-add buttons for rapid data entry
3. Access 4 main modules: Painel, Ração, Animais, Produção
4. Large touch targets optimized for outdoor/field use

### For Owners (Ilda)
1. All operator features plus Auditoria tab
2. View comprehensive transaction history
3. Monitor totals and trends
4. Review all operations by date and operator

## Portuguese Terminology

- **Capoeiras** - Animal pens/coops
- **Ração** - Feed/fodder
- **Hortícolas** - Vegetables/produce
- **Efetivo Pecuário** - Livestock inventory
- **Nascimentos** - Births
- **Óbitos** - Deaths
- **Recolha** - Collection/harvest
- **Previsão de Receita** - Revenue forecast
- **Fecho de Contas** - Accounts closure/audit

## Key Benefits

✅ **No more manual bookkeeping**
✅ **Real-time inventory tracking**
✅ **Instant revenue forecasting**
✅ **Complete audit trail**
✅ **Field-optimized mobile interface**
✅ **Role-based access control**
✅ **One-tap data entry**

---

Built with ❤️ for farmers who have "no patience" for complex forms.
