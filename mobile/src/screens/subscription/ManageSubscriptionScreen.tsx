import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import StripePaymentService from '../../services/payments/stripe';
import FeatureGateService from '../../services/payments/featureFlags';
import { 
  Subscription, 
  Payment, 
  Invoice, 
  UsageStats,
  PaymentMethod 
} from '../../types/payments';
import { SUBSCRIPTION_PLANS, CURRENCY } from '../../constants/subscriptions';
import Animated, { FadeInUp } from 'react-native-reanimated';

const ManageSubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      const [sub, pay, inv, methods] = await Promise.all([
        StripePaymentService.getSubscriptionStatus(),
        StripePaymentService.getPaymentHistory(),
        StripePaymentService.getInvoices(),
        StripePaymentService.getPaymentMethods(),
      ]);

      setSubscription(sub);
      setPayments(pay);
      setInvoices(inv);
      setPaymentMethods(methods);

      // Load usage stats
      if (sub) {
        await loadUsageStats();
        
        // Get trial days if in trial
        if (sub.status === 'trialing') {
          const days = await FeatureGateService.getTrialDaysRemaining();
          setTrialDaysRemaining(days);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const [workouts, aiChats] = await Promise.all([
        FeatureGateService.checkUsageLimit('workouts'),
        FeatureGateService.checkUsageLimit('aiChats'),
      ]);

      setUsageStats({
        workoutsThisWeek: workouts.used,
        workoutsLimit: workouts.limit,
        aiChatsToday: aiChats.used,
        aiChatsLimit: aiChats.limit,
        storageUsedMB: 125, // Mock data
        storageLimitMB: 1000,
        featuresUsed: ['Workout Tracking', 'AI Coach', 'Nutrition'],
      });
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const handleUpgrade = () => {
    navigation.navigate('Paywall' as never);
  };

  const handleDowngrade = async () => {
    Alert.alert(
      'Downgrade Plan',
      'Are you sure you want to downgrade? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Downgrade',
          style: 'destructive',
          onPress: async () => {
            // Implementation for downgrade
            Alert.alert('Success', 'Your plan will be downgraded at the end of the billing period');
          },
        },
      ]
    );
  };

  const handleCancelSubscription = async () => {
    if (!cancelReason) {
      Alert.alert('Please select a reason', 'Help us improve by telling us why you\'re leaving');
      return;
    }

    setIsLoading(true);
    try {
      const success = await StripePaymentService.cancelSubscription(cancelReason, cancelFeedback);
      if (success) {
        Alert.alert(
          'Subscription Canceled',
          'Your subscription has been canceled. You\'ll continue to have access until the end of your billing period.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while canceling your subscription.');
    } finally {
      setIsLoading(false);
      setShowCancelModal(false);
    }
  };

  const handlePauseSubscription = async () => {
    Alert.alert(
      'Pause Subscription',
      'Pause your subscription for up to 3 months. Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause',
          onPress: async () => {
            const success = await StripePaymentService.pauseSubscription();
            if (success) {
              Alert.alert('Success', 'Your subscription has been paused');
              loadSubscriptionData();
            }
          },
        },
      ]
    );
  };

  const handleUpdatePaymentMethod = async () => {
    setIsLoading(true);
    try {
      const success = await StripePaymentService.updatePaymentMethod();
      if (success) {
        Alert.alert('Success', 'Payment method updated successfully');
        loadSubscriptionData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlanOverview = () => {
    if (!subscription) return null;

    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === subscription.tier.toLowerCase());
    const nextBillingDate = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;

    return (
      <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
        <LinearGradient
          colors={subscription.tier === 'Elite' ? ['#FFD700', '#FFA500'] : ['#7C3AED', '#9333EA']}
          style={styles.planCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planTier}>{subscription.tier} Plan</Text>
              <Text style={styles.planStatus}>
                {subscription.status === 'trialing' 
                  ? `Trial ends in ${trialDaysRemaining} days`
                  : subscription.status === 'active' 
                  ? 'Active'
                  : subscription.status}
              </Text>
            </View>
            <View style={styles.planPrice}>
              <Text style={styles.priceAmount}>
                {CURRENCY.USD}{plan?.price || 0}
              </Text>
              <Text style={styles.pricePeriod}>/{plan?.interval || 'month'}</Text>
            </View>
          </View>

          {nextBillingDate && subscription.status === 'active' && (
            <View style={styles.billingInfo}>
              <Ionicons name="calendar-outline" size={16} color="white" />
              <Text style={styles.billingText}>
                Next billing: {nextBillingDate.toLocaleDateString()}
              </Text>
            </View>
          )}

          {subscription.cancelAtPeriodEnd && (
            <View style={styles.cancelNotice}>
              <Ionicons name="information-circle" size={16} color="#FEF3C7" />
              <Text style={styles.cancelText}>
                Subscription ends on {nextBillingDate?.toLocaleDateString()}
              </Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.quickActions}>
          {subscription.tier !== 'Elite' && (
            <TouchableOpacity style={styles.actionButton} onPress={handleUpgrade}>
              <Ionicons name="rocket" size={20} color="#7C3AED" />
              <Text style={styles.actionText}>Upgrade</Text>
            </TouchableOpacity>
          )}
          
          {subscription.tier !== 'Free' && !subscription.cancelAtPeriodEnd && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handlePauseSubscription}>
                <Ionicons name="pause" size={20} color="#6B7280" />
                <Text style={styles.actionText}>Pause</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowCancelModal(true)}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderUsageStats = () => {
    if (!usageStats) return null;

    return (
      <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
        <Text style={styles.sectionTitle}>Usage This Period</Text>
        
        <View style={styles.usageCard}>
          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageLabel}>Workouts</Text>
              <Text style={styles.usageCount}>
                {usageStats.workoutsThisWeek}
                {usageStats.workoutsLimit !== Infinity && ` / ${usageStats.workoutsLimit}`}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min((usageStats.workoutsThisWeek / (usageStats.workoutsLimit || 1)) * 100, 100)}%`,
                    backgroundColor: usageStats.workoutsThisWeek >= (usageStats.workoutsLimit || Infinity) ? '#EF4444' : '#10B981'
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageLabel}>AI Chats Today</Text>
              <Text style={styles.usageCount}>
                {usageStats.aiChatsToday}
                {usageStats.aiChatsLimit !== Infinity && ` / ${usageStats.aiChatsLimit}`}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min((usageStats.aiChatsToday / (usageStats.aiChatsLimit || 1)) * 100, 100)}%`,
                    backgroundColor: usageStats.aiChatsToday >= (usageStats.aiChatsLimit || Infinity) ? '#EF4444' : '#10B981'
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageLabel}>Storage</Text>
              <Text style={styles.usageCount}>
                {usageStats.storageUsedMB} / {usageStats.storageLimitMB} MB
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${(usageStats.storageUsedMB / usageStats.storageLimitMB) * 100}%`,
                    backgroundColor: '#7C3AED'
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderPaymentMethods = () => {
    if (!paymentMethods.length) return null;

    return (
      <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <TouchableOpacity onPress={handleUpdatePaymentMethod}>
            <Ionicons name="add-circle" size={24} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodInfo}>
              <Ionicons 
                name={method.type === 'card' ? 'card' : 'phone-portrait'} 
                size={24} 
                color="#6B7280" 
              />
              <View style={styles.paymentMethodDetails}>
                <Text style={styles.paymentMethodType}>
                  {method.brand} •••• {method.last4}
                </Text>
                <Text style={styles.paymentMethodExpiry}>
                  Expires {method.expiryMonth}/{method.expiryYear}
                </Text>
              </View>
            </View>
            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    );
  };

  const renderBillingHistory = () => {
    if (!payments.length) return null;

    return (
      <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Billing History</Text>
        
        {payments.slice(0, 5).map((payment) => (
          <TouchableOpacity key={payment.id} style={styles.billingItem}>
            <View style={styles.billingItemLeft}>
              <Text style={styles.billingDate}>
                {new Date(payment.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.billingDescription}>
                {payment.description || 'Subscription payment'}
              </Text>
            </View>
            <View style={styles.billingItemRight}>
              <Text style={[
                styles.billingAmount,
                { color: payment.status === 'succeeded' ? '#10B981' : '#EF4444' }
              ]}>
                {CURRENCY.USD}{payment.amount}
              </Text>
              <Text style={styles.billingStatus}>{payment.status}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Invoices</Text>
          <Ionicons name="arrow-forward" size={16} color="#7C3AED" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCancellationModal = () => (
    <Modal
      visible={showCancelModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCancelModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>We're sorry to see you go</Text>
          <Text style={styles.modalSubtitle}>
            Help us improve by telling us why you're leaving
          </Text>

          {['Too expensive', 'Not using it enough', 'Found alternative', 'Technical issues', 'Other'].map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonOption,
                cancelReason === reason && styles.reasonOptionSelected
              ]}
              onPress={() => setCancelReason(reason)}
            >
              <Text style={[
                styles.reasonText,
                cancelReason === reason && styles.reasonTextSelected
              ]}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.feedbackInput}
            placeholder="Additional feedback (optional)"
            value={cancelFeedback}
            onChangeText={setCancelFeedback}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCancelModal(false)}
            >
              <Text style={styles.modalButtonText}>Keep Subscription</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCancelSubscription}
            >
              <Text style={[styles.modalButtonText, { color: 'white' }]}>
                Cancel Subscription
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderPlanOverview()}
        {renderUsageStats()}
        {renderPaymentMethods()}
        {renderBillingHistory()}
      </ScrollView>

      {renderCancellationModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planTier: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  planStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  pricePeriod: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  billingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  billingText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
  cancelNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(254, 243, 199, 0.2)',
    padding: 10,
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#FEF3C7',
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
  },
  usageCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
  },
  usageItem: {
    marginBottom: 15,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  usageCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  paymentMethodExpiry: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  billingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  billingItemLeft: {
    flex: 1,
  },
  billingDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  billingDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  billingItemRight: {
    alignItems: 'flex-end',
  },
  billingAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  billingStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  reasonOption: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  reasonOptionSelected: {
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  reasonText: {
    fontSize: 14,
    color: '#1F2937',
  },
  reasonTextSelected: {
    color: '#7C3AED',
    fontWeight: '500',
  },
  feedbackInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#F3F4F6',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default ManageSubscriptionScreen;