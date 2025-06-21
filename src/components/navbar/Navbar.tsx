import {
  AppLogo,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  LoadingFallback,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  UserAvatar,
  useToast,
} from '@/components';
import { useSidebar } from '@/core';
import { useIsMobile } from '@/hooks';
import { getDashboardLink } from '@/lib/redirect';
import { useAuthStore } from '@/store';
import { ThemeSwitcher } from '@/theme';
import { notifications, UserRole } from '@/types';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, User } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
export const Navbar = () => {
  const { user, logout, setCurrentRole, currentRole } = useAuthStore();
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = async (role: UserRole) => {
    if (currentRole === role) return;
    try {
      setIsChangingRole(true);
      setShowLoader(true);
      setCurrentRole(role);
      navigate(getDashboardLink(role));
      toast({
        title: 'Role Change Successful',
        description: `Switched to ${role} role successfully.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to change role:', error);
      toast({
        title: 'Role Change Failed',
        description: 'Unable to switch roles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => {
        setIsChangingRole(false);
        setShowLoader(false);
      }, 800);
    }
  };

  // Get current page name from path
  const getPageName = () => {
    const path = location.pathname.split('/');
    return path[1]?.charAt(0).toUpperCase() + path[1]?.slice(1);
  };

  const getBreadcrumbItems = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const name = path.charAt(0).toUpperCase() + path.slice(1);
      return { name, url };
    });
  };

  if (isMobile) {
    return (
      <div className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b rounded-b-xl shadow-2xl py-3 bg-[#0b14374d]/5 dark:bg-white/8 backdrop-blur-theme">
        <div className="md:hidden mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={toggleSidebar}>
                <Menu className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Toggle Sidebar</TooltipContent>
          </Tooltip>
        </div>
        <div className="text-sm font-semibold text-muted-foreground">
          <AppLogo horizontal imgClassname="w-[80vw] h-[7vh]" />
        </div>
        <div className="flex flex-row">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeSwitcher />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">Toggle Theme</TooltipContent>
          </Tooltip>
          <Drawer direction="bottom">
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserAvatar name={user?.name || 'User'} role={currentRole || ''} showInfo={false} />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-4 space-y-4 w-[100vw] rounded-t-3xl">
              <DrawerHeader>
                <DrawerTitle className="text-lg">Quick Menu</DrawerTitle>
              </DrawerHeader>

              <div className="space-y-4">
                {/* Notifications */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`px-4 py-2 text-sm border-b last:border-0 ${n.read ? 'opacity-60' : ''}`}
                      >
                        <div className="font-semibold">{n.title}</div>
                        <p className="text-xs">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Switch */}
                {user?.roles && user.roles.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">Switch Role</p>
                    <div className="space-y-1">
                      {user.roles.map(role => (
                        <Button
                          key={role}
                          variant={role === currentRole ? 'default' : 'outline'}
                          size="sm"
                          className="w-full capitalize"
                          onClick={() => handleRoleChange(role)}
                          disabled={isChangingRole}
                        >
                          {role === currentRole && isChangingRole ? (
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : null}
                          {role}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-1 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/profile')}
                  >
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/support')}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" /> Help & Support
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/about')}
                  >
                    <span className="mr-2 h-4 w-4">ℹ️</span> About Us
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full justify-start"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full Page Loader */}
      {showLoader && <LoadingFallback />}

      <div className="isolate sticky top-2 mx-6 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl dark:bg-gray-50/10 shadow-lg py-3 h-24 px-6 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full">
          {/* Left side with breadcrumbs and page title */}
          <div className="flex flex-col justify-center">
            <Breadcrumb
              className="flex flex-nowrap items-center space-x-1 text-base font-medium text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20"
              style={{ maxWidth: '100vw' }}
            >
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BreadcrumbLink href="/" className="hover:text-primary">
                        HorizonX
                      </BreadcrumbLink>
                    </TooltipTrigger>
                    <TooltipContent>HorizonX</TooltipContent>
                  </Tooltip>
                </BreadcrumbItem>

                {/* Responsive: show all on md+, only first and last on mobile */}
                {getBreadcrumbItems().length > 2 ? (
                  <>
                    {/* On mobile, show first, ellipsis, last */}
                    <span className="block md:hidden">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <span className="px-2 text-muted-foreground">...</span>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <BreadcrumbLink
                              href={getBreadcrumbItems()[getBreadcrumbItems().length - 1].url}
                              className="hover:text-primary"
                            >
                              {getBreadcrumbItems()[getBreadcrumbItems().length - 1].name}
                            </BreadcrumbLink>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getBreadcrumbItems()[getBreadcrumbItems().length - 1].name}
                          </TooltipContent>
                        </Tooltip>
                      </BreadcrumbItem>
                    </span>
                    {/* On md+, show all */}
                    <span className="hidden md:inline">
                      {getBreadcrumbItems().map((item, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <BreadcrumbLink href={item.url} className="hover:text-primary">
                                  {item.name}
                                </BreadcrumbLink>
                              </TooltipTrigger>
                              <TooltipContent>{item.name}</TooltipContent>
                            </Tooltip>
                          </BreadcrumbItem>
                        </React.Fragment>
                      ))}
                    </span>
                  </>
                ) : (
                  // If only 1 or 2 items, show all
                  getBreadcrumbItems().map((item, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <BreadcrumbLink href={item.url} className="hover:text-primary">
                              {item.name}
                            </BreadcrumbLink>
                          </TooltipTrigger>
                          <TooltipContent>{item.name}</TooltipContent>
                        </Tooltip>
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))
                )}
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="xl:text-3xl text-lg md:text-2xl font-bold text-foreground truncate">
              {getPageName()}
            </h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center xl:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeSwitcher />
                </div>
              </TooltipTrigger>
              <TooltipContent>Toggle Theme</TooltipContent>
            </Tooltip>
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-xs flex items-center justify-center text-white">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-80 p-0 rounded-xl shadow-lg" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-medium">Notifications</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-blue-500">
                    Mark all as read
                  </Button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-0 ${notification.read ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {notification.time}
                          </span>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t text-center">
                  <Button variant="ghost" size="sm" className="text-sm text-blue-500 w-full">
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative p-0 flex items-center gap-2 h-9 rounded-full pr-2 hover:bg-background/5"
                >
                  <UserAvatar
                    name={user?.name || 'User'}
                    role={currentRole || ''}
                    showInfo={false}
                  />
                  {!isMobile && (
                    <span className="hidden xl:inline-block font-medium">{user?.name}</span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl" align="end">
                <div className="flex items-center p-2 border-b">
                  <UserAvatar
                    name={user?.name || 'User'}
                    role={currentRole || ''}
                    showInfo={true}
                  />
                </div>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {user?.roles && user.roles.length > 1 && (
                  <>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <User className="mr-2 h-4 w-4" />
                        <span>Switch Role</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="rounded-xl">
                          {user.roles.map(role => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => handleRoleChange(role)}
                              className={role === currentRole ? 'bg-primary/10 text-primary' : ''}
                              disabled={isChangingRole}
                            >
                              {role === currentRole && isChangingRole ? (
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : null}
                              <span className="capitalize">{role}</span>
                              {role === currentRole && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"></span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/support')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/about')}>
                    <span className="mr-2 h-4 w-4">ℹ️</span>
                    <span>About Us</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
};
