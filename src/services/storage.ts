const USER_KEY = 'FinanceFlow:user';
const STORAGE_VERSION = 'FinanceFlow:version';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

export const StorageService = {
  saveUser(userData: StoredUser) {
    try {
      // Limpa todos os dados anteriores ao criar novo usuário
      this.clearAllUserData();
      
      // Salva o usuário e inicializa seus dados
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(this.getUserPrefix(userData.id) + 'transactions', JSON.stringify([]));
      localStorage.setItem(this.getUserPrefix(userData.id) + 'lastAccess', new Date().toISOString());
      
      console.log('User data initialized:', userData.id);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  getUserPrefix(userId: string) {
    return `FinanceFlow:user:${userId}:`;
  },

  saveTransactions(userId: string, transactions: any[]) {
    try {
      const key = this.getUserPrefix(userId) + 'transactions';
      const lastAccess = new Date().toISOString();
      
      // Salva as transações e atualiza último acesso
      localStorage.setItem(key, JSON.stringify(transactions));
      localStorage.setItem(this.getUserPrefix(userId) + 'lastAccess', lastAccess);
      
      console.log(`Transactions saved for user ${userId}:`, transactions);
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  },

  getTransactions(userId: string) {
    try {
      const key = this.getUserPrefix(userId) + 'transactions';
      const data = localStorage.getItem(key);
      console.log(`Retrieved transactions for user ${userId}:`, data);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  clearUserData(userId: string) {
    try {
      const prefix = this.getUserPrefix(userId);
      Object.keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .forEach(key => {
          console.log(`Clearing key: ${key}`);
          localStorage.removeItem(key);
        });
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },

  clearNewUserData() {
    try {
      const currentUser = this.getUser();
      if (currentUser?.id) {
        this.clearUserData(currentUser.id);
      }
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing new user data:', error);
    }
  },

  clearAllUserData() {
    try {
      // Remove todos os dados de usuários anteriores
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('FinanceFlow:')) {
          localStorage.removeItem(key);
        }
      });
      console.log('All user data cleared');
    } catch (error) {
      console.error('Error clearing all user data:', error);
    }
  },

  clearStorage() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};
