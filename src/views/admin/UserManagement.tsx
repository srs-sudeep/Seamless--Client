import {
  HelmetWrapper,
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  DynamicTable,
  toast,
} from '@/components';
import { useUsers, useAssignRoleToUser, useRemoveRoleFromUser } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { UserAPI, UserRoleAPI } from '@/types';

const UserManagement = () => {
  const { data: users = [], isLoading } = useUsers();
  const assignRoleToUser = useAssignRoleToUser();
  const removeRoleFromUser = useRemoveRoleFromUser();

  const [editUser, setEditUser] = useState<UserAPI | null>(null);

  // Sync editUser with latest users data after mutation
  useEffect(() => {
    if (!editUser) return;
    const updated = users.find(u => u.ldapid === editUser.ldapid);
    if (updated) setEditUser(updated);
  }, [users, editUser?.ldapid]);

  // Table data
  const getTableData = (users: UserAPI[]) =>
    users.map(user => ({
      Name: user.name,
      'User ID': user.ldapid,
      'ID Number': user.idNumber,
      Active: user.is_active,
      Roles: user.roles
        .filter(r => r.isAssigned)
        .map(role => ({
          label: role.name,
          value: role.role_id,
        })),
      _row: user,
    }));

  // Custom render for table
  const customRender = {
    Active: (value: boolean) => (
      <span className={value ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
    Roles: (_: any, row: any) => (
      <div className="flex flex-wrap gap-1">
        {row._row.roles.filter((r: UserRoleAPI) => r.isAssigned).length > 0 ? (
          row._row.roles
            .filter((r: UserRoleAPI) => r.isAssigned)
            .map((role: UserRoleAPI) => (
              <span
                key={role.role_id}
                className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200"
              >
                {role.name}
              </span>
            ))
        ) : (
          <span className="text-gray-400 text-xs">No Roles</span>
        )}
      </div>
    ),
  };

  return (
    <HelmetWrapper
      title="Users | Seamless"
      heading="User Management"
      subHeading="Manage users, roles, and permissions for your organization."
    >
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            data={getTableData(users).map(row => ({
              ...row,
              Roles: customRender.Roles('', row),
              Active: customRender.Active(row.Active),
            }))}
            customRender={{}}
            className="bg-background rounded-xl"
            onRowClick={row => setEditUser(row._row)}
          />
        )}

        {/* Edit Roles Side Panel */}
        <Sheet open={!!editUser} onOpenChange={open => !open && setEditUser(null)}>
          <SheetTitle style={{ display: 'none' }} />
          <SheetContent
            side="right"
            className="
              p-0
              fixed right-0 top-1/2 -translate-y-1/2
              h-auto rounded-lg shadow-lg bg-background
              min-h-[300px]
              flex flex-col justify-center
              w-full
              sm:w-[90vw]
              md:min-w-[60vw]
              lg:min-w-[50vw]
              max-w-2xl
              max-h-[80vh]
              overflow-y-auto
            "
          >
            <div className="p-6">
              {editUser && (
                <>
                  <h2 className="text-2xl font-semibold mb-4">User Details</h2>
                  <div className="mb-6 space-y-2">
                    <div>
                      <span className="font-semibold">Name:</span> {editUser.name}
                    </div>
                    <div>
                      <span className="font-semibold">User ID:</span> {editUser.ldapid}
                    </div>
                    <div>
                      <span className="font-semibold">ID Number:</span> {editUser.idNumber}
                    </div>
                    <div>
                      <span className="font-semibold">Active:</span>{' '}
                      <span
                        className={
                          editUser.is_active
                            ? 'text-green-600 font-semibold'
                            : 'text-red-600 font-semibold'
                        }
                      >
                        {editUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Assigned Roles:</span>{' '}
                      {editUser.roles.filter(r => r.isAssigned).length > 0 ? (
                        editUser.roles
                          .filter(r => r.isAssigned)
                          .map(role => (
                            <span
                              key={role.role_id}
                              className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200"
                            >
                              {role.name}
                            </span>
                          ))
                      ) : (
                        <span className="text-gray-400 text-xs ml-1">No Roles</span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Edit Roles</h3>
                  <div className="space-y-4">
                    {editUser.roles.map((role: UserRoleAPI) => {
                      const isLoading = assignRoleToUser.isPending || removeRoleFromUser.isPending;
                      const checked = !!role.isAssigned;
                      return (
                        <div
                          key={role.role_id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <span className="font-medium">{role.name}</span>
                          <button
                            type="button"
                            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${
                              checked ? 'bg-green-500' : 'bg-gray-300'
                            } ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={isLoading}
                            aria-pressed={checked}
                            onClick={() => {
                              if (isLoading) return;
                              if (checked) {
                                removeRoleFromUser.mutate(
                                  { user_id: editUser.ldapid, role_id: role.role_id },
                                  {
                                    onSuccess: () => toast({ title: 'Role removed' }),
                                  }
                                );
                              } else {
                                assignRoleToUser.mutate(
                                  { user_id: editUser.ldapid, role_id: role.role_id },
                                  {
                                    onSuccess: () => toast({ title: 'Role assigned' }),
                                  }
                                );
                              }
                            }}
                          >
                            <span
                              className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
                                checked ? 'translate-x-5' : ''
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <Button className="mt-6" onClick={() => setEditUser(null)}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </HelmetWrapper>
  );
};

export default UserManagement;
