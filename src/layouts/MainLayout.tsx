import { Outlet } from 'react-router-dom';
import { ModuleSidebar, Navbar } from '@/components';
import { SidebarProvider } from '@/core';
import MainFooter from '@/components/footer/MainFooter';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden relative">
        <ModuleSidebar />
        <div className="flex-1 flex flex-col overflow-auto bg-accent dark:bg-sidebar-accent-foreground">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <MainFooter />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
