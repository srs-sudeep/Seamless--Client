import { useState, useMemo } from 'react';
import { Button, DynamicTable, HelmetWrapper, Sheet, SheetContent, SheetTitle } from '@/components';
import { useMealSessions, useMealSessionTransactions } from '@/hooks';
import {
  FileText,
  Loader2,
  Clock,
  Users,
  Store,
  Activity,
  BarChart3,
  Target,
  TrendingUp,
  CreditCard,
  CalendarClock,
  ChefHat,
} from 'lucide-react';

const MealSessionPage = () => {
  const { data: sessions = [], isLoading } = useMealSessions();
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

    // Get unique vendors and transaction types
    const uniqueVendors = new Set(sessions.map(s => s.vendor_id)).size;
    const uniqueTransactionTypes = new Set(sessions.map(s => s.transaction_type)).size;

    // Get transaction type breakdown
    const transactionTypeBreakdown: Record<string, number> = {};
    sessions.forEach(session => {
      const type = session.transaction_type || 'Unknown';
      transactionTypeBreakdown[type] = (transactionTypeBreakdown[type] || 0) + 1;
    });

    return {
      totalSessions,
      ongoingSessions,
      completedSessions,
      upcomingSessions,
      uniqueVendors,
      uniqueTransactionTypes,
      transactionTypeBreakdown,
    };
  }, [sessions]);

  const getTableData = (sessions: any[]) =>
    sessions.map(session => ({
      ID: session.id,
      Type: session.transaction_type,
      Vendor: session.vendor_id,
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
        breakfast: 'bg-chip-yellow/10 border-chip-yellow text-chip-yellow',
        lunch: 'bg-success/10 border-success text-success',
        dinner: 'bg-chip-blue/10 border-chip-blue text-chip-blue',
        snacks: 'bg-chip-purple/10 border-chip-purple text-chip-purple',
      };
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeColors[value?.toLowerCase()] || 'bg-muted text-foreground border-secondary'}`}
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
      'Vendor ID': tx.vendor_id,
      Timestamp: new Date(tx.timestamp).toLocaleString(),
    }));

  if (isLoading && sessions.length === 0) {
    return (
      <HelmetWrapper
        title="Meal Sessions | Naivedyam"
        heading="Meal Sessions"
        subHeading="Comprehensive meal service management and transaction tracking"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading meal session data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Meal Sessions | Naivedyam"
      heading="Meal Sessions"
      subHeading="Comprehensive meal service management and transaction tracking with real-time analytics"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-card-blue">{statistics.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Ongoing</p>
                <p className="text-2xl font-bold text-card-green">{statistics.ongoingSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Active Vendors</p>
                <p className="text-2xl font-bold text-card-purple">{statistics.uniqueVendors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Meal Types</p>
                <p className="text-2xl font-bold text-card-orange">
                  {statistics.uniqueTransactionTypes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Type Distribution */}
        {Object.keys(statistics.transactionTypeBreakdown).length > 0 && (
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Meal Type Distribution</h3>
                <p className="text-sm text-muted-foreground">Session breakdown by meal type</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statistics.transactionTypeBreakdown)
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

        {/* Enhanced Meal Sessions Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Meal Service Dashboard
            </h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive view of all meal sessions with real-time status tracking and transaction
              management
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Meal Sessions"
              data={getTableData(sessions)}
              isLoading={isLoading}
              customRender={customRender}
            />
          </div>
        </div>

        {/* Session Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <CalendarClock className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Session Status</h3>
                <p className="text-sm text-muted-foreground">Current meal session breakdown</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Ongoing Sessions</span>
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
                <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Meal session management</p>
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
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Monitor real-time meal service activity</span>
              </div>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card-blue-gradient rounded-xl p-4 border border-card-blue">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-card-blue-icon rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-background" />
                    </div>
                    <div>
                      <p className="text-xs text-card-blue font-medium">Total Transactions</p>
                      <p className="text-xl font-bold text-card-blue">{transactions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card-green-gradient rounded-xl p-4 border border-card-green">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-card-green-icon rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-background" />
                    </div>
                    <div>
                      <p className="text-xs text-card-green font-medium">Unique Students</p>
                      <p className="text-xl font-bold text-card-green">
                        {new Set(transactions.map(t => t.student_id)).size}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card-purple-gradient rounded-xl p-4 border border-card-purple">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-card-purple-icon rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-background" />
                    </div>
                    <div>
                      <p className="text-xs text-card-purple font-medium">Unique Vendors</p>
                      <p className="text-xl font-bold text-card-purple">
                        {new Set(transactions.map(t => t.vendor_id)).size}
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

export default MealSessionPage;
