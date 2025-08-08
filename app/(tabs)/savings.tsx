import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  PiggyBank, 
  Target, 
  Coins, 
  CreditCard, 
  Building2, 
  Plus
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSavingsGoals } from '../../hooks/useFirebaseData';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  color: string;
  icon: string;
}

interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  type: 'savings' | 'fixed_deposit' | 'recurring';
  color: string;
}

export default function SavingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { goals, loading: goalsLoading } = useSavingsGoals();

  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'goals' | 'accounts'>('overview');
  const scaleValue = useSharedValue(1);

  // ✅ Fetch user-specific savings accounts
  const fetchSavings = async () => {
    if (!user?.uid) {
      setSavingsAccounts([]);
      setLoadingAccounts(false);
      return;
    }
    try {
      const q = query(collection(db, 'savingsAccounts'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SavingsAccount[];

      setSavingsAccounts(data);
    } catch (error) {
      console.error('Error fetching savings accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // ✅ Refresh on navigation focus
  useFocusEffect(
    React.useCallback(() => {
      setLoadingAccounts(true);
      fetchSavings();
    }, [user])
  );

  const totalSavings = savingsAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalGoalsTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalGoalsCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const goalsProgress = totalGoalsTarget > 0 ? (totalGoalsCurrent / totalGoalsTarget) * 100 : 0;

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handleCardPress = () => {
    scaleValue.value = withSpring(0.95, { duration: 100 }, () => {
      scaleValue.value = withSpring(1);
    });
  };

  const getGoalIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      emergency: '🚨', travel: '✈️', vehicle: '🚗', home: '🏠',
      education: '🎓', wedding: '💒', gadgets: '📱', other: '🎯'
    };
    return icons[category] || '🎯';
  };

  const renderOverviewCard = () => (
    <Animated.View style={[animatedCardStyle]}>
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewLabel}>Total Savings</Text>
            <View style={styles.savingsIcon}>
              <PiggyBank size={24} color="#ffffff" strokeWidth={2} />
            </View>
          </View>
          <Text style={styles.overviewAmount}>
            {totalSavings > 0
              ? `₹${totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : '-'}
          </Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatLabel}>Monthly Growth</Text>
              <Text style={styles.overviewStatValue}>+₹0</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatLabel}>Interest Earned</Text>
              <Text style={styles.overviewStatValue}>+₹0</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderGoalCard = (goal: SavingsGoal) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const remaining = goal.targetAmount - goal.currentAmount;
    const color = '#3B82F6';

    return (
      <TouchableOpacity key={goal.id} style={styles.goalCard} activeOpacity={0.7}>
        <View style={styles.goalHeader}>
          <View style={[styles.goalIcon, { backgroundColor: color }]}>
            <Text style={styles.goalEmoji}>{getGoalIcon(goal.category)}</Text>
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.goalCategory}>{goal.category}</Text>
          </View>
          <View style={styles.goalProgress}>
            <Text style={styles.goalProgressText}>{Math.round(progress)}%</Text>
          </View>
        </View>
        
        <View style={styles.goalAmounts}>
          <Text style={styles.goalCurrent}>
            ₹{goal.currentAmount.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.goalTarget}>
            of ₹{goal.targetAmount.toLocaleString('en-IN')}
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progress, 100)}%`, backgroundColor: color }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.goalFooter}>
          <Text style={styles.goalRemaining}>
            ₹{remaining.toLocaleString('en-IN')} remaining
          </Text>
          <Text style={styles.goalDeadline}>
            Due: {new Date(goal.deadline).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAccountCard = (account: SavingsAccount) => {
    const getAccountIcon = () => {
      switch (account.type) {
        case 'savings': return <Coins size={24} color="#ffffff" strokeWidth={2} />;
        case 'fixed_deposit': return <Building2 size={24} color="#ffffff" strokeWidth={2} />;
        case 'recurring': return <CreditCard size={24} color="#ffffff" strokeWidth={2} />;
        default: return <Coins size={24} color="#ffffff" strokeWidth={2} />;
      }
    };

    const getAccountType = () => {
      switch (account.type) {
        case 'savings': return 'Savings Account';
        case 'fixed_deposit': return 'Fixed Deposit';
        case 'recurring': return 'Recurring Deposit';
        default: return 'Account';
      }
    };

    return (
      <TouchableOpacity key={account.id} style={styles.accountCard} activeOpacity={0.7}>
        <LinearGradient
          colors={[account.color || '#3B82F6', (account.color || '#3B82F6') + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.accountGradient}>
          <View style={styles.accountHeader}>
            <View style={styles.accountIconContainer}>
              {getAccountIcon()}
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountType}>{getAccountType()}</Text>
            </View>
            <View style={styles.accountRate}>
              <Text style={styles.accountRateText}>{account.interestRate}%</Text>
              <Text style={styles.accountRateLabel}>APY</Text>
            </View>
          </View>
          
          <Text style={styles.accountBalance}>
            ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          
          <View style={styles.accountFooter}>
            <Text style={styles.accountEarnings}>
              Monthly: +₹{((account.balance * account.interestRate) / 100 / 12).toFixed(0)}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-savings')}>
              <Plus size={20} color="#3B82F6" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderGoalsProgress = () => (
    <View style={styles.goalsProgressCard}>
      <View style={styles.goalsProgressHeader}>
        <Target size={24} color="#3B82F6" strokeWidth={2} />
        <Text style={styles.goalsProgressTitle}>Goals Progress</Text>
      </View>
      <Text style={styles.goalsProgressAmount}>
        {totalGoalsTarget > 0
          ? `₹${totalGoalsCurrent.toLocaleString('en-IN')} / ₹${totalGoalsTarget.toLocaleString('en-IN')}`
          : '-'}
      </Text>
      <View style={styles.goalsProgressBarContainer}>
        <View style={styles.goalsProgressBar}>
          <View 
            style={[
              styles.goalsProgressBarFill,
              { width: `${Math.min(goalsProgress, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.goalsProgressPercent}>{Math.round(goalsProgress)}%</Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <View>
            {renderOverviewCard()}
            {renderGoalsProgress()}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => router.push('/add-savings')}>
                  <PiggyBank size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.actionButtonText}>Add Savings</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                  onPress={() => router.push('/new-goal')}>
                  <Target size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.actionButtonText}>New Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 'goals':
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Savings Goals</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/new-goal')}>
                <Plus size={20} color="#3B82F6" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {goals.length > 0 ? goals.map(renderGoalCard) : <Text>No Goals Yet</Text>}
          </View>
        );
      case 'accounts':
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Savings Accounts</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/add-savings')}>
                <Plus size={20} color="#3B82F6" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {savingsAccounts.length > 0
              ? savingsAccounts.map(renderAccountCard)
              : <Text>No Savings Accounts Yet</Text>}
          </View>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return <View style={styles.container}><Text>Login to view savings.</Text></View>;
  }

  if (loadingAccounts || goalsLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#3B82F6" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Savings & Goals</Text>
        <Text style={styles.subtitle}>Build your financial future</Text>
      </View>

      <View style={styles.tabSelector}>
        {(['overview', 'goals', 'accounts'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab)}>
            <Text
              style={[
                styles.tabButtonText,
                selectedTab === tab && styles.tabButtonTextActive,
              ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#64748b', fontWeight: '500' },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabButtonActive: { backgroundColor: '#3B82F6' },
  tabButtonText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  tabButtonTextActive: { color: '#ffffff' },
  content: { flex: 1, paddingHorizontal: 20 },
  overviewCard: {
    borderRadius: 20, padding: 24, marginBottom: 24,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12,
  },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  overviewLabel: { fontSize: 16, color: '#ffffff', opacity: 0.8, fontWeight: '500' },
  savingsIcon: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 8 },
  overviewAmount: { fontSize: 36, fontWeight: '800', color: '#ffffff', marginBottom: 20 },
  overviewStats: { flexDirection: 'row', justifyContent: 'space-between' },
  overviewStat: { flex: 1 },
  overviewStatLabel: { fontSize: 12, color: '#ffffff', opacity: 0.7, marginBottom: 4 },
  overviewStatValue: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  goalsProgressCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 20, marginBottom: 24,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8,
  },
  goalsProgressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  goalsProgressTitle: { marginLeft: 8, fontSize: 16, fontWeight: '700', color: '#1e293b' },
  goalsProgressAmount: { fontSize: 20, fontWeight: '700', color: '#3B82F6', marginBottom: 12 },
  goalsProgressBarContainer: { flexDirection: 'row', alignItems: 'center' },
  goalsProgressBar: { flex: 1, height: 8, backgroundColor: '#e2e8f0', borderRadius: 4 },
  goalsProgressBarFill: { height: 8, backgroundColor: '#3B82F6', borderRadius: 4 },
  goalsProgressPercent: { marginLeft: 8, fontSize: 12, fontWeight: '600', color: '#64748b' },
  quickActions: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  actionButtons: { flexDirection: 'row' },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12, marginRight: 12,
  },
  actionButtonText: { color: '#ffffff', fontWeight: '600', marginLeft: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addButton: {
    backgroundColor: '#e0f2fe', padding: 8, borderRadius: 8,
  },
  goalCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  goalIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  goalEmoji: { fontSize: 20 },
  goalInfo: { flex: 1, marginLeft: 12 },
  goalName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  goalCategory: { fontSize: 12, color: '#64748b' },
  goalProgress: { backgroundColor: '#e0f2fe', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  goalProgressText: { fontSize: 12, fontWeight: '700', color: '#3B82F6' },
  goalAmounts: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  goalCurrent: { fontSize: 18, fontWeight: '700', color: '#3B82F6' },
  goalTarget: { fontSize: 14, color: '#64748b', marginLeft: 4 },
  progressBarContainer: { marginBottom: 8 },
  progressBarBackground: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 },
  progressBarFill: { height: 6, borderRadius: 3 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  goalRemaining: { fontSize: 12, color: '#64748b' },
  goalDeadline: { fontSize: 12, color: '#64748b' },
  accountCard: {
    borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  accountGradient: { padding: 16 },
  accountHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  accountIconContainer: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  accountInfo: { flex: 1, marginLeft: 12 },
  accountName: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  accountType: { fontSize: 12, color: '#e0f2fe' },
  accountRate: { alignItems: 'flex-end' },
  accountRateText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  accountRateLabel: { fontSize: 12, color: '#e0f2fe' },
  accountBalance: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  accountFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accountEarnings: { fontSize: 12, color: '#e0f2fe' },
  spacer: { height: 60 },
});
