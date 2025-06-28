
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/hooks/useCurrency';
import { Globe } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const { currencies, currentCurrency, updateCurrency, isUpdating } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-white/60" />
      <Select
        value={currentCurrency?.id || 'GBP'}
        onValueChange={updateCurrency}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-24 h-8 bg-white/10 border-white/20 text-white text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.id} value={currency.id}>
              <div className="flex items-center gap-2">
                <span>{currency.symbol}</span>
                <span className="text-xs text-gray-500">{currency.id}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
