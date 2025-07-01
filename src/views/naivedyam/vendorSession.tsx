import { useState, useMemo } from 'react';
import { Button, DynamicTable, HelmetWrapper, Sheet, SheetContent, SheetTitle } from '@/components';
import { useMealSessionTransactions, useVendorMealSession } from '@/hooks';
import {
  FileText,
  Loader2,
  Clock,
  Activity,
  BarChart3,
  Target,
  TrendingUp,
  CreditCard,
  CalendarClock,
  ChefHat,
  Users,
  Store,
} from 'lucide-react';

const VendorSessionPage = () => {
  const { data: sessions = [], isLoading } = useVendorMealSession();
  const [sidePanel, setSidePanel] = useState<{ open: boolean; sessionId?: string }>({
    open: false,
  });

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalSessions = sessions.length;
    const ongoingSessions = sessions.filter(session => {
      const now = new Date();
      const start = new Date(session.time_start);
      const end = new Date(session.time_end);
      return now >= start && now <= end;
    }).length;
    const completedSessions = sessions.filter(session => {
      const now = new Date();
      const end = new Date(session.time_end);
      return now > end;
    }).length;
    const upcomingSessions = sessions.filter(session => {
      const now = new Date();
      const start = new Date(session.time_start);
      return now < start;
    }).length;

    // Get meal type breakdown
    const mealTypeBreakdown: Record<string, number> = {};
    sessions.forEach(session => {
      const type = session.transaction_type || 'Unknown';
      mealTypeBreakdown[type] = (mealTypeBreakdown[type] || 0) + 1;
    });

    return {
      totalSessions,
      ongoingSessions,
      completedSessions,
      upcomingSessions,
      mealTypeBreakdown,
    };
  }, [sessions]);

  const getTableData = (sessions: any[]) =>
    sessions.map(session => ({
      ID: session.id,
      Type: session.transaction_type,
      Start: new Date(session.time_start).toLocaleString(),
      End: new Date(session.time_end).toLocaleString(),
      'View Transactions': '',
      _row: session,
    }));

  const customRender = {
    'View Transactions': (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="outline"
        onClick={e => {
          e.stopPropagation();
          setSidePanel({ open: true, sessionId: row._row.id });
        }}
        aria-label="View Transactions"
      >
        <FileText className="w-4 h-4" />
      </Button>
    ),
    Type: (value: string) => {
      const typeColors: Record<string, string> = {
        breakfast:
          'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
        lunch:
          'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
        dinner:
          'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
        snacks:
          'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      };
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeColors[value?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
        >
          {value}
        </span>
      );
    },
  };

  // Side panel data
  const { data: transactions = [], isLoading: isLoadingTx } = useMealSessionTransactions(
    sidePanel.sessionId || ''
  );

  const getTransactionTableData = (txs: any[]) =>
    txs.map(tx => ({
      'Transaction ID': tx.transaction_id,
      'Student ID': tx.student_id,
      Timestamp: new Date(tx.timestamp).toLocaleString(),
    }));

  if (isLoading && sessions.length === 0) {
    return (
      <HelmetWrapper
        title="Vendor Meal Sessions | Naivedyam"
        heading="Vendor Meal Sessions"
        subHeading="Comprehensive vendor meal service management and analytics"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading vendor session data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Vendor Meal Sessions | Naivedyam"
      heading="Vendor Meal Sessions"
      subHeading="Comprehensive vendor meal service management with real-time analytics and transaction tracking"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {statistics.totalSessions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {statistics.ongoingSessions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                  Completed
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {statistics.completedSessions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <CalendarClock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">
                  Upcoming
                </p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {statistics.upcomingSessions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Session Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Session Analytics</h3>
                <p className="text-sm text-muted-foreground">Real-time session status breakdown</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Active Sessions</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-lg font-bold text-foreground">
                    {statistics.ongoingSessions}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Completed Sessions
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                  <span className="text-lg font-bold text-foreground">
                    {statistics.completedSessions}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Upcoming Sessions</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-lg font-bold text-foreground">
                    {statistics.upcomingSessions}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Vendor Operations</h3>
                <p className="text-sm text-muted-foreground">Meal service management tools</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Click the document icon to view session transactions
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Store className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Monitor vendor-specific meal service activity
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Type Distribution */}
        {Object.keys(statistics.mealTypeBreakdown).length > 0 && (
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Meal Service Distribution</h3>
                <p className="text-sm text-muted-foreground">Session breakdown by meal type</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statistics.mealTypeBreakdown)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([type, count]) => (
                  <div
                    key={type}
                    className="bg-background rounded-xl p-4 border border-border shadow-sm"
                  >
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1 capitalize">{type}</div>
                      <div className="text-xl font-bold text-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground">sessions</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Enhanced Vendor Sessions Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Vendor Session Dashboard
            </h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive view of all vendor meal sessions with real-time status tracking and
              transaction access
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Vendor Meal Sessions"
              data={getTableData(sessions)}
              isLoading={isLoading}
              customRender={customRender}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Side Panel for Transactions */}
      <Sheet
        open={sidePanel.open}
        onOpenChange={open => {
          if (!open) setSidePanel({ open: false, sessionId: undefined });
        }}
      >
        <SheetTitle style={{ display: 'none' }} />
        <SheetContent
          side="right"
          className="
            p-0
            fixed right-0 top-1/2 -translate-y-1/2
            min-h-fit max-h-[100vh]
            sm:w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw]
            bg-gradient-to-br from-background to-muted/30
            border-l-2 border-border
            shadow-2xl
            overflow-hidden
            flex flex-col
            rounded-l-2xl
          "
          style={{ width: '90vw', maxWidth: '800px' }}
        >
          <div className="flex-1 overflow-y-auto">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b-2 border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Session Transactions</h2>
                  <p className="text-muted-foreground">
                    Transaction details for session{' '}
                    <span className="font-mono text-primary font-semibold">
                      {sidePanel.sessionId}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Statistics */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-muted/10 to-background">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Total Transactions
                      </p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        {transactions.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Unique Students
                      </p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-300">
                        {new Set(transactions.map(t => t.student_id)).size}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="p-8 space-y-6">
              {isLoadingTx ? (
                <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <DynamicTable
                  tableHeading="Transactions"
                  data={getTransactionTableData(transactions)}
                  isLoading={isLoadingTx}
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HelmetWrapper>
  );
};

export default VendorSessionPage;
