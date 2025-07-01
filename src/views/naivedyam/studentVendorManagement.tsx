import { useState, useMemo } from 'react';
import {
  Loader2,
  Trash2,
  Plus,
  Users,
  Store,
  Calendar,
  Activity,
  Target,
  TrendingUp,
  UserCheck,
  CalendarDays,
} from 'lucide-react';
import {
  DynamicForm,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DynamicTable,
  Button,
  HelmetWrapper,
  toast,
} from '@/components';
import { useStudentVendors, useCreateStudentVendor, useDeleteStudentVendor } from '@/hooks';
import type { StudentVendor } from '@/types';

const schema = [
  { name: 'student_id', label: 'Student ID', type: 'text', required: true, columns: 2 },
  { name: 'vendor_id', label: 'Vendor ID', type: 'text', required: true, columns: 2 },
  { name: 'start_date', label: 'Start Date', type: 'date', required: true, columns: 2 },
  { name: 'end_date', label: 'End Date', type: 'date', required: false, columns: 2 },
];

const StudentVendorManagement = () => {
  const { data: studentVendors = [], isFetching } = useStudentVendors();
  const createMutation = useCreateStudentVendor();
  const deleteMutation = useDeleteStudentVendor();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalAssociations = studentVendors.length;
    const activeAssociations = studentVendors.filter(sv => sv.is_active).length;
    const inactiveAssociations = studentVendors.filter(sv => !sv.is_active).length;
    const uniqueStudents = new Set(studentVendors.map(sv => sv.student_id)).size;
    const uniqueVendors = new Set(studentVendors.map(sv => sv.vendor_id)).size;

    // Calculate associations expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = studentVendors.filter(sv => {
      if (!sv.end_date || !sv.is_active) return false;
      const endDate = new Date(sv.end_date);
      return endDate <= thirtyDaysFromNow && endDate >= new Date();
    }).length;

    // Vendor distribution
    const vendorDistribution: Record<string, number> = {};
    studentVendors.forEach(sv => {
      vendorDistribution[sv.vendor_id] = (vendorDistribution[sv.vendor_id] || 0) + 1;
    });

    return {
      totalAssociations,
      activeAssociations,
      inactiveAssociations,
      uniqueStudents,
      uniqueVendors,
      expiringSoon,
      vendorDistribution,
    };
  }, [studentVendors]);

  const handleDelete = async (studentVendor: StudentVendor) => {
    await deleteMutation.mutateAsync({
      student_id: studentVendor.student_id,
      vendor_id: studentVendor.vendor_id,
    });
    toast({ title: 'Student Vendor deleted' });
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      student_id: formData.student_id,
      vendor_id: formData.vendor_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
    });
    toast({ title: 'Student Vendor created' });
    setCreateDialogOpen(false);
  };

  const customRender = {
    Delete: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={e => {
          e.stopPropagation();
          handleDelete(row._row);
        }}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    ),
    Active: (value: boolean) => (
      <span
        className={`px-2 py-0.5 rounded-full border ${
          value
            ? 'bg-success/10 border-success text-success'
            : 'bg-destructive/10 border-destructive text-destructive'
        } text-xs font-medium`}
      >
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
  };

  const getTableData = (studentVendors: StudentVendor[]) =>
    studentVendors.map(sv => ({
      'Student ID': sv.student_id,
      'Vendor ID': sv.vendor_id,
      'Start Date': sv.start_date,
      'End Date': sv.end_date,
      Active: sv.is_active,
      Delete: '',
      _row: { ...sv },
    }));

  if (isFetching && studentVendors.length === 0) {
    return (
      <HelmetWrapper
        title="Student Vendors | Naivedyam"
        heading="Student Vendor Management"
        subHeading="Comprehensive student-vendor association management system"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading student vendor data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Student Vendors | Naivedyam"
      heading="Student Vendor Management"
      subHeading="Comprehensive student-vendor association management with real-time tracking and analytics"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Associations</p>
                <p className="text-2xl font-bold text-card-blue">{statistics.totalAssociations}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Active</p>
                <p className="text-2xl font-bold text-card-green">
                  {statistics.activeAssociations}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Unique Students</p>
                <p className="text-2xl font-bold text-card-purple">{statistics.uniqueStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Active Vendors</p>
                <p className="text-2xl font-bold text-card-orange">{statistics.uniqueVendors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Updated Active status badges */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
            <span className="text-sm font-medium text-muted-foreground">Active Associations</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-status-active"></div>
              <span className="text-lg font-bold text-foreground">
                {statistics.activeAssociations}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
            <span className="text-sm font-medium text-muted-foreground">Inactive Associations</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-status-inactive"></div>
              <span className="text-lg font-bold text-foreground">
                {statistics.inactiveAssociations}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
            <span className="text-sm font-medium text-muted-foreground">Expiring Soon</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-lg font-bold text-foreground">{statistics.expiringSoon}</span>
            </div>
          </div>
        </div>

        {/* Association Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Association Status</h3>
                <p className="text-sm text-muted-foreground">Current association breakdown</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Active Associations
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-lg font-bold text-foreground">
                    {statistics.activeAssociations}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Inactive Associations
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span className="text-lg font-bold text-foreground">
                    {statistics.inactiveAssociations}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Expiring Soon</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-lg font-bold text-foreground">
                    {statistics.expiringSoon}
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
                <p className="text-sm text-muted-foreground">Manage student-vendor associations</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Plus className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Create new student-vendor associations</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Set start and end dates for associations
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Trash2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Remove expired or inactive associations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Distribution */}
        {Object.keys(statistics.vendorDistribution).length > 0 && (
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Vendor Distribution</h3>
                <p className="text-sm text-muted-foreground">Student associations per vendor</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(statistics.vendorDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8) // Show top 8 vendors
                .map(([vendorId, count]) => (
                  <div
                    key={vendorId}
                    className="bg-background rounded-xl p-4 border border-border shadow-sm"
                  >
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1 truncate" title={vendorId}>
                        {vendorId.length > 12 ? `${vendorId.slice(0, 12)}...` : vendorId}
                      </div>
                      <div className="text-xl font-bold text-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground">students</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Association Management Guide */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Association Management Guide</h3>
              <p className="text-sm text-muted-foreground">
                Best practices for managing associations
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
              <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Regularly review active associations
                </p>
                <p className="text-xs text-muted-foreground">
                  Ensure all active associations are up-to-date and necessary.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
              <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Set clear start and end dates</p>
                <p className="text-xs text-muted-foreground">
                  Define the duration of each association to avoid confusion.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
              <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg">
                <Trash2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Remove unnecessary associations
                </p>
                <p className="text-xs text-muted-foreground">
                  Delete associations that are no longer needed to keep the list manageable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Vendor Table */}
        <DynamicTable
          tableHeading="Student Vendors"
          data={getTableData(studentVendors)}
          customRender={customRender}
          isLoading={isFetching}
          headerActions={
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Student Vendor
            </Button>
          }
        />
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <div />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Student Vendor</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={schema}
              onSubmit={handleCreate}
              onCancel={() => setCreateDialogOpen(false)}
              submitButtonText={createMutation.isPending ? 'Creating...' : 'Create'}
              disabled={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default StudentVendorManagement;
