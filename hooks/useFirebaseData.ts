import { useState, useEffect } from 'react';
import { 
  Asset,
  Liability,
  Loan,
  Expense,
  SavingsGoal,
  Investment
} from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  increment
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';

// -------------------- ASSETS --------------------
export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setAssets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'assets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const userAssets: Asset[] = [];
        querySnapshot.forEach((doc) => {
          userAssets.push({
            id: doc.id,
            ...doc.data(),
          } as Asset);
        });
        setAssets(userAssets);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to assets:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addAsset = async (assetData: Omit<Asset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'assets'), {
        ...assetData,
        value: Number(assetData.value),
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error adding asset:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateAsset = async (id: string, updatedData: Partial<Omit<Asset, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'assets', id), {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error updating asset:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteAsset = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'assets', id));
    } catch (err: any) {
      console.error('Error deleting asset:', err);
      setError(err.message);
      throw err;
    }
  };

  return { assets, loading, error, addAsset, updateAsset, deleteAsset };
}

// -------------------- LIABILITIES --------------------
export function useLiabilities() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLiabilities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'liabilities'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const userLiabilities: Liability[] = [];
        querySnapshot.forEach((doc) => {
          userLiabilities.push({
            id: doc.id,
            ...doc.data(),
          } as Liability);
        });
        setLiabilities(userLiabilities);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to liabilities:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addLiability = async (liabilityData: Omit<Liability, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'liabilities'), {
        ...liabilityData,
        amount: Number(liabilityData.amount),
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error adding liability:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateLiability = async (id: string, updatedData: Partial<Omit<Liability, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'liabilities', id), {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error updating liability:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteLiability = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'liabilities', id));
    } catch (err: any) {
      console.error('Error deleting liability:', err);
      setError(err.message);
      throw err;
    }
  };

  return { liabilities, loading, error, addLiability, updateLiability, deleteLiability };
}

// -------------------- LOANS --------------------
// -------------------- LOANS --------------------
export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoans([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'loans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const userLoans: Loan[] = [];
        querySnapshot.forEach((doc) => {
          userLoans.push({
            id: doc.id,
            ...doc.data(),
          } as Loan);
        });
        setLoans(userLoans);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to loans:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addLoan = async (
    loanData: Omit<Loan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;

    try {
      const payload = {
        ...loanData,
        amount: Number(loanData.amount),
        interestRate: Number(loanData.interestRate),
        startDate:
          loanData.startDate instanceof Date
            ? loanData.startDate
            : new Date(loanData.startDate),
        endDate: loanData.endDate
          ? loanData.endDate instanceof Date
            ? loanData.endDate
            : new Date(loanData.endDate)
          : null,
        lender: loanData.lender || '',
        status: loanData.status || '',
        notes: loanData.notes || '',
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('Loan payload:', payload);

      await addDoc(collection(db, 'loans'), payload);
    } catch (err: any) {
      console.error('Full loan error:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateLoan = async (
    id: string,
    updatedData: Partial<Omit<Loan, 'id' | 'userId' | 'createdAt'>>
  ) => {
    if (!user) return;

    try {
      const payload = {
        ...updatedData,
        amount:
          updatedData.amount !== undefined
            ? Number(updatedData.amount)
            : undefined,
        interestRate:
          updatedData.interestRate !== undefined
            ? Number(updatedData.interestRate)
            : undefined,
        startDate:
          updatedData.startDate instanceof Date
            ? updatedData.startDate
            : updatedData.startDate
            ? new Date(updatedData.startDate)
            : undefined,
        endDate:
          updatedData.endDate instanceof Date
            ? updatedData.endDate
            : updatedData.endDate
            ? new Date(updatedData.endDate)
            : undefined,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'loans', id), payload);
    } catch (err: any) {
      console.error('Error updating loan:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteLoan = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'loans', id));
    } catch (err: any) {
      console.error('Error deleting loan:', err);
      setError(err.message);
      throw err;
    }
  };

  return { loans, loading, error, addLoan, updateLoan, deleteLoan };
}


// -------------------- EXPENSES --------------------
export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const userExpenses: Expense[] = [];
        querySnapshot.forEach((doc) => {
          userExpenses.push({
            id: doc.id,
            ...doc.data(),
          } as Expense);
        });
        setExpenses(userExpenses);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to expenses:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        amount: Number(expenseData.amount),
        date: expenseData.date instanceof Date ? expenseData.date : new Date(expenseData.date),
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Full expense error:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateExpense = async (id: string, updatedData: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'expenses', id), {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error updating expense:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      setError(err.message);
      throw err;
    }
  };

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense };
}

// -------------------- SAVINGS GOALS --------------------
export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'savingsGoals'),
      where('userId', '==', user.uid),
      orderBy('targetDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const userGoals: SavingsGoal[] = [];
        querySnapshot.forEach((doc) => {
          userGoals.push({
            id: doc.id,
            ...doc.data(),
          } as SavingsGoal);
        });
        setGoals(userGoals);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to savings goals:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addGoal = async (goalData: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'savingsGoals'), {
        ...goalData,
        targetAmount: Number(goalData.targetAmount),
        currentAmount: Number(goalData.currentAmount || 0),
        targetDate: goalData.targetDate instanceof Date ? goalData.targetDate : new Date(goalData.targetDate),
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Full savings goal error:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateGoal = async (id: string, updatedData: Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'savingsGoals', id), {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error updating savings goal:', err);
      setError(err.message);
      throw err;
    }
  };

  const addContribution = async (goalId: string, amount: number) => {
    if (!user) return;

    try {
      const goalRef = doc(db, 'savingsGoals', goalId);
      await updateDoc(goalRef, {
        currentAmount: increment(Number(amount)),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error adding contribution:', err);
      setError(err.message);
      throw err;
    }
  };

  return { goals, loading, error, addGoal, updateGoal, addContribution };
}

// -------------------- PORTFOLIO SUMMARY --------------------
export function usePortfolioSummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { assets } = useAssets();
  const { liabilities } = useLiabilities();

  useEffect(() => {
    if (!user) {
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const totalAssets = assets.reduce((sum, asset) => sum + (Number(asset.value) || 0), 0);
      const totalLiabilities = liabilities.reduce((sum, liability) => sum + (Number(liability.amount) || 0), 0);

      setSummary({
        netWorth: totalAssets - totalLiabilities,
        totalAssets,
        totalLiabilities,
        lastUpdated: new Date().toISOString()
      });
      setLoading(false);
    } catch (err: any) {
      console.error('Error calculating portfolio summary:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [user, assets, liabilities]);

  return { summary, loading, error };
}

// -------------------- MONTHLY EXPENSES --------------------
export function useMonthlyExpenses(monthIndex?: number) {
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || monthIndex === undefined) {
      setMonthlyExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const expenses: Expense[] = [];
        querySnapshot.forEach((doc) => {
          const expense = {
            id: doc.id,
            ...doc.data(),
          } as Expense;
          
          const expenseMonth = new Date(expense.date).getMonth();
          if (expenseMonth === monthIndex) {
            expenses.push(expense);
          }
        });
        setMonthlyExpenses(expenses);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to monthly expenses:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, monthIndex]);

  return { monthlyExpenses, loading, error };
}
