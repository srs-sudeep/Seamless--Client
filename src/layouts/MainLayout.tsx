import { Outlet } from 'react-router-dom';
import Navbar from '@/components/navbar/Navbar';
import ModuleSidebar from '@/components/sidebar/ModuleSidebar';
import { SidebarProvider } from '@/core/context/sidebarContext';
import MainFooter from '@/components/footer/MainFooter';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden relative">
        <ModuleSidebar />
        <div className="flex-1 flex flex-col overflow-auto bg-accent">
          <Navbar />
          <main className="flex-1 p-6 bg-background mt-7 mx-6 mb-0 rounded-xl">
            <Outlet />
          </main>
          <MainFooter />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
