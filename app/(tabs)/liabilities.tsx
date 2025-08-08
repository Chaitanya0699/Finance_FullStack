import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TriangleAlert as AlertTriangle, 
  Plus, 
  Clock, 
  CreditCard, 
  Receipt, 
  ArrowRight,
  Chrome as Home,
  Car,
  User,
  TrendingDown,
  CircleCheck as CheckCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useLiabilities, useLoans } from '../../hooks/useFirebaseData';
import { useAuth } from '../../contexts/AuthContext';

export default function LiabilitiesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // ✅ Hooks must always be called
  const { liabilities = [], loading: liabilitiesLoading } = useLiabilities();
  const { loans = [], loading: loansLoading } = useLoans();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'loans' | 'liabilities'>('overview');
  const scaleValue = useSharedValue(1);

  // ✅ Show "-" if no user or empty data
  const totalLoans = user && loans.length > 0 ? loans.reduce((sum, loan) => sum + (loan.totalAmount || 0), 0) : 0;
  const totalEMI = user && loans.length > 0 ? loans.reduce((sum, loan) => sum + (loan.emiAmount || 0), 0) : 0;
  const totalLiabilitiesAmount = user && liabilities.length > 0 ? liabilities.reduce((sum, l) => sum + (l.amount || 0), 0) : 0;
  const unpaidLiabilities = user && liabilities.length > 0 ? liabilities.filter(l => l.status === 'unpaid').reduce((sum, l) => sum + (l.amount || 0), 0) : 0;
  const totalDebt = totalLoans + totalLiabilitiesAmount;

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handleCardPress = () => {
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
    });
  };

  const getLoanIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home size={20} color="#ffffff" />;
      case 'vehicle': return <Car size={20} color="#ffffff" />;
      case 'personal': return <User size={20} color="#ffffff" />;
      default: return <CreditCard size={20} color="#ffffff" />;
    }
  };

  const getLiabilityIcon = (type: string) => {
    switch (type) {
      case 'credit_card': return <CreditCard size={20} color="#ffffff" />;
      case 'bill': return <Receipt size={20} color="#ffffff" />;
      case 'debt': return <AlertTriangle size={20} color="#ffffff" />;
      default: return <Receipt size={20} color="#ffffff" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} color="#10B981" />;
      case 'unpaid': return <Clock size={16} color="#F59E0B" />;
      case 'overdue': return <AlertTriangle size={16} color="#EF4444" />;
      default: return <Clock size={16} color="#64748B" />;
    }
  };

  const renderTabSelector = () => (
    <View style={styles.tabSelector}>
      {(['overview', 'loans', 'liabilities'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
          onPress={() => setSelectedTab(tab)}>
          <Text style={[styles.tabButtonText, selectedTab === tab && styles.tabButtonTextActive]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDebtSummaryCard = () => (
    <Animated.View style={[animatedCardStyle]}>
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Total Debt</Text>
            <View style={styles.summaryIcon}>
              <TrendingDown size={24} color="#ffffff" />
            </View>
          </View>
          <Text style={styles.summaryAmount}>
            {totalDebt > 0 ? `₹${totalDebt.toLocaleString('en-IN')}` : '-'}
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Monthly EMI</Text>
              <Text style={styles.summaryStatValue}>
                {totalEMI > 0 ? `₹${totalEMI.toLocaleString('en-IN')}` : '-'}
              </Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Unpaid Bills</Text>
              <Text style={styles.summaryStatValue}>
                {unpaidLiabilities > 0 ? `₹${unpaidLiabilities.toLocaleString('en-IN')}` : '-'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderLoanCard = (loan: any) => {
    const progress = loan.duration ? (loan.monthsPaid / loan.duration) * 100 : 0;
    return (
      <TouchableOpacity key={loan.id} style={styles.itemCard} activeOpacity={0.7}>
        <View style={styles.itemHeader}>
          <View style={[styles.itemIcon, { backgroundColor: loan.color || '#3B82F6' }]}>
            {getLoanIcon(loan.type)}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{loan.name}</Text>
            <Text style={styles.itemSubtitle}>EMI: ₹{loan.emi?.toLocaleString('en-IN') || '-'}</Text>
          </View>
          <ArrowRight size={16} color="#94a3b8" />
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemValue}>₹{loan.outstanding?.toLocaleString('en-IN') || '-'}</Text>
          <Text style={styles.itemProgress}>{loan.monthsPaid || 0}/{loan.duration || 0} months</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: loan.color || '#3B82F6' }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% paid</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLiabilityCard = (liability: any) => {
    const dueDate = new Date(liability.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return (
      <TouchableOpacity key={liability.id} style={styles.itemCard} activeOpacity={0.7}>
        <View style={styles.itemHeader}>
          <View style={[styles.itemIcon, { backgroundColor: liability.color || '#F59E0B' }]}>
            {getLiabilityIcon(liability.type)}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{liability.name}</Text>
            <Text style={styles.itemSubtitle}>Due: {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
          </View>
          {getStatusIcon(liability.status)}
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemValue}>₹{liability.amount?.toLocaleString('en-IN') || '-'}</Text>
          <Text style={[styles.itemDays, { color: daysUntilDue < 0 ? '#EF4444' : daysUntilDue <= 3 ? '#F59E0B' : '#64748b' }]}>
            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
              daysUntilDue === 0 ? 'Due today' :
                `${daysUntilDue} days left`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <View>
            {renderDebtSummaryCard()}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#EF4444' }]} onPress={() => router.push('/add-loan')}>
                  <Plus size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Add Loan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F59E0B' }]} onPress={() => router.push('/add-liability')}>
                  <Plus size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Add Bill</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 'loans':
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Loans</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-loan')}>
                <Plus size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>
              Total Outstanding: {totalLoans > 0 ? `₹${totalLoans.toLocaleString('en-IN')}` : '-'}
            </Text>
            {loans.length > 0 ? loans.map(renderLoanCard) : <Text style={{ color: '#64748b' }}>No loans added yet</Text>}
          </View>
        );
      case 'liabilities':
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bills & Liabilities</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-liability')}>
                <Plus size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>
              Total Amount: {totalLiabilitiesAmount > 0 ? `₹${totalLiabilitiesAmount.toLocaleString('en-IN')}` : '-'}
            </Text>
            {liabilities.length > 0 ? liabilities.map(renderLiabilityCard) : <Text style={{ color: '#64748b' }}>No bills added yet</Text>}
          </View>
        );
      default:
        return null;
    }
  };

  if (liabilitiesLoading || loansLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loans & Liabilities</Text>
        <Text style={styles.subtitle}>Manage your debt portfolio</Text>
      </View>

      {renderTabSelector()}

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
  tabSelector: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#ffffff', borderRadius: 16, padding: 4, marginBottom: 24 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabButtonActive: { backgroundColor: '#3B82F6' },
  tabButtonText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  tabButtonTextActive: { color: '#ffffff' },
  content: { flex: 1, paddingHorizontal: 20 },
  summaryCard: { borderRadius: 20, padding: 24, marginBottom: 24 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 16, color: '#ffffff', opacity: 0.8 },
  summaryIcon: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 8 },
  summaryAmount: { fontSize: 36, fontWeight: '800', color: '#ffffff', marginBottom: 20 },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryStatItem: { flex: 1 },
  summaryStatLabel: { fontSize: 12, color: '#ffffff', opacity: 0.7, marginBottom: 4 },
  summaryStatValue: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  sectionSubtitle: { fontSize: 16, color: '#64748b', marginBottom: 16 },
  addButton: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 8 },
  itemCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  itemIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  itemSubtitle: { fontSize: 14, color: '#64748b' },
  itemDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemValue: { fontSize: 20, fontWeight: '700', color: '#EF4444' },
  itemProgress: { fontSize: 14, color: '#64748b' },
  itemDays: { fontSize: 14, fontWeight: '600' },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginRight: 12 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  quickActions: { marginBottom: 24 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#ffffff', marginLeft: 8 },
  spacer: { height: 40 },
});
