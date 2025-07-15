
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Currency {
  id: string;
  name: string;
  symbol: string;
  exchange_rate_to_gbp: number;
  is_active: boolean;
}

interface UserCurrencyPreference {
  id: string;
  user_id: string;
  currency_code: string;
  currency?: Currency;
}

export const useCurrency = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available currencies
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching currencies:', error);
        return [];
      }

      return data as Currency[];
    },
  });

  // Fetch user's currency preference
  const { data: userCurrency, isLoading: isLoadingUserCurrency } = useQuery({
    queryKey: ['user-currency', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_currency_preferences')
        .select(`
          *,
          currency:currencies(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user currency:', error);
        return null;
      }

      return data as UserCurrencyPreference;
    },
    enabled: !!user?.id,
  });

  // Update user's currency preference
  const updateCurrencyMutation = useMutation({
    mutationFn: async (currencyCode: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_currency_preferences')
        .upsert({
          user_id: user.id,
          currency_code: currencyCode,
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          currency:currencies(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-currency', user?.id] });
      toast({
        title: "Currency Updated",
        description: "Your preferred currency has been updated.",
      });
    },
    onError: (error) => {
      console.error('Currency update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update currency preference. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Convert price between currencies
  const convertPrice = (basePrice: number, fromCurrency = 'GBP', toCurrency?: string) => {
    if (!toCurrency) toCurrency = userCurrency?.currency_code || 'GBP';
    
    const fromRate = currencies.find(c => c.id === fromCurrency)?.exchange_rate_to_gbp || 1;
    const toRate = currencies.find(c => c.id === toCurrency)?.exchange_rate_to_gbp || 1;
    
    return Math.round((basePrice * fromRate / toRate) * 100) / 100;
  };

  // Format price with currency symbol
  const formatPrice = (price: number, currencyCode?: string) => {
    const currency = currencies.find(c => c.id === (currencyCode || userCurrency?.currency_code || 'GBP'));
    if (!currency) return `£${price.toFixed(2)}`;
    
    const convertedPrice = convertPrice(price, 'GBP', currency.id);
    return `${currency.symbol}${convertedPrice.toFixed(2)}`;
  };

  const currentCurrency = userCurrency?.currency || currencies.find(c => c.id === 'GBP');

  return {
    currencies,
    currentCurrency,
    userCurrency,
    isLoading: isLoadingCurrencies || isLoadingUserCurrency,
    updateCurrency: updateCurrencyMutation.mutate,
    isUpdating: updateCurrencyMutation.isPending,
    convertPrice,
    formatPrice,
  };
};
