import { useState } from 'react';
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';
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
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
} from '@/hooks/naivedyam/useVendors.hook';
import { FieldType } from '@/types';

const schema: FieldType[] = [
  { name: 'ldap', label: 'LDAP', type: 'text', required: true, columns: 2 },
  { name: 'email', label: 'Email', type: 'text', required: true, columns: 2 },
  { name: 'address', label: 'Address', type: 'text', required: true, columns: 2 },
  { name: 'description', label: 'Description', type: 'textarea', required: true, columns: 2 },
  { name: 'is_active', label: 'Active', type: 'checkbox', required: false, columns: 2 },
];

const VendorsManagement = () => {
  const { data: vendors = [], isLoading } = useVendors();
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const deleteMutation = useDeleteVendor();

  const [editVendor, setEditVendor] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
    toast({ title: 'Vendor updated' });
    setEditVendor(null);
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      ldapid: formData.ldapid,
      email: formData.email,
      address: formData.address,
      description: formData.description,
      is_active: !!formData.is_active,
    });
    toast({ title: 'Vendor created' });
    setCreateDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    toast({ title: 'Vendor deleted' });
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
        className={`px-2 py-0.5 rounded-full border ${value ? 'bg-success/10 border-success text-success' : 'bg-destructive/10 border-destructive text-destructive'} text-xs font-medium`}
      >
        {value ? 'Yes' : 'No'}
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

  return (
    <HelmetWrapper
      title="Vendors | Naivedyam"
      heading="Vendors List"
      subHeading="List of vendors for Naivedyam."
    >
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            tableHeading="Vendors"
            data={getTableData(vendors)}
            customRender={customRender}
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
                    <DynamicForm
                      schema={schema}
                      onSubmit={handleCreate}
                      onCancel={() => setCreateDialogOpen(false)}
                      submitButtonText="Create"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            }
          />
        )}
        <Dialog
          open={!!editVendor}
          onOpenChange={open => {
            if (!open) setEditVendor(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={schema}
              onSubmit={handleUpdate}
              defaultValues={editVendor ?? undefined}
              onCancel={() => setEditVendor(null)}
              submitButtonText="Save"
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default VendorsManagement;
