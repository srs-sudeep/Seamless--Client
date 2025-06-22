import { ModuleSidebar, Navbar } from '@/components';
import MainFooter from '@/components/footer/MainFooter';
import { SidebarProvider } from '@/core';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden relative">
        <ModuleSidebar />
        <div className="flex-1 flex flex-col relative overflow-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-neutral-950">
          <div className="fixed top-0 left-20 w-96 h-96 bg-blue-400/20 dark:bg-pink-500/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed -top-1/4 -right-20 w-96 h-96 bg-indigo-400/25 dark:bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed -bottom-1/4 right-0 w-96 h-96 bg-purple-400/15 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative flex flex-col min-h-screen ">
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <MainFooter />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
