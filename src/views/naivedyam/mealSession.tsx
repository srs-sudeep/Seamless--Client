import { Button, DynamicTable, HelmetWrapper, Sheet, SheetContent, SheetTitle } from '@/components';
import { useMealSessions, useMealSessionTransactions } from '@/hooks';
import { useState } from 'react';

const MealSessionPage = () => {
  const { data: sessions = [], isLoading } = useMealSessions();
  const [sidePanel, setSidePanel] = useState<{ open: boolean; sessionId?: string }>({
    open: false,
  });

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
        <span role="img" aria-label="transactions">
          📄
        </span>
      </Button>
    ),
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

  return (
    <HelmetWrapper
      title="Meal Sessions | Naivedyam"
      heading="Meal Sessions"
      subHeading="List of all meal sessions."
    >
      <DynamicTable
        tableHeading="Meal Sessions"
        data={getTableData(sessions)}
        isLoading={isLoading}
        customRender={customRender}
      />

      {/* Side Panel for Transactions */}
      <Sheet
        open={sidePanel.open}
        onOpenChange={open => {
          if (!open) setSidePanel({ open: false, sessionId: undefined });
        }}
      >
        <SheetTitle style={{ display: 'none' }} />
        <SheetContent
          side="right"
          className="p-0 fixed right-0 top-1/2 -translate-y-1/2 min-h-fit max-h-[100vh] sm:w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] bg-card border-l border-border shadow-2xl overflow-hidden flex flex-col rounded-l-xl"
          style={{ width: '90vw', maxWidth: '800px' }}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Meal Session Transactions
                </h2>
                <p className="text-sm text-muted-foreground">
                  List of transactions for session{' '}
                  <span className="font-semibold">{sidePanel.sessionId}</span>
                </p>
              </div>
              <DynamicTable
                tableHeading="Transactions"
                data={getTransactionTableData(transactions)}
                isLoading={isLoadingTx}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HelmetWrapper>
  );
};

export default MealSessionPage;
