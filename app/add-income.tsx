import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Check,
  Plus,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useIncome } from '../hooks/useFirebaseData'; // Adjust the import path as necessary

const incomeCategories = [
  { id: 'salary', name: 'Salary', icon: '💰', color: '#10B981' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3B82F6' },
  { id: 'investment', name: 'Investment', icon: '📈', color: '#8B5CF6' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: '#F59E0B' },
  { id: 'bonus', name: 'Bonus', icon: '🎯', color: '#10B981' },
  { id: 'rental', name: 'Rental', icon: '🏠', color: '#3B82F6' },
  { id: 'business', name: 'Business', icon: '💼', color: '#8B5CF6' },
  { id: 'other', name: 'Other', icon: '📝', color: '#6B7280' },
];

export default function AddIncomeScreen() {
  const router = useRouter();
  const { addIncome } = useIncome(); // Changed from useExpenses to useFinances
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const scaleValue = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
    });
  };

  const handleSave = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await addIncome({
        category: selectedCategory,
        amount: parseFloat(amount),
        description: description || '',
        date,
      });
      
      Alert.alert(
        'Success',
        `Income of ₹${amount} added successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Income</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionLabel}>Income Category</Text>
          <View style={styles.categoriesGrid}>
            {incomeCategories.map((category) => (
              <Animated.View 
                key={category.id} 
                style={[animatedButtonStyle, styles.categoryItemWrapper]}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.id && styles.categoryItemSelected,
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color },
                      selectedCategory === category.id && styles.categoryIconSelected,
                    ]}>
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                    {selectedCategory === category.id && (
                      <View style={styles.checkOverlay}>
                        <Check size={16} color="#ffffff" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      selectedCategory === category.id && styles.categoryNameSelected,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {category.name}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionLabel}>Description</Text>
          <View style={styles.descriptionInputContainer}>
            <FileText size={20} color="#64748b" strokeWidth={2} />
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a note (optional)"
              placeholderTextColor="#94a3b8"
              multiline
            />
          </View>
        </View>

        {/* Date */}
        <View style={styles.dateContainer}>
          <Text style={styles.sectionLabel}>Date</Text>
          <View style={styles.dateInputContainer}>
            <Calendar size={20} color="#64748b" strokeWidth={2} />
            <TextInput
              style={styles.dateInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.9}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButton}>
              <Plus size={24} color="#ffffff" strokeWidth={2} />
              <Text style={styles.saveButtonText}>Add Income</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  amountContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
  },
  rupeeSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
    paddingVertical: 0,
    height: 40,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  categoryItemWrapper: {
    width: '48%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  categoryItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  categoryItemSelected: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  categoryIconSelected: {
    transform: [{ scale: 1.1 }],
  },
  categoryEmoji: {
    fontSize: 24,
  },
  checkOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    width: '100%',
  },
  categoryNameSelected: {
    color: '#10B981',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    minHeight: 60,
  },
  descriptionInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    paddingVertical: 0,
    textAlignVertical: 'center',
    maxHeight: 100,
  },
  dateContainer: {
    marginBottom: 24,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  saveButtonContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
});