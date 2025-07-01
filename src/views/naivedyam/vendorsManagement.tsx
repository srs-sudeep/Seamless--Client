import { useState, useMemo } from 'react';
import {
  Loader2,
  Pencil,
  Trash2,
  Store,
  Mail,
  MapPin,
  FileText,
  Activity,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  CheckCircle,
} from 'lucide-react';
import {
  DynamicForm,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DynamicTable,
  Button,
  HelmetWrapper,
  toast,
} from '@/components';
import { useVendors, useUpdateVendor, useDeleteVendor } from '@/hooks';
import { FieldType } from '@/types';

const schema: FieldType[] = [
  { name: 'ldap', label: 'LDAP', type: 'text', required: true, columns: 2 },
  { name: 'email', label: 'Email', type: 'text', required: true, columns: 2 },
  { name: 'address', label: 'Address', type: 'text', required: true, columns: 2 },
  { name: 'description', label: 'Description', type: 'textarea', required: true, columns: 2 },
  { name: 'is_active', label: 'Active', type: 'checkbox', required: false, columns: 2 },
];

const VendorsManagement = () => {
  const { data: vendors = [], isFetching } = useVendors();
  const updateMutation = useUpdateVendor();
  const deleteMutation = useDeleteVendor();

  const [editVendor, setEditVendor] = useState<any | null>(null);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(vendor => vendor.is_active).length;
    const inactiveVendors = vendors.filter(vendor => !vendor.is_active).length;

    // Get unique locations (simplified by taking first word of address)
    const locations = new Set(vendors.map(vendor => vendor.address?.split(' ')[0] || 'Unknown'));
    const uniqueLocations = locations.size;

    // Calculate vendors with email
    const vendorsWithEmail = vendors.filter(vendor => vendor.email).length;

    return {
      totalVendors,
      activeVendors,
      inactiveVendors,
      uniqueLocations,
      vendorsWithEmail,
      activePercentage: totalVendors > 0 ? Math.round((activeVendors / totalVendors) * 100) : 0,
    };
  }, [vendors]);

  const handleEdit = (vendor: any) => setEditVendor(vendor);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editVendor) return;
    await updateMutation.mutateAsync({
      id: editVendor.id,
      payload: {
        ldapid: formData.ldapid,
        email: formData.email,
        address: formData.address,
        description: formData.description,
        is_active: formData.is_active,
      },
    });
    toast({ title: 'Vendor updated successfully' });
    setEditVendor(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    toast({ title: 'Vendor deleted successfully' });
  };

  const customRender = {
    Edit: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={e => {
          e.stopPropagation();
          handleEdit(row._row);
        }}
      >
        <Pencil className="w-4 h-4" />
      </Button>
    ),
    Delete: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={e => {
          e.stopPropagation();
          handleDelete(row._row.id);
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
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          value
            ? 'bg-success/10 border-success text-success'
            : 'bg-destructive/10 border-destructive text-destructive'
        }`}
      >
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
  };

  const getTableData = (vendors: any[]) =>
    vendors.map(vendor => ({
      LDAP: vendor.ldapid,
      Email: vendor.email,
      Address: vendor.address,
      Description: vendor.description,
      Active: vendor.is_active,
      Edit: '',
      Delete: '',
      _row: { ...vendor },
    }));

  if (isFetching && vendors.length === 0) {
    return (
      <HelmetWrapper
        title="Vendors | Naivedyam"
        heading="Vendor Management"
        subHeading="Comprehensive vendor management and service provider directory"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading vendor data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Vendors | Naivedyam"
      heading="Vendor Management"
      subHeading="Comprehensive vendor management and service provider directory with real-time analytics"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Vendors</p>
                <p className="text-2xl font-bold text-card-blue">{statistics.totalVendors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Active Vendors</p>
                <p className="text-2xl font-bold text-card-green">{statistics.activeVendors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Locations</p>
                <p className="text-2xl font-bold text-card-purple">{statistics.uniqueLocations}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Active Rate</p>
                <p className="text-2xl font-bold text-card-orange">
                  {statistics.activePercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Vendors Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Vendor Directory
            </h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive management of meal service vendors with contact information and status
              tracking
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Vendors"
              data={getTableData(vendors)}
              customRender={customRender}
              isLoading={isFetching}
            />
          </div>
        </div>

        {/* Vendor Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Vendor Status</h3>
                <p className="text-sm text-muted-foreground">Current vendor activity breakdown</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Active Vendors</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-lg font-bold text-foreground">
                    {statistics.activeVendors}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Inactive Vendors</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span className="text-lg font-bold text-foreground">
                    {statistics.inactiveVendors}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Email Coverage</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-info"></div>
                  <span className="text-lg font-bold text-foreground">
                    {statistics.vendorsWithEmail}
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
                <p className="text-sm text-muted-foreground">Vendor management operations</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Pencil className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Click edit icon to update vendor information
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Toggle vendor active status as needed</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Trash2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Remove inactive or obsolete vendors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Information Guide */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-background" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Vendor Information Guide</h3>
              <p className="text-sm text-muted-foreground">
                Understanding vendor data fields and management
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">LDAP Integration</span>
                  <p className="text-sm text-muted-foreground">
                    Unique identifier for authentication
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Mail className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Email Contact</span>
                  <p className="text-sm text-muted-foreground">Primary communication channel</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Location Details</span>
                  <p className="text-sm text-muted-foreground">Physical address and service area</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Activity className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Status Management</span>
                  <p className="text-sm text-muted-foreground">
                    Active/inactive service availability
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Edit Dialog */}
      <Dialog
        open={!!editVendor}
        onOpenChange={open => {
          if (!open) setEditVendor(null);
        }}
      >
        <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Pencil className="w-6 h-6 text-primary" />
              Edit Vendor Information
            </DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={schema}
            onSubmit={handleUpdate}
            defaultValues={editVendor ?? undefined}
            onCancel={() => setEditVendor(null)}
            submitButtonText={updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            disabled={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default VendorsManagement;
