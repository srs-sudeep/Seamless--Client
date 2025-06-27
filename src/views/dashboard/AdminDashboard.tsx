import { Users, FileText, Calendar, Building, BarChart } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import YearlyBreakup from '@/components/dashboard/YearlyBreakup';
import MonthlyEarnings from '@/components/dashboard/MonthlyEarnings';
import ProductsSection from '@/components/dashboard/ProductsSection';
import ProjectsSection from '@/components/dashboard/ProjectsSection';
import CustomersSection from '@/components/dashboard/CustomersSection';
import { HelmetWrapper } from '@/components';

const AdminDashboard = () => {
  return (
    <HelmetWrapper title="Admin Dashboard | Seamless">
      <div className="mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Students"
            value="3,685"
            icon={<Users className="h-5 w-5 text-chip-blue" />}
            iconColor="bg-chip-blue/10"
          />
          <StatCard
            title="Teachers"
            value="256"
            icon={<Users className="h-5 w-5 text-chip-yellow" />}
            iconColor="bg-chip-yellow/10"
          />
          <StatCard
            title="Courses"
            value="64"
            icon={<FileText className="h-5 w-5 text-chip-blue" />}
            iconColor="bg-chip-blue/10"
          />
          <StatCard
            title="Departments"
            value="12"
            icon={<Building className="h-5 w-5 text-destructive" />}
            iconColor="bg-destructive/10"
          />
          <StatCard
            title="Events"
            value="28"
            icon={<Calendar className="h-5 w-5 text-success" />}
            iconColor="bg-success/10"
          />
          <StatCard
            title="Analytics"
            value="89%"
            icon={<BarChart className="h-5 w-5 text-chip-blue" />}
            iconColor="bg-chip-blue/10"
          />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <RevenueChart />
          <YearlyBreakup />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <MonthlyEarnings />
          <ProductsSection />
          <ProjectsSection />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <CustomersSection />
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default AdminDashboard;
