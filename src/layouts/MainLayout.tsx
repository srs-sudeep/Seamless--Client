import { ModuleSidebar, Navbar } from '@/components';
import MainFooter from '@/components/footer/MainFooter';
import { SidebarProvider } from '@/core';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden relative">
        <ModuleSidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="min-h-screen dark:bg-neutral-950 bg-white/80">
            <div className="absolute -top-1/2-left-20 w-96 h-96 bg-pink-500/0 dark:bg-pink-500/30 rounded-full blur-3xl"></div>
            <div className="absolute -top-1/4 -right-20 w-96 h-96 bg-indigo-500/0 dark:bg-indigo-500/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/4 right-0 -translate-y-1/2 w-96 h-96 bg-purple-500/0 dark:bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Outlet />
              </main>
              <MainFooter />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
