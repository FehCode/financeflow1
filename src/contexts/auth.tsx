import { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { db } from '../services/database';

// Atualize a interface User para corresponder ao StoredUser
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string; // Removido opcional
  lastLogin: string; // Removido opcional
}

interface AuthContextData {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedUser = StorageService.getUser();
      if (storedUser) {
        console.log('Loaded user:', storedUser);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsInitialized(true);
    }
  }

  function generateUserId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async function signIn(email: string, password: string) {
    const user = await db.getUserByEmail(email);
    if (user) {
      const now = new Date().toISOString();
      const updatedUser = { ...user, lastLogin: now };
      await db.saveUser(updatedUser);
      setUser(updatedUser);
    } else {
      throw new Error('Usuário não encontrado');
    }
  }

  async function signUp(name: string, email: string, password: string) {
    const now = new Date().toISOString();
    const userData: User = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: now,
      lastLogin: now
    };
    
    await db.saveUser(userData);
    setUser(userData);
  }

  function signOut() {
    setUser(null);
  }

  if (!isInitialized) {
    return null; // ou um componente de loading
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
