import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface PaymentMethod {
  id: string;
  type: 'card' | 'apple-pay' | 'google-pay';
  name: string;
  last4?: string;
  expiry?: string;
  isDefault: boolean;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'Visa ending in 4242',
    last4: '4242',
    expiry: '12/25',
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    name: 'Mastercard ending in 8888',
    last4: '8888',
    expiry: '08/26',
    isDefault: false,
  },
];

export const PaymentMethodScreen: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleAddCard = () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      name: `${cardholderName} ending in ${cardNumber.slice(-4)}`,
      last4: cardNumber.slice(-4),
      expiry: expiryDate,
      isDefault: false,
    };

    setPaymentMethods([...paymentMethods, newCard]);
    setIsAddingCard(false);
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
  };

  const handleDeleteMethod = (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter(method => method.id !== id));
          },
        },
      ]
    );
  };

  const handleApplePay = () => {
    // Handle Apple Pay logic
    Alert.alert('Apple Pay', 'Apple Pay integration would go here');
  };

  const handleGooglePay = () => {
    // Handle Google Pay logic
    Alert.alert('Google Pay', 'Google Pay integration would go here');
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payment Methods</Text>
        <Text style={styles.subtitle}>
          Manage your payment options for seamless subscriptions
        </Text>
      </View>

      {/* Digital Wallets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Digital Wallets</Text>
        <View style={styles.digitalWalletsContainer}>
          <TouchableOpacity style={styles.applePayButton} onPress={handleApplePay}>
            <LinearGradient
              colors={['#000000', '#1D1D1F']}
              style={styles.applePayGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
              <Text style={styles.applePayText}>Apple Pay</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.googlePayButton} onPress={handleGooglePay}>
            <LinearGradient
              colors={['#4285F4', '#34A853']}
              style={styles.googlePayGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="logo-google" size={24} color="#FFFFFF" />
              <Text style={styles.googlePayText}>Google Pay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Credit/Debit Cards */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Credit/Debit Cards</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setIsAddingCard(!isAddingCard)}
          >
            <Ionicons 
              name={isAddingCard ? "remove" : "add"} 
              size={20} 
              color={theme.colors.light.primary} 
            />
            <Text style={styles.addButtonText}>
              {isAddingCard ? 'Cancel' : 'Add Card'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add New Card Form */}
        {isAddingCard && (
          <View style={styles.addCardForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.cardInputContainer}>
                <Ionicons name="card" size={20} color={theme.colors.light.textSecondary} />
                <TextInput
                  style={styles.cardInput}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  maxLength={19}
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.light.textTertiary}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  maxLength={5}
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.light.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  maxLength={4}
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.light.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholderTextColor={theme.colors.light.textTertiary}
              />
            </View>

            <TouchableOpacity style={styles.saveCardButton} onPress={handleAddCard}>
              <LinearGradient
                colors={theme.gradients.primary}
                style={styles.saveCardButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.saveCardButtonText}>Save Card</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Existing Cards */}
        <View style={styles.cardsContainer}>
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.cardItem}>
              <View style={styles.cardInfo}>
                <View style={styles.cardIconContainer}>
                  <Ionicons 
                    name="card" 
                    size={24} 
                    color={theme.colors.light.primary} 
                  />
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardName}>{method.name}</Text>
                  <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
                </View>
              </View>
              
              <View style={styles.cardActions}>
                {method.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Text style={styles.setDefaultButtonText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMethod(method.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.light.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Security Notice */}
      <View style={styles.securitySection}>
        <View style={styles.securityContent}>
          <Ionicons name="shield-checkmark" size={24} color={theme.colors.light.success} />
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>Secure & Encrypted</Text>
            <Text style={styles.securityDescription}>
              Your payment information is protected with bank-level security
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.primary,
    fontWeight: theme.typography.weights.medium,
    marginLeft: 4,
  },
  digitalWalletsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  applePayButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  applePayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  applePayText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
  },
  googlePayButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  googlePayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  googlePayText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
  },
  addCardForm: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  input: {
    backgroundColor: theme.colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.text,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
  },
  cardInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
  },
  cardInput: {
    flex: 1,
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.text,
    marginLeft: 12,
  },
  saveCardButton: {
    marginTop: 8,
  },
  saveCardButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveCardButtonText: {
    color: theme.colors.light.textOnPrimary,
    fontSize: theme.typography.sizes.button,
    fontWeight: theme.typography.weights.semibold,
  },
  cardsContainer: {
    gap: 16,
  },
  cardItem: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  defaultBadge: {
    backgroundColor: theme.colors.light.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.light.success + '30',
  },
  defaultBadgeText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.success,
    fontWeight: theme.typography.weights.medium,
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  setDefaultButtonText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.primary,
    fontWeight: theme.typography.weights.medium,
  },
  deleteButton: {
    padding: 8,
  },
  securitySection: {
    margin: 24,
    marginTop: 0,
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.light.success + '10',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.light.success + '20',
  },
  securityText: {
    marginLeft: 16,
    flex: 1,
  },
  securityTitle: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
});