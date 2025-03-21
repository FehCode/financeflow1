import { toast } from "@/hooks/use-toast";
import { ActivityType } from "./userActivity";

const DB_NAME = 'FinanceFlowDB';
const DB_VERSION = 1;

interface DBTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
}

interface DBUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

interface DBUserActivity {
  id: string;
  userId: string;
  activityType: ActivityType; // Update to use ActivityType instead of string
  description: string;
  timestamp: string;
}

interface DBGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

class Database {
  private db: IDBDatabase | null = null;
  private static instance: Database | null = null;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async init(): Promise<boolean> {
    try {
      this.db = await this.openDatabase();
      return true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      toast({
        title: "Erro no Banco de Dados",
        description: "Falha ao inicializar o banco de dados. Verifique sua conexão.",
        variant: "destructive",
      });
      return false;
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // Criar stores
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('userId', 'userId', { unique: false });
          txStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('activities')) {
          const activityStore = db.createObjectStore('activities', { keyPath: 'id' });
          activityStore.createIndex('userId', 'userId', { unique: false });
          activityStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('goals')) {
          const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
          goalStore.createIndex('userId', 'userId', { unique: false });
          goalStore.createIndex('deadline', 'deadline', { unique: false });
        }
      };
    });
  }

  async saveUser(user: DBUser): Promise<void> {
    const store = this.getStore('users', 'readwrite');
    await this.promisifyRequest(store.put(user));
  }

  async getUser(id: string): Promise<DBUser | null> {
    const store = this.getStore('users', 'readonly');
    return await this.promisifyRequest(store.get(id));
  }

  async getUserByEmail(email: string): Promise<DBUser | null> {
    const store = this.getStore('users', 'readonly');
    const index = store.index('email');
    return await this.promisifyRequest(index.get(email));
  }

  async saveTransaction(transaction: DBTransaction): Promise<void> {
    const store = this.getStore('transactions', 'readwrite');
    await this.promisifyRequest(store.put(transaction));
  }

  async getTransactions(userId: string): Promise<DBTransaction[]> {
    const store = this.getStore('transactions', 'readonly');
    const index = store.index('userId');
    return await this.promisifyRequest(index.getAll(userId));
  }

  async deleteAllUserData(userId: string): Promise<void> {
    // Deleta transações do usuário
    const txStore = this.getStore('transactions', 'readwrite');
    const index = txStore.index('userId');
    const txs = await this.promisifyRequest<DBTransaction[]>(index.getAll(userId));
    
    for (const tx of txs || []) {
      await this.promisifyRequest<void>(txStore.delete(tx.id));
    }

    // Deleta usuário
    const userStore = this.getStore('users', 'readwrite');
    await this.promisifyRequest<void>(userStore.delete(userId));
  }

  async saveActivity(activity: DBUserActivity): Promise<void> {
    const store = this.getStore('activities', 'readwrite');
    await this.promisifyRequest(store.put(activity));
  }

  async getActivities(userId: string): Promise<DBUserActivity[]> {
    const store = this.getStore('activities', 'readonly');
    const index = store.index('userId');
    return await this.promisifyRequest(index.getAll(userId));
  }

  async getAllActivities(limit: number): Promise<DBUserActivity[]> {
    const store = this.getStore('activities', 'readonly');
    const index = store.index('timestamp');
    const activities = await this.promisifyRequest<DBUserActivity[]>(index.getAll());
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, limit);
  }

  async saveGoal(goal: DBGoal): Promise<void> {
    const store = this.getStore('goals', 'readwrite');
    await this.promisifyRequest(store.put(goal));
  }

  async getGoals(userId: string): Promise<DBGoal[]> {
    const store = this.getStore('goals', 'readonly');
    const index = store.index('userId');
    return await this.promisifyRequest(index.getAll(userId));
  }

  async deleteGoal(goalId: string): Promise<void> {
    const store = this.getStore('goals', 'readwrite');
    await this.promisifyRequest(store.delete(goalId));
  }

  private getStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const db = Database.getInstance();
export const initDatabase = () => db.init();
