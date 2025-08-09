import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Types
export interface Asset {
  id?: string;
  userId: string;
  name: string;
  type: string;
  value: number;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Liability {
  id?: string;
  userId: string;
  name: string;
  type: string;
  amount: number;
  dueDate?: string;
  status?: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Loan {
  id?: string;
  userId: string;
  name: string;
  amount: number;
  interestRate: number;
  startDate: string | Date;
  endDate?: string | Date;
  lender?: string;
  status?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Expense {
  id?: string;
  userId: string;
  category: string;
  amount: number;
  description?: string;
  date: string | Date;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Income {
  id?: string;
  userId: string;
  source: string;
  amount: number;
  description?: string;
  date: string | Date;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SavingsGoal {
  id?: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | Date;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Investment {
  id?: string;
  userId: string;
  name: string;
  type: string;
  value: number;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Helper function to get current user ID
const getCurrentUserId = (): string => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

// Generic CRUD operations
class FirestoreService<T extends DocumentData> {
  constructor(private collectionName: string) {}

  async create(data: Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = getCurrentUserId();
    const docData = {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as T;

    const docRef = await addDoc(collection(db, this.collectionName), docData);
    return docRef.id;
  }

  async getAll(): Promise<T[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}

// Service instances
export const assetsService = new FirestoreService<Asset>('assets');
export const liabilitiesService = new FirestoreService<Liability>('liabilities');
export const loansService = new FirestoreService<Loan>('loans');
export const expensesService = new FirestoreService<Expense>('expenses');
export const incomeService = new FirestoreService<Income>('income');
export const savingsGoalsService = new FirestoreService<SavingsGoal>('savingsGoals');
export const investmentsService = new FirestoreService<Investment>('investments');

// Specialized functions
export const dataService = {
  // Get monthly expenses
  async getMonthlyExpenses(year: number, month: number): Promise<Expense[]> {
    const userId = getCurrentUserId();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Expense));
  },

  // Get monthly income
  async getMonthlyIncome(year: number, month: number): Promise<Income[]> {
    const userId = getCurrentUserId();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const q = query(
      collection(db, 'income'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Income));
  },

  // Add contribution to savings goal
  async addSavingsContribution(goalId: string, amount: number): Promise<void> {
    const docRef = doc(db, 'savingsGoals', goalId);
    await updateDoc(docRef, {
      currentAmount: increment(amount),
      updatedAt: serverTimestamp(),
    });
  },

  // Get financial summary
  async getFinancialSummary() {
    const userId = getCurrentUserId();
    
    const [assets, liabilities, income, expenses] = await Promise.all([
      assetsService.getAll(),
      liabilitiesService.getAll(),
      incomeService.getAll(),
      expensesService.getAll(),
    ]);

    const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.amount || 0), 0);
    const totalIncome = income.reduce((sum, inc) => sum + (inc.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    return {
      netWorth: totalAssets - totalLiabilities,
      totalAssets,
      totalLiabilities,
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      lastUpdated: new Date().toISOString()
    };
  },

  // Get active loans
  async getActiveLoans(): Promise<Loan[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'loans'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Loan));
  },

  // Get active savings goals
  async getActiveSavingsGoals(): Promise<SavingsGoal[]> {
    const userId = getCurrentUserId();
    const today = new Date();
    
    const q = query(
      collection(db, 'savingsGoals'),
      where('userId', '==', userId),
      where('targetDate', '>=', today),
      orderBy('targetDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SavingsGoal));
  }
};