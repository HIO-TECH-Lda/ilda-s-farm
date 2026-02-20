// LocalStorage-based data layer for Lírio App
// This replaces Supabase for frontend-only development

export interface AnimalPen {
  id: string;
  type: string;
  name: string;
  current_count: number;
  base_price: number;
  created_at: string;
  updated_at: string;
}

export interface FeedInventory {
  id: string;
  feed_type: string; // Type of feed: 'Codornezes', 'Galinhas', 'Porcos', 'Patos', etc.
  current_stock_kg: number;
  daily_consumption_kg: number;
  last_updated: string;
}

export interface AnimalTransaction {
  id: string;
  pen_id: string;
  transaction_type: string;
  quantity: number;
  notes: string;
  created_at: string;
  created_by: string;
}

export interface EggProduction {
  id: string;
  pen_id: string;
  quantity: number;
  date: string;
  created_at: string;
  created_by: string;
}

export interface VegetableProduction {
  id: string;
  vegetable_type: string;
  weight_kg: number;
  base_price: number;
  date: string;
  created_at: string;
  created_by: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

// Storage keys
const STORAGE_KEYS = {
  ANIMAL_PENS: 'lirio_animal_pens',
  FEED_INVENTORY: 'lirio_feed_inventory',
  ANIMAL_TRANSACTIONS: 'lirio_animal_transactions',
  EGG_PRODUCTION: 'lirio_egg_production',
  VEGETABLE_PRODUCTION: 'lirio_vegetable_production',
  APP_USERS: 'lirio_app_users',
  INITIALIZED: 'lirio_initialized',
};

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : [];
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function migrateStorageIfNeeded(): void {
  if (typeof window === 'undefined') return;

  // Migrate feed inventory items to include feed_type (older versions had a single record)
  const feedsRaw = getItem<any>(STORAGE_KEYS.FEED_INVENTORY);
  if (feedsRaw.length > 0) {
    const migrated: FeedInventory[] = feedsRaw
      .map((f) => {
        if (!f) return null;
        const feedType =
          typeof f.feed_type === 'string' && f.feed_type.trim().length > 0
            ? f.feed_type.trim()
            : 'Geral';

        return {
          id: typeof f.id === 'string' ? f.id : generateId(),
          feed_type: feedType,
          current_stock_kg: safeNumber(f.current_stock_kg, 0),
          daily_consumption_kg: safeNumber(f.daily_consumption_kg, 0),
          last_updated:
            typeof f.last_updated === 'string'
              ? f.last_updated
              : new Date().toISOString(),
        } satisfies FeedInventory;
      })
      .filter(Boolean) as FeedInventory[];

    // De-duplicate by feed_type (keep first)
    const seen = new Set<string>();
    const deduped = migrated.filter((f) => {
      if (seen.has(f.feed_type)) return false;
      seen.add(f.feed_type);
      return true;
    });

    setItem(STORAGE_KEYS.FEED_INVENTORY, deduped);
  }

  // Ensure there is a feed inventory entry for each pen type (so UI never shows "undefined")
  const pens = getItem<AnimalPen>(STORAGE_KEYS.ANIMAL_PENS);
  const penTypes = Array.from(new Set(pens.map((p) => p.type).filter(Boolean)));
  if (penTypes.length > 0) {
    const feeds = getItem<FeedInventory>(STORAGE_KEYS.FEED_INVENTORY);
    const existingTypes = new Set(feeds.map((f) => f.feed_type));
    let changed = false;
    for (const type of penTypes) {
      if (!existingTypes.has(type)) {
        feeds.push({
          id: generateId(),
          feed_type: type,
          current_stock_kg: 0,
          daily_consumption_kg: 0,
          last_updated: new Date().toISOString(),
        });
        changed = true;
      }
    }
    if (changed) setItem(STORAGE_KEYS.FEED_INVENTORY, feeds);
  }
}

// Initialize seed data
export function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (initialized === 'true') {
    migrateStorageIfNeeded();
    return;
  }

  // Seed animal pens
  const seedPens: AnimalPen[] = [
    {
      id: generateId(),
      type: 'Codornezes',
      name: 'Capoeira Codornezes A',
      current_count: 150,
      base_price: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'Galinhas',
      name: 'Capoeira Galinhas B',
      current_count: 80,
      base_price: 200,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'Porcos',
      name: 'Pocilga Principal',
      current_count: 12,
      base_price: 8000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'Patos',
      name: 'Capoeira Patos C',
      current_count: 45,
      base_price: 150,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Seed feed inventory - one per animal type
  const seedFeed: FeedInventory[] = [
    {
      id: generateId(),
      feed_type: 'Codornezes',
      current_stock_kg: 150,
      daily_consumption_kg: 8,
      last_updated: new Date().toISOString(),
    },
    {
      id: generateId(),
      feed_type: 'Galinhas',
      current_stock_kg: 200,
      daily_consumption_kg: 12,
      last_updated: new Date().toISOString(),
    },
    {
      id: generateId(),
      feed_type: 'Porcos',
      current_stock_kg: 300,
      daily_consumption_kg: 20,
      last_updated: new Date().toISOString(),
    },
    {
      id: generateId(),
      feed_type: 'Patos',
      current_stock_kg: 100,
      daily_consumption_kg: 6,
      last_updated: new Date().toISOString(),
    },
  ];

  // Seed app users
  const seedUsers: AppUser[] = [
    {
      id: generateId(),
      name: 'Elton',
      role: 'operator',
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Ilda',
      role: 'owner',
      created_at: new Date().toISOString(),
    },
  ];

  setItem(STORAGE_KEYS.ANIMAL_PENS, seedPens);
  setItem(STORAGE_KEYS.FEED_INVENTORY, seedFeed);
  setItem(STORAGE_KEYS.ANIMAL_TRANSACTIONS, []);
  setItem(STORAGE_KEYS.EGG_PRODUCTION, []);
  setItem(STORAGE_KEYS.VEGETABLE_PRODUCTION, []);
  setItem(STORAGE_KEYS.APP_USERS, seedUsers);
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  migrateStorageIfNeeded();
}

// Animal Pens operations
export const animalPens = {
  getAll: (): AnimalPen[] => {
    return getItem<AnimalPen>(STORAGE_KEYS.ANIMAL_PENS);
  },

  getById: (id: string): AnimalPen | undefined => {
    const pens = getItem<AnimalPen>(STORAGE_KEYS.ANIMAL_PENS);
    return pens.find((p) => p.id === id);
  },

  update: (id: string, updates: Partial<AnimalPen>): AnimalPen | null => {
    const pens = getItem<AnimalPen>(STORAGE_KEYS.ANIMAL_PENS);
    const index = pens.findIndex((p) => p.id === id);
    if (index === -1) return null;

    pens[index] = {
      ...pens[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.ANIMAL_PENS, pens);
    return pens[index];
  },

  create: (pen: Omit<AnimalPen, 'id' | 'created_at' | 'updated_at'>): AnimalPen => {
    const pens = getItem<AnimalPen>(STORAGE_KEYS.ANIMAL_PENS);
    const newPen: AnimalPen = {
      ...pen,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    pens.push(newPen);
    setItem(STORAGE_KEYS.ANIMAL_PENS, pens);
    return newPen;
  },
};

// Feed Inventory operations
export const feedInventory = {
  getAll: (): FeedInventory[] => {
    return getItem<FeedInventory>(STORAGE_KEYS.FEED_INVENTORY);
  },

  getByType: (feedType: string): FeedInventory | null => {
    const feed = getItem<FeedInventory>(STORAGE_KEYS.FEED_INVENTORY);
    return feed.find((f) => f.feed_type === feedType) || null;
  },

  get: (): FeedInventory | null => {
    // Legacy method - returns first feed for backward compatibility
    const feed = getItem<FeedInventory>(STORAGE_KEYS.FEED_INVENTORY);
    return feed.length > 0 ? feed[0] : null;
  },

  update: (feedType: string, updates: Partial<FeedInventory>): FeedInventory | null => {
    const feed = getItem<FeedInventory>(STORAGE_KEYS.FEED_INVENTORY);
    const index = feed.findIndex((f) => f.feed_type === feedType);
    if (index === -1) return null;

    feed[index] = {
      ...feed[index],
      ...updates,
      last_updated: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.FEED_INVENTORY, feed);
    return feed[index];
  },

  create: (feed: Omit<FeedInventory, 'id' | 'last_updated'>): FeedInventory => {
    const feeds = getItem<FeedInventory>(STORAGE_KEYS.FEED_INVENTORY);
    const newFeed: FeedInventory = {
      ...feed,
      id: generateId(),
      last_updated: new Date().toISOString(),
    };
    feeds.push(newFeed);
    setItem(STORAGE_KEYS.FEED_INVENTORY, feeds);
    return newFeed;
  },

  delete: (feedType: string): boolean => {
    const feeds = getItem<FeedInventory>(STORAGE_KEYS.FEED_INVENTORY);
    const filtered = feeds.filter((f) => f.feed_type !== feedType);
    setItem(STORAGE_KEYS.FEED_INVENTORY, filtered);
    return filtered.length < feeds.length;
  },
};

// Animal Transactions operations
export const animalTransactions = {
  getAll: (limit?: number): AnimalTransaction[] => {
    const transactions = getItem<AnimalTransaction>(
      STORAGE_KEYS.ANIMAL_TRANSACTIONS
    );
    const sorted = transactions.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  },

  create: (
    transaction: Omit<AnimalTransaction, 'id' | 'created_at'>
  ): AnimalTransaction => {
    const transactions = getItem<AnimalTransaction>(
      STORAGE_KEYS.ANIMAL_TRANSACTIONS
    );
    const newTransaction: AnimalTransaction = {
      ...transaction,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    setItem(STORAGE_KEYS.ANIMAL_TRANSACTIONS, transactions);
    return newTransaction;
  },
};

// Egg Production operations
export const eggProduction = {
  getAll: (limit?: number): EggProduction[] => {
    const eggs = getItem<EggProduction>(STORAGE_KEYS.EGG_PRODUCTION);
    const sorted = eggs.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  },

  getByDate: (date: string): EggProduction[] => {
    const eggs = getItem<EggProduction>(STORAGE_KEYS.EGG_PRODUCTION);
    return eggs.filter((e) => e.date === date);
  },

  create: (production: Omit<EggProduction, 'id' | 'created_at'>): EggProduction => {
    const eggs = getItem<EggProduction>(STORAGE_KEYS.EGG_PRODUCTION);
    const newProduction: EggProduction = {
      ...production,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    eggs.push(newProduction);
    setItem(STORAGE_KEYS.EGG_PRODUCTION, eggs);
    return newProduction;
  },
};

// Vegetable Production operations
export const vegetableProduction = {
  getAll: (limit?: number): VegetableProduction[] => {
    const vegetables = getItem<VegetableProduction>(
      STORAGE_KEYS.VEGETABLE_PRODUCTION
    );
    const sorted = vegetables.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  },

  getByDate: (date: string): VegetableProduction[] => {
    const vegetables = getItem<VegetableProduction>(
      STORAGE_KEYS.VEGETABLE_PRODUCTION
    );
    return vegetables.filter((v) => v.date === date);
  },

  create: (
    production: Omit<VegetableProduction, 'id' | 'created_at'>
  ): VegetableProduction => {
    const vegetables = getItem<VegetableProduction>(
      STORAGE_KEYS.VEGETABLE_PRODUCTION
    );
    const newProduction: VegetableProduction = {
      ...production,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    vegetables.push(newProduction);
    setItem(STORAGE_KEYS.VEGETABLE_PRODUCTION, vegetables);
    return newProduction;
  },
};

// Export a mock Supabase-like API for easier migration
export const storage = {
  animalPens,
  feedInventory,
  animalTransactions,
  eggProduction,
  vegetableProduction,
  initialize: initializeStorage,
};
