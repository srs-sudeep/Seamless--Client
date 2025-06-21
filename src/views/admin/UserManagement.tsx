import { HelmetWrapper, Sheet, SheetContent, SheetTitle, DynamicTable, toast } from '@/components';
import { useUsers, useAssignRoleToUser, useRemoveRoleFromUser } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { UserAPI, UserRoleAPI, FilterConfig } from '@/types';

const UserManagement = () => {
  const { data: users = [], isLoading } = useUsers();
  const assignRoleToUser = useAssignRoleToUser();
  const removeRoleFromUser = useRemoveRoleFromUser();

  const [editUser, setEditUser] = useState<UserAPI | null>(null);

  useEffect(() => {
    if (!editUser) return;
    const updated = users.find(u => u.ldapid === editUser.ldapid);
    if (updated) setEditUser(updated);
  }, [users, editUser?.ldapid]);

  const getTableData = (users: UserAPI[]) =>
    users.map(user => ({
      Name: user.name,
      'Ldap Id': user.ldapid,
      'Id Number': user.idNumber,
      Active: user.is_active,
      Roles: user.roles
        .filter(r => r.isAssigned)
        .map(role => ({
          label: role.name,
          value: role.role_id,
        })),
      _row: user,
    }));
  const allRoles = Array.from(new Set(users.flatMap(u => u.roles.map(r => r.name)))).sort();

  const filterConfig: FilterConfig[] = [
    {
      column: 'Active',
      type: 'dropdown',
      options: ['Active', 'Inactive'],
    },
    {
      column: 'Roles',
      type: 'multi-select',
      options: allRoles,
    },
  ];

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
            }))}
            customRender={customRender}
            onRowClick={row => setEditUser(row._row)}
            filterConfig={filterConfig}
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
              min-h-fit max-h-[100vh]
              sm:w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw]
              bg-card border-l border-border
              shadow-2xl
              overflow-hidden
              flex flex-col
              rounded-l-xl
            "
            style={{ width: '90vw', maxWidth: '1200px' }}
          >
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-6">
                {editUser && (
                  <>
                    {/* Header */}
                    <div className="border-b border-border pb-4">
                      <h2 className="text-3xl font-bold text-foreground mb-2">User Details</h2>
                      <p className="text-sm text-muted-foreground">
                        Manage user information and role assignments
                      </p>
                    </div>

                    {/* User Information Card */}
                    <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm font-medium text-muted-foreground">Name</span>
                          <span className="text-sm font-semibold text-foreground">
                            {editUser.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm font-medium text-muted-foreground">LDAP ID</span>
                          <span className="text-sm font-mono text-foreground">
                            {editUser.ldapid}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm font-medium text-muted-foreground">
                            ID Number
                          </span>
                          <span className="text-sm font-mono text-foreground">
                            {editUser.idNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              editUser.is_active
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}
                          >
                            {editUser.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Current Roles Display */}
                    <div className="bg-muted/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Currently Assigned Roles
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {editUser.roles.filter(r => r.isAssigned).length > 0 ? (
                          editUser.roles
                            .filter(r => r.isAssigned)
                            .map(role => (
                              <span
                                key={role.role_id}
                                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                              >
                                {role.name}
                              </span>
                            ))
                        ) : (
                          <div className="w-full text-center py-8">
                            <span className="text-muted-foreground text-sm">
                              No roles currently assigned
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role Management */}
                    <div className="bg-muted/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Manage Role Assignments
                      </h3>
                      <div className="space-y-3">
                        {editUser.roles.map((role: UserRoleAPI) => {
                          const isLoading =
                            assignRoleToUser.isPending || removeRoleFromUser.isPending;
                          const checked = !!role.isAssigned;
                          return (
                            <div
                              key={role.role_id}
                              className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{role.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Role ID: {role.role_id}
                                </span>
                              </div>
                              <button
                                type="button"
                                className={`
                                  relative w-12 h-6 flex items-center rounded-full p-1 
                                  transition-all duration-200 ease-in-out
                                  ${
                                    checked
                                      ? 'bg-green-500 shadow-inner'
                                      : 'bg-muted-foreground/20 shadow-inner'
                                  } 
                                  ${
                                    isLoading
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'cursor-pointer hover:scale-105'
                                  }
                                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
                                `}
                                disabled={isLoading}
                                aria-pressed={checked}
                                aria-label={`${checked ? 'Remove' : 'Assign'} ${role.name} role`}
                                onClick={() => {
                                  if (isLoading) return;
                                  if (checked) {
                                    removeRoleFromUser.mutate(
                                      { user_id: editUser.ldapid, role_id: role.role_id },
                                      {
                                        onSuccess: () =>
                                          toast({
                                            title: 'Role removed successfully',
                                            description: `${role.name} has been removed from ${editUser.name}`,
                                          }),
                                      }
                                    );
                                  } else {
                                    assignRoleToUser.mutate(
                                      { user_id: editUser.ldapid, role_id: role.role_id },
                                      {
                                        onSuccess: () =>
                                          toast({
                                            title: 'Role assigned successfully',
                                            description: `${role.name} has been assigned to ${editUser.name}`,
                                          }),
                                      }
                                    );
                                  }
                                }}
                              >
                                <span
                                  className={`
                                    bg-background w-4 h-4 rounded-full shadow-sm
                                    transform transition-transform duration-200 ease-in-out
                                    ${checked ? 'translate-x-6' : 'translate-x-0'}
                                  `}
                                />
                                {isLoading && (
                                  <Loader2 className="absolute inset-0 m-auto w-3 h-3 animate-spin text-foreground" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </HelmetWrapper>
  );
};

export default UserManagement;
