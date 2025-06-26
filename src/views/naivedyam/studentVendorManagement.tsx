import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DynamicTable,
  Button,
  HelmetWrapper,
} from '@/components';
import { useStudentVendors } from '@/hooks';

const StudentVendorManagement = () => {
  const { data: studentVendors = [], isLoading } = useStudentVendors();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const getTableData = (studentVendors: any[]) =>
    studentVendors.map(studentVendor => ({
      'student id': studentVendor.student_id,
      'vendor id': studentVendor.vendor_id,
      'start date': studentVendor.start_date,
      ' end date': studentVendor.end_date,
      Active: (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
            studentVendor.is_active
              ? 'bg-success/10 border-success text-success'
              : 'bg-destructive/10 border-destructive text-destructive'
          }`}
        >
          {studentVendor.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      _row: { ...studentVendor },
    }));

  return (
    <HelmetWrapper
      title="StudentVendors | Naivedyam"
      heading="Student Vendors List"
      subHeading="List of student vendors for Naivedyam."
    >
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            tableHeading="Student Vendors"
            data={getTableData(studentVendors)}
            headerActions={
              <div className="flex gap-2">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Vendor</DialogTitle>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            }
          />
        )}
      </div>
    </HelmetWrapper>
  );
};

export default StudentVendorManagement;
