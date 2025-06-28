import { DynamicTable, HelmetWrapper } from '@/components';
import { useStudentMealSessionTransactions } from '@/hooks/naivedyam/useMealSession.hook';

const StudentTransactionPage = () => {
  const { data = [], isLoading } = useStudentMealSessionTransactions();

  const getTableData = (transactions: any[]) =>
    transactions.map(tx => ({
      'Session ID': tx.session_id,
      'Vendor Name': tx.vendor_name,
      Type: tx.transaction_type,
      'Transaction ID': tx.transaction_id,
      Timestamp: new Date(tx.timestamp).toLocaleString(),
    }));

  return (
    <HelmetWrapper
      title="Student Transactions | Naivedyam"
      heading="Student Transactions"
      subHeading="Your meal session transactions"
    >
      <DynamicTable
        tableHeading="Student Transactions"
        data={getTableData(data)}
        isLoading={isLoading}
      />
    </HelmetWrapper>
  );
};

export default StudentTransactionPage;
