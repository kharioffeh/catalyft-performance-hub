import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  invoiceNumber: string;
  description: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    date: '2024-01-15',
    amount: 9.99,
    currency: 'USD',
    status: 'paid',
    plan: 'Pro Plan',
    invoiceNumber: 'INV-2024-001',
    description: 'Pro Plan - Monthly Subscription'
  },
  {
    id: '2',
    date: '2023-12-15',
    amount: 9.99,
    currency: 'USD',
    status: 'paid',
    plan: 'Pro Plan',
    invoiceNumber: 'INV-2023-012',
    description: 'Pro Plan - Monthly Subscription'
  },
  {
    id: '3',
    date: '2023-11-15',
    amount: 9.99,
    currency: 'USD',
    status: 'paid',
    plan: 'Pro Plan',
    invoiceNumber: 'INV-2023-011',
    description: 'Pro Plan - Monthly Subscription'
  },
  {
    id: '4',
    date: '2023-10-15',
    amount: 9.99,
    currency: 'USD',
    status: 'paid',
    plan: 'Pro Plan',
    invoiceNumber: 'INV-2023-010',
    description: 'Pro Plan - Monthly Subscription'
  },
  {
    id: '5',
    date: '2023-09-15',
    amount: 9.99,
    currency: 'USD',
    status: 'paid',
    plan: 'Pro Plan',
    invoiceNumber: 'INV-2023-009',
    description: 'Pro Plan - Monthly Subscription'
  },
  {
    id: '6',
    date: '2023-08-15',
    amount: 9.99,
    currency: 'USD',
    status: 'paid',
    plan: 'Pro Plan',
    invoiceNumber: 'INV-2023-008',
    description: 'Pro Plan - Monthly Subscription'
  }
];

export const BillingHistoryScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const filteredInvoices = selectedFilter === 'all' 
    ? invoices 
    : invoices.filter(invoice => invoice.status === selectedFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return theme.colors.light.success;
      case 'pending':
        return theme.colors.light.warning;
      case 'failed':
        return theme.colors.light.error;
      default:
        return theme.colors.light.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Handle download logic
    console.log('Downloading invoice:', invoice.invoiceNumber);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    // Handle view logic
    console.log('Viewing invoice:', invoice.invoiceNumber);
  };

  const renderInvoiceCard = ({ item }: { item: Invoice }) => (
    <View style={styles.invoiceCard}>
      {/* Invoice Header */}
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Invoice Details */}
      <View style={styles.invoiceDetails}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{item.plan}</Text>
          <Text style={styles.planDescription}>{item.description}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(item.amount, item.currency)}
          </Text>
        </View>
      </View>

      {/* Invoice Actions */}
      <View style={styles.invoiceActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewInvoice(item)}
        >
          <Ionicons name="eye-outline" size={18} color={theme.colors.light.primary} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDownloadInvoice(item)}
        >
          <Ionicons name="download-outline" size={18} color={theme.colors.light.secondary} />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButton = (filter: 'all' | 'paid' | 'pending' | 'failed', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Billing History</Text>
        <Text style={styles.subtitle}>
          View and manage your subscription invoices
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="card" size={24} color={theme.colors.light.primary} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(
                invoices.reduce((sum, invoice) => sum + invoice.amount, 0),
                'USD'
              )}
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="receipt" size={24} color={theme.colors.light.secondary} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Total Invoices</Text>
            <Text style={styles.summaryValue}>{invoices.length}</Text>
          </View>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('paid', 'Paid')}
          {renderFilterButton('pending', 'Pending')}
          {renderFilterButton('failed', 'Failed')}
        </ScrollView>
      </View>

      {/* Invoices List */}
      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceCard}
        keyExtractor={(item) => item.id}
        style={styles.invoicesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.invoicesListContent}
      />

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={theme.colors.light.textTertiary} />
          <Text style={styles.emptyStateTitle}>No invoices found</Text>
          <Text style={styles.emptyStateSubtitle}>
            {selectedFilter === 'all' 
              ? 'You don\'t have any invoices yet.'
              : `No ${selectedFilter} invoices found.`
            }
          </Text>
        </View>
      )}
    </View>
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
  },
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.light.backgroundSecondary,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.light.primary,
    borderColor: theme.colors.light.primary,
  },
  filterButtonText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.textSecondary,
  },
  filterButtonTextActive: {
    color: theme.colors.light.textOnPrimary,
  },
  invoicesList: {
    flex: 1,
  },
  invoicesListContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  invoiceCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'capitalize',
  },
  invoiceDetails: {
    marginBottom: 20,
  },
  planInfo: {
    marginBottom: 16,
  },
  planName: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.light.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
  },
  amountLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  amountValue: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary,
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.light.backgroundSecondary,
    gap: 8,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed,
  },
});