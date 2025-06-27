import { useState, useEffect } from 'react';
import { Button, DynamicTable, HelmetWrapper, toast } from '@/components';
import {
  useCreateMealSession,
  useActiveMealSessions,
  useStopMealSession,
  useTransactionsByMealSession,
} from '@/hooks/naivedyam/useTransaction.hook';

// Extend the Window interface to include 'smartcard'
declare global {
  interface Window {
    electronAPI?: {
      onCardData: (callback: (data: any) => void) => void;
    };
  }
}

const TRANSACTION_TYPES = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snacks', value: 'snacks' },
];

const CreateMealSession = () => {
  const [transactionType, setTransactionType] = useState<string>(TRANSACTION_TYPES[0].value);
  const createMealSession = useCreateMealSession();
  const stopMealSession = useStopMealSession();
  const {
    data: activeSessions = [],
    isLoading: isLoadingSession,
    refetch,
  } = useActiveMealSessions();
  type CardInfo = {
    student_name: string;
    card_data: string;
    // Add other properties if needed
    [key: string]: any;
  };
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);

  useEffect(() => {
    if (window.electronAPI?.onCardData) {
      window.electronAPI.onCardData(data => {
        setCardInfo(data);
        console.log('📥 Card info received in React:', data);
      });
    }
  }, []);

  // There will be at most one active session
  const activeSession = activeSessions[0];

  // Fetch transactions for the active session (if any)
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useTransactionsByMealSession(activeSession?.id ?? '', !!activeSession);

  const handleCreate = async () => {
    try {
      await createMealSession.mutateAsync({
        transaction_type: transactionType,
        id: '',
        vendor_id: '',
        time_start: '',
        time_end: '',
      });
      toast({ title: 'Meal session created' });
      refetch();
    } catch (e: any) {
      toast({
        title: 'Failed to create meal session',
        description: e?.message,
        variant: 'destructive',
      });
    }
  };

  const handleStop = async (id: string) => {
    try {
      await stopMealSession.mutateAsync(id);
      toast({ title: 'Meal session stopped' });
      refetch();
      refetchTransactions();
    } catch (e: any) {
      toast({
        title: 'Failed to stop meal session',
        description: e?.message,
        variant: 'destructive',
      });
    }
  };

  // Table for transactions of the active session
  const getTransactionTableData = (txs: any[]) =>
    txs.map(tx => ({
      'Transaction ID': tx.transaction_id,
      'Student ID': tx.student_id,
      'Vendor ID': tx.vendor_id,
      Timestamp: new Date(tx.timestamp).toLocaleString(),
    }));

  return (
    <HelmetWrapper
      title="Create Meal Session | Naivedyam"
      heading="Create Meal Session"
      subHeading="Start a new meal session and view transactions for the active session."
    >
      {/* If there is NO active session, show the create form */}
      {!activeSession && (
        <div className="flex items-center gap-4 mb-6">
          <select
            value={transactionType}
            onChange={e => setTransactionType(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {TRANSACTION_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <Button onClick={handleCreate}>
            {createMealSession.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      )}

      {/* If there is an active session, show its info and stop button */}
      {activeSession && (
        <div className="mb-6 flex flex-col gap-2">
          <div className="font-semibold">
            <span className="mr-4">Active Session:</span>
            <span>
              Type: <b>{activeSession.transaction_type}</b>
            </span>
            <span className="ml-4">
              Vendor ID: <b>{activeSession.vendor_id}</b>
            </span>
          </div>
          <div>
            {cardInfo ? (
              <div>
                <h3>Card Read Successfully</h3>
                <p>
                  <strong>Name:</strong> {cardInfo.student_name}
                </p>
                <p>
                  <strong>Institute ID:</strong> {cardInfo.card_data}
                </p>
              </div>
            ) : (
              <p>Waiting for card tap...</p>
            )}
          </div>
          <Button
            variant="destructive"
            onClick={() => handleStop(activeSession.id)}
            disabled={stopMealSession.isPending}
          >
            {stopMealSession.isPending ? 'Stopping...' : 'Stop Session'}
          </Button>
        </div>
      )}

      <DynamicTable
        tableHeading={
          activeSession ? 'Transactions for Active Meal Session' : 'No Active Meal Session'
        }
        data={activeSession ? getTransactionTableData(transactions) : []}
        isLoading={isLoadingSession || (activeSession && isLoadingTransactions)}
      />
    </HelmetWrapper>
  );
};

export default CreateMealSession;
