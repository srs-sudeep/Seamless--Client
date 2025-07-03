import {
  Button,
  DynamicTable,
  HelmetWrapper,
  Input,
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components';
import { useTransactionFilters, useTransactionsByMealSession, useVendorMealSession } from '@/hooks';
import type { FilterConfig, GetTransactionsParams } from '@/types';
import {
  Activity,
  BarChart3,
  CalendarClock,
  ChefHat,
  Clock,
  CreditCard,
  FileText,
  Filter,
  Loader2,
  Store,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const VendorSessionPage = () => {
  const { data: sessions = [], isLoading } = useVendorMealSession();
  const [sidePanel, setSidePanel] = useState<{ open: boolean; sessionId?: string }>({
    open: false,
  });

  // Transaction filters state
  const [transactionFilters, setTransactionFilters] = useState<{
    meal_type?: string[];
    start_date?: string;
    end_date?: string;
  }>({});
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionLimit, setTransactionLimit] = useState(10);

  // Filter options
  const { data: filterOptions } = useTransactionFilters();

  // Filter state for filterConfig
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Reset filters when side panel closes
  useEffect(() => {
    if (!sidePanel.open) {
      setTransactionFilters({});
      setTransactionSearch('');
      setTransactionPage(1);
      setSelectedMealTypes([]);
      setSelectedDateRange({});
    }
  }, [sidePanel.open]);

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

  // Transaction query parameters
  const transactionParams: GetTransactionsParams = useMemo(
    () => ({
      meal_session_id: sidePanel.sessionId || '',
      ...transactionFilters,
      search: transactionSearch,
      limit: transactionLimit,
      offset: (transactionPage - 1) * transactionLimit,
    }),
    [sidePanel.sessionId, transactionFilters, transactionSearch, transactionPage, transactionLimit]
  );

  // Side panel data with filters
  const { data: transactionData, isLoading: isLoadingTx } = useTransactionsByMealSession(
    transactionParams,
    !!sidePanel.sessionId
  );

  const transactions = Array.isArray(transactionData) ? transactionData : [];
  const totalTransactionCount = Array.isArray(transactionData) ? transactionData.length : 0;

  // Filter configuration for transaction table
  const transactionFilterConfig: FilterConfig[] = useMemo(
    () => [
      {
        column: 'Meal Type',
        type: 'multi-select',
        options: filterOptions?.meal_types?.map(mt => mt.label) || [],
        value: selectedMealTypes,
        onChange: (val: string[]) => {
          setSelectedMealTypes(val);
          const mealTypes = val
            .map(label => filterOptions?.meal_types?.find(mt => mt.label === label)?.value)
            .filter((value): value is string => typeof value === 'string');
          setTransactionFilters(f => ({
            ...f,
            meal_type: mealTypes.length ? mealTypes : undefined,
          }));
          setTransactionPage(1);
        },
      },
      {
        column: 'Date Range',
        type: 'date-range',
        value: selectedDateRange,
        onChange: (val: { from?: Date; to?: Date }) => {
          setSelectedDateRange(val);
          const formatDate = (date: Date) => date.toISOString().split('T')[0];
          setTransactionFilters(f => ({
            ...f,
            start_date: val.from ? formatDate(val.from) : undefined,
            end_date: val.to ? formatDate(val.to) : undefined,
          }));
          setTransactionPage(1);
        },
      },
    ],
    [filterOptions, selectedMealTypes, selectedDateRange]
  );

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

  const getTransactionTableData = (txs: any[]) =>
    txs.map(tx => ({
      'Transaction ID': tx.transaction_id,
      'Student ID': tx.student_id,
      Timestamp: new Date(tx.timestamp).toLocaleString(),
    }));

  console.log('Transaction Data:', transactionData);

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
                <p className="text-sm text-card-green font-medium mb-1">Active Sessions</p>
                <p className="text-2xl font-bold text-card-green">{statistics.ongoingSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Completed</p>
                <p className="text-2xl font-bold text-card-purple">
                  {statistics.completedSessions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <CalendarClock className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-card-orange">{statistics.upcomingSessions}</p>
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
                <ChefHat className="w-6 h-6 text-background" />
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

      {/* Enhanced Side Panel for Transactions with Filters */}
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
            w-[95vw] max-w-[1400px]
            bg-gradient-to-br from-background to-secondary/70
            border-l-2 border-border
            shadow-2xl
            overflow-hidden
            flex flex-col
            rounded-l-2xl
          "
          style={{ maxWidth: '1200vw', width: '70%' }}
        >
          <div className="flex-1 overflow-y-auto">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b-2 border-border">
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

            {/* Main Content Area with Filter Sidebar */}
            <div className="flex h-full">
              {/* Filter Sidebar */}
              <div className="w-80 bg-muted/20 border-r border-border p-6 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Filter className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Filters</h3>
                    <p className="text-sm text-muted-foreground">Filter transactions</p>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
                  <Input
                    type="text"
                    placeholder="Search transactions..."
                    value={transactionSearch}
                    onChange={e => setTransactionSearch(e.target.value)}
                    className="w-full bg-background text-foreground"
                  />
                </div>

                {/* Filter Controls */}
                <div className="space-y-6">
                  {transactionFilterConfig.map(filter => (
                    <div key={filter.column}>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {filter.column}
                      </label>
                      <div className="bg-background rounded-lg border border-border p-3">
                        {filter.type === 'multi-select' && (
                          <div className="space-y-2">
                            {filter.options?.map(option => (
                              <label
                                key={option}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedMealTypes.includes(option)}
                                  onChange={e => {
                                    const newSelected = e.target.checked
                                      ? [...selectedMealTypes, option]
                                      : selectedMealTypes.filter(t => t !== option);
                                    filter.onChange?.(newSelected);
                                  }}
                                  className="rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground capitalize">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {filter.type === 'date-range' && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-muted-foreground">From</label>
                              <input
                                type="date"
                                value={
                                  selectedDateRange.from
                                    ? selectedDateRange.from.toISOString().split('T')[0]
                                    : ''
                                }
                                onChange={e => {
                                  const newRange = {
                                    ...selectedDateRange,
                                    from: e.target.value ? new Date(e.target.value) : undefined,
                                  };
                                  filter.onChange?.(newRange);
                                }}
                                className="w-full px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">To</label>
                              <input
                                type="date"
                                value={
                                  selectedDateRange.to
                                    ? selectedDateRange.to.toISOString().split('T')[0]
                                    : ''
                                }
                                onChange={e => {
                                  const newRange = {
                                    ...selectedDateRange,
                                    to: e.target.value ? new Date(e.target.value) : undefined,
                                  };
                                  filter.onChange?.(newRange);
                                }}
                                className="w-full px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear Filters */}
                {(selectedMealTypes.length > 0 ||
                  selectedDateRange.from ||
                  selectedDateRange.to ||
                  transactionSearch) && (
                  <button
                    onClick={() => {
                      setSelectedMealTypes([]);
                      setSelectedDateRange({});
                      setTransactionSearch('');
                      setTransactionFilters({});
                      setTransactionPage(1);
                    }}
                    className="w-full mt-6 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Transaction Content */}
              <div className="flex-1 flex flex-col">
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
                            {totalTransactionCount}
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
                <div className="flex-1 p-6">
                  {isLoadingTx ? (
                    <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                  ) : (
                    <DynamicTable
                      tableHeading="Filtered Transactions"
                      data={getTransactionTableData(transactions)}
                      isLoading={isLoadingTx}
                      filterMode="ui"
                      page={transactionPage}
                      onPageChange={setTransactionPage}
                      limit={transactionLimit}
                      onLimitChange={setTransactionLimit}
                      total={totalTransactionCount}
                      disableSearch={true}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HelmetWrapper>
  );
};

export default VendorSessionPage;
