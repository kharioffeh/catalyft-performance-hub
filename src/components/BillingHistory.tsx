
import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface AthletePurchase {
  id: string;
  athlete_pack_size: number;
  monthly_cost_added: number;
  currency_code: string;
  purchase_date: string;
  is_active: boolean;
}

interface BillingHistoryProps {
  purchases: AthletePurchase[];
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({ purchases }) => {
  const { formatPrice } = useCurrency();

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Calendar className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Billing History</h2>
          <p className="text-white/60 text-sm">Your recent purchases and add-ons</p>
        </div>
      </div>

      <div className="space-y-3">
        {purchases.slice(0, 10).map((purchase) => (
          <div key={purchase.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-white font-medium">
                  {purchase.athlete_pack_size} Athletes Added
                </p>
                <p className="text-white/60 text-sm">
                  {new Date(purchase.purchase_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">
                +{formatPrice(purchase.monthly_cost_added)}/month
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                  {purchase.currency_code}
                </Badge>
                {purchase.is_active && (
                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-400/20">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {purchases.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">No billing history available</p>
        </div>
      )}
    </GlassCard>
  );
};
