import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import StripePaymentService from '../../services/payments/stripe';
import { PromoCode } from '../../types/payments';
import { PROMO_CODES, SUBSCRIPTION_PLANS, CURRENCY } from '../../constants/subscriptions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  validUntil?: Date;
  code?: string;
  icon: string;
  gradient: string[];
}

const specialOffers: SpecialOffer[] = [
  {
    id: 'new_year',
    title: 'New Year, New You! 🎊',
    description: 'Get 50% off your first 3 months',
    discount: 50,
    discountType: 'percentage',
    validUntil: new Date('2025-01-31'),
    code: 'NEWYEAR50',
    icon: 'gift',
    gradient: ['#FF6B6B', '#FF8787'],
  },
  {
    id: 'student',
    title: 'Student Discount 🎓',
    description: '25% off with valid .edu email',
    discount: 25,
    discountType: 'percentage',
    icon: 'school',
    gradient: ['#4E54C8', '#8F94FB'],
  },
  {
    id: 'referral',
    title: 'Refer a Friend 👥',
    description: 'Both get 1 month free!',
    discount: 100,
    discountType: 'percentage',
    icon: 'people',
    gradient: ['#11998E', '#38EF7D'],
  },
  {
    id: 'comeback',
    title: 'We Miss You! 💔',
    description: '30% off to restart your journey',
    discount: 30,
    discountType: 'percentage',
    code: 'COMEBACK30',
    icon: 'heart',
    gradient: ['#FC466B', '#3F5EFB'],
  },
];

const PromoScreen: React.FC = () => {
  const navigation = useNavigation();
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const scale = useSharedValue(1);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Enter Code', 'Please enter a promo code');
      return;
    }

    setIsValidating(true);
    try {
      const promo = await StripePaymentService.applyPromoCode(promoCode.toUpperCase());
      
      if (promo) {
        setAppliedPromo(promo);
        Alert.alert(
          'Success! 🎉',
          `${promo.discountAmount}${promo.discountType === 'percentage' ? '%' : CURRENCY.USD} discount applied!`,
          [
            {
              text: 'Continue to Payment',
              onPress: () => navigateToPaywall(promo),
            },
          ]
        );
      } else {
        Alert.alert('Invalid Code', 'This promo code is not valid or has expired');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate promo code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSpecialOffer = async (offer: SpecialOffer) => {
    setSelectedOffer(offer);
    
    if (offer.id === 'student') {
      // Show student email verification
      Alert.prompt(
        'Student Verification',
        'Enter your .edu email address',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Verify',
            onPress: async (email) => {
              if (email && email.endsWith('.edu')) {
                await applyStudentDiscount(email);
              } else {
                Alert.alert('Invalid Email', 'Please use a valid .edu email address');
              }
            },
          },
        ],
        'plain-text',
        studentEmail
      );
    } else if (offer.id === 'referral') {
      // Navigate to referral screen
      navigation.navigate('Referral' as never);
    } else if (offer.code) {
      // Apply the offer code
      setPromoCode(offer.code);
      await handleApplyPromoCode();
    } else {
      // Navigate to paywall with offer
      navigateToPaywall(null, offer);
    }
  };

  const applyStudentDiscount = async (email: string) => {
    setIsValidating(true);
    try {
      // Verify student email via backend
      const { data, error } = await supabase.functions.invoke('verify-student-email', {
        body: { email }
      });
      
      if (data?.verified) {
        const studentPromo = PROMO_CODES.STUDENT25;
        setAppliedPromo(studentPromo as PromoCode);
        Alert.alert(
          'Student Discount Applied! 🎓',
          '25% off has been applied to your subscription',
          [
            {
              text: 'Continue',
              onPress: () => navigateToPaywall(studentPromo as PromoCode),
            },
          ]
        );
      } else {
        Alert.alert('Verification Failed', 'Could not verify your student status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify student email');
    } finally {
      setIsValidating(false);
    }
  };

  const navigateToPaywall = (promo: PromoCode | null, offer?: SpecialOffer) => {
    navigation.navigate('Paywall', {
      promoCode: promo,
      specialOffer: offer,
    } as never);
  };

  const calculateDiscountedPrice = (originalPrice: number, discount: number, discountType: string) => {
    if (discountType === 'percentage') {
      return originalPrice * (1 - discount / 100);
    }
    return originalPrice - discount;
  };

  const buttonScale = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Special Offers</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Promo Code Section */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.promoSection}>
          <Text style={styles.sectionTitle}>Have a Promo Code?</Text>
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              maxLength={20}
            />
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyPromoCode}
              disabled={isValidating}
            >
              {isValidating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.applyButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>

          {appliedPromo && (
            <View style={styles.appliedPromoCard}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.appliedPromoText}>
                {appliedPromo.code} applied - {appliedPromo.discountAmount}
                {appliedPromo.discountType === 'percentage' ? '%' : CURRENCY.USD} off
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Special Offers */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.offersSection}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          
          {specialOffers.map((offer, index) => (
            <Animated.View
              key={offer.id}
              entering={FadeInUp.delay(300 + index * 100)}
            >
              <TouchableOpacity
                style={styles.offerCard}
                onPress={() => handleSpecialOffer(offer)}
                onPressIn={() => (scale.value = 0.98)}
                onPressOut={() => (scale.value = 1)}
              >
                <LinearGradient
                  colors={offer.gradient}
                  style={styles.offerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.offerContent}>
                    <View style={styles.offerIcon}>
                      <Ionicons name={offer.icon as any} size={32} color="white" />
                    </View>
                    <View style={styles.offerDetails}>
                      <Text style={styles.offerTitle}>{offer.title}</Text>
                      <Text style={styles.offerDescription}>{offer.description}</Text>
                      {offer.validUntil && (
                        <Text style={styles.offerExpiry}>
                          Expires {offer.validUntil.toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Group/Team Subscriptions */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.teamSection}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.teamCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="people-circle" size={48} color="white" />
            <Text style={styles.teamTitle}>Team Subscriptions</Text>
            <Text style={styles.teamDescription}>
              Get bulk pricing for your gym, team, or company
            </Text>
            <TouchableOpacity style={styles.teamButton}>
              <Text style={styles.teamButtonText}>Contact Sales</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Limited Time Banner */}
        <Animated.View entering={FadeInUp.delay(700)} style={styles.bannerSection}>
          <View style={styles.banner}>
            <View style={styles.bannerTimer}>
              <Ionicons name="time" size={20} color="#EF4444" />
              <Text style={styles.bannerTimerText}>Limited Time</Text>
            </View>
            <Text style={styles.bannerTitle}>Black Friday Sale</Text>
            <Text style={styles.bannerDiscount}>Up to 60% OFF</Text>
            <Text style={styles.bannerDescription}>
              Our biggest sale of the year ends soon!
            </Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => navigateToPaywall(null)}
            >
              <Text style={styles.bannerButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            Promo codes cannot be combined. One per customer. New subscribers only for certain offers.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  promoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 25,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appliedPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  appliedPromoText: {
    fontSize: 14,
    color: '#065F46',
    marginLeft: 8,
  },
  offersSection: {
    paddingHorizontal: 20,
  },
  offerCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerGradient: {
    padding: 20,
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  offerDetails: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  offerExpiry: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  teamSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  teamCard: {
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  teamTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  teamDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  teamButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  teamButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bannerSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  banner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  bannerTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  bannerTimerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 5,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 5,
  },
  bannerDiscount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 5,
  },
  bannerDescription: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 15,
  },
  bannerButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bannerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  termsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PromoScreen;