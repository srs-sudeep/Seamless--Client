import {
  Button,
  DynamicTable,
  HelmetWrapper,
  toast,
  ErrorModal,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components';
import {
  useActiveMealSessions,
  useCreateMealSession,
  useCreateTransaction,
  useStopMealSession,
  useTransactionsByMealSession,
} from '@/hooks';
import { useEffect, useState } from 'react';
import {
  Play,
  Square,
  Clock,
  CreditCard,
  Zap,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Extend the Window interface to include 'smartcard'
declare global {
  interface Window {
    electronAPI?: {
      onCardData: (callback: (data: any) => void) => void;
    };
  }
}

const TRANSACTION_TYPES = [
  { label: 'Breakfast', value: 'breakfast', icon: '🌅', color: 'bg-card-orange-gradient' },
  { label: 'Lunch', value: 'lunch', icon: '☀️', color: 'bg-card-green-gradient' },
  { label: 'Dinner', value: 'dinner', icon: '🌙', color: 'bg-card-blue-gradient' },
  { label: 'Snacks', value: 'snacks', icon: '🍪', color: 'bg-card-purple-gradient' },
];

const CreateMealSession = () => {
  const [transactionType, setTransactionType] = useState<string>(TRANSACTION_TYPES[0].value);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const createMealSession = useCreateMealSession();
  const stopMealSession = useStopMealSession();
  const createTransaction = useCreateTransaction();

  const { data: activeSessions = [], isLoading: isLoadingSession } = useActiveMealSessions();

  type CardInfo = {
    student_name: string;
    card_data: string;
    [key: string]: any;
  };

  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);

  // There will be at most one active session
  const activeSession = activeSessions[0];

  // Fetch transactions for the active session (if any)
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useTransactionsByMealSession(activeSession?.id ?? '', !!activeSession);

  const handleCreateTransaction = async (studentId: string, studentName: string) => {
    if (!activeSession) {
      setErrorModal({
        isOpen: true,
        title: 'No Active Session',
        message: 'Please create a meal session first before processing transactions.',
      });
      return;
    }

    try {
      const transactionData = {
        meal_session_id: activeSession.id,
        student_id: studentId,
        vendor_id: activeSession.vendor_id,
        timestamp: new Date().toISOString(),
        transaction_id: '',
      };

      await createTransaction.mutateAsync(transactionData);

      toast({
        title: 'Transaction Created',
        description: `Transaction successful for ${studentName}`,
      });

      setCardInfo(null);
    } catch (e: any) {
      console.error('Transaction error:', e);

      let errorTitle = 'Transaction Failed';
      let errorMessage = e?.message || 'An unknown error occurred';

      if (e?.response?.status === 409) {
        errorTitle = 'Duplicate Transaction';
        errorMessage = 'This student has already made a transaction for this meal session.';
      } else if (e?.response?.status === 404) {
        errorTitle = 'Student Not Found';
        errorMessage = 'The student with this card ID was not found in the system.';
      } else if (e?.response?.status === 400) {
        errorTitle = 'Invalid Transaction';
        errorMessage = e?.response?.data?.detail || 'The transaction data is invalid.';
      }

      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
      });
    }
  };

  useEffect(() => {
    if (window.electronAPI?.onCardData) {
      window.electronAPI.onCardData(data => {
        setCardInfo(data);
        if (activeSession && data.card_data) {
          handleCreateTransaction(data.card_data, data.student_name);
        }
      });
    }
  }, [activeSession]);

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
    } catch (e: any) {
      toast({
        title: 'Failed to stop meal session',
        description: e?.message,
        variant: 'destructive',
      });
    }
  };

  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      title: '',
      message: '',
    });
    setCardInfo(null);
  };

  // Get current meal type details
  const getCurrentMealType = () => {
    return TRANSACTION_TYPES.find(
      type => type.value === (activeSession?.transaction_type || transactionType)
    );
  };

  // Table for transactions of the active session
  const getTransactionTableData = (txs: any[]) =>
    txs.map(tx => ({
      'Transaction ID': tx.transaction_id,
      'Student ID': tx.student_id,
      'Vendor ID': tx.vendor_id,
      Timestamp: new Date(tx.timestamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }));

  return (
    <HelmetWrapper
      title="Create Meal Session | Naivedyam"
      heading="Meal Session Control"
      subHeading="Manage meal sessions and process student transactions in real-time"
    >
      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeErrorModal}
        title={errorModal.title}
        message={errorModal.message}
      />

      <div className="space-y-8">
        {/* Session Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Session Status Card */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border-2 border-border shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Session Status
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    activeSession
                      ? 'bg-success/10 text-success'
                      : 'bg-muted-foreground text-foreground'
                  }`}
                >
                  {activeSession ? 'Active' : 'Inactive'}
                </div>
              </div>

              {activeSession ? (
                <div className="space-y-4">
                  <div className={`${getCurrentMealType()?.color} rounded-xl p-4 text-background`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCurrentMealType()?.icon}</span>
                      <div>
                        <h4 className="text-lg font-bold">{getCurrentMealType()?.label} Session</h4>
                        <p className="text-background/90 text-sm">
                          Vendor: {activeSession.vendor_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{transactions.length} transactions processed</span>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleStop(activeSession.id)}
                      disabled={stopMealSession.isPending}
                      className="flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      {stopMealSession.isPending ? 'Stopping...' : 'Stop Session'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No active session</p>
                  <p className="text-sm text-muted-foreground">
                    Create a new session to start processing transactions
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border-2 border-primary/20">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Transactions</span>
                <span className="font-bold text-lg text-primary">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Session Type</span>
                <span className="font-semibold">{activeSession?.transaction_type || 'None'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-1">
                  {activeSession ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {activeSession ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Session Form */}
        {!activeSession && (
          <div className="bg-gradient-to-br from-background to-accent/10 rounded-2xl p-6 border-2 border-accent/20 shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-primary" />
              Start New Session
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Meal Type
                </label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger className="w-full h-12 bg-background">
                    <SelectValue placeholder="Choose meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleCreate}
                  disabled={createMealSession.isPending}
                  size="lg"
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {createMealSession.isPending ? 'Creating...' : 'Start Session'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Card Reader Section */}
        {activeSession && (
          <div className="bg-gradient-to-br from-background to-muted/20 rounded-2xl p-6 border-2 border-border shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Card Reader
            </h3>

            <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-6 border border-border">
              {cardInfo ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h4 className="text-lg font-bold text-success mb-2">Processing Transaction...</h4>
                  <div className="bg-background rounded-lg p-4 mb-4 border">
                    <p className="text-sm text-muted-foreground mb-1">Student Name</p>
                    <p className="font-semibold text-lg">{cardInfo.student_name}</p>
                    <p className="text-sm text-muted-foreground mb-1 mt-3">Student ID</p>
                    <p className="font-mono text-sm">{cardInfo.card_data}</p>
                  </div>
                  {createTransaction.isPending && (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-primary font-medium">Creating transaction...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 border-4 border-dashed border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-primary/50" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Ready for Card Tap</h4>
                  <p className="text-muted-foreground">
                    Please tap a student card to process transaction
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm text-primary font-medium">Waiting...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <DynamicTable
          tableHeading={
            activeSession ? 'Transactions for Active Meal Session' : 'No Active Meal Session'
          }
          data={activeSession ? getTransactionTableData(transactions) : []}
          isLoading={isLoadingSession || (activeSession && isLoadingTransactions)}
        />
      </div>
    </HelmetWrapper>
  );
};

export default CreateMealSession;
