import { useMemo } from 'react';
import { DynamicTable, HelmetWrapper } from '@/components';
import { useStudentMealSessionTransactions } from '@/hooks';
import {
  Loader2,
  CreditCard,
  Store,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  ChefHat,
  Receipt,
  History,
} from 'lucide-react';

const StudentTransactionPage = () => {
  const { data = [], isLoading } = useStudentMealSessionTransactions();

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalTransactions = data.length;

    // Get unique vendors and sessions
    const uniqueVendors = new Set(data.map(tx => tx.vendor_name)).size;
    const uniqueSessions = new Set(data.map(tx => tx.session_id)).size;

    // Transaction type breakdown
    const transactionTypeBreakdown: Record<string, number> = {};
    data.forEach(tx => {
      const type = tx.transaction_type || 'Unknown';
      transactionTypeBreakdown[type] = (transactionTypeBreakdown[type] || 0) + 1;
    });

    // Recent transactions (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const recentTransactions = data.filter(
      tx => new Date(tx.timestamp) >= twentyFourHoursAgo
    ).length;

    // Vendor breakdown
    const vendorBreakdown: Record<string, number> = {};
    data.forEach(tx => {
      const vendor = tx.vendor_name || 'Unknown';
      vendorBreakdown[vendor] = (vendorBreakdown[vendor] || 0) + 1;
    });

    // Most frequent meal type
    const mostFrequentType = Object.entries(transactionTypeBreakdown).reduce(
      (max, [type, count]) => (count > max.count ? { type, count } : max),
      { type: 'None', count: 0 }
    );

    return {
      totalTransactions,
      uniqueVendors,
      uniqueSessions,
      recentTransactions,
      transactionTypeBreakdown,
      vendorBreakdown,
      mostFrequentType,
    };
  }, [data]);

  const getTableData = (transactions: any[]) =>
    transactions.map(tx => ({
      'Session ID': tx.session_id,
      'Vendor Name': tx.vendor_name,
      Type: tx.transaction_type,
      'Transaction ID': tx.transaction_id,
      Timestamp: new Date(tx.timestamp).toLocaleString(),
    }));

  if (isLoading && data.length === 0) {
    return (
      <HelmetWrapper
        title="Student Transactions | Naivedyam"
        heading="Student Transactions"
        subHeading="Your comprehensive meal service transaction history"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your transaction history...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Student Transactions | Naivedyam"
      heading="Student Transactions"
      subHeading="Your comprehensive meal service transaction history with detailed analytics"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-card-blue">{statistics.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Vendors Used</p>
                <p className="text-2xl font-bold text-card-green">{statistics.uniqueVendors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Sessions</p>
                <p className="text-2xl font-bold text-card-purple">{statistics.uniqueSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Recent (24h)</p>
                <p className="text-2xl font-bold text-card-orange">
                  {statistics.recentTransactions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Transaction History Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Transaction History
            </h2>
            <p className="text-muted-foreground mt-2">
              Complete record of your meal service transactions with detailed session and vendor
              information
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Student Transactions"
              data={getTableData(data)}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Transaction Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Transaction Insights</h3>
                <p className="text-sm text-muted-foreground">Your meal service usage patterns</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Most Frequent Meal
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground capitalize">
                    {statistics.mostFrequentType.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({statistics.mostFrequentType.count}x)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Average per Day</span>
                <span className="text-lg font-bold text-foreground">
                  {statistics.totalTransactions > 0
                    ? (statistics.totalTransactions / 30).toFixed(1)
                    : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Vendor Diversity</span>
                <span className="text-lg font-bold text-foreground">
                  {statistics.uniqueVendors} vendors
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Quick Facts</h3>
                <p className="text-sm text-muted-foreground">Your meal service overview</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Receipt className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  All transactions are recorded with timestamps
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <History className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Complete transaction history available</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Track your meal patterns over time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Type Distribution */}
        {Object.keys(statistics.transactionTypeBreakdown).length > 0 && (
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Meal Type Breakdown</h3>
                <p className="text-sm text-muted-foreground">Your dining preferences and habits</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statistics.transactionTypeBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div
                    key={type}
                    className="bg-background rounded-xl p-4 border border-border shadow-sm"
                  >
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1 capitalize">{type}</div>
                      <div className="text-xl font-bold text-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground">transactions</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Vendor Usage Distribution */}
        {Object.keys(statistics.vendorBreakdown).length > 0 && (
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Vendor Usage</h3>
                <p className="text-sm text-muted-foreground">
                  Your preferred meal service providers
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(statistics.vendorBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6) // Show top 6 vendors
                .map(([vendor, count]) => (
                  <div
                    key={vendor}
                    className="bg-background rounded-xl p-4 border border-border shadow-sm"
                  >
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1 truncate" title={vendor}>
                        {vendor.length > 15 ? `${vendor.slice(0, 15)}...` : vendor}
                      </div>
                      <div className="text-xl font-bold text-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground">visits</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </HelmetWrapper>
  );
};

export default StudentTransactionPage;
