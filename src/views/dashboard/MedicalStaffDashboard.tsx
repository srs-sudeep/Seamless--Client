import { Users, Calendar, FileText, Heart } from 'lucide-react';
import { StatCard } from '@/components';

const MedicalStaffDashboard = () => {
  return (
    <div className="mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Medical Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Patients Today"
          value="24"
          icon={<Users className="h-5 w-5 text-chip-blue" />}
          iconColor="bg-chip-blue/10"
        />
        <StatCard
          title="Appointments"
          value="18"
          icon={<Calendar className="h-5 w-5 text-chip-yellow" />}
          iconColor="bg-chip-yellow/10"
        />
        <StatCard
          title="Medical Records"
          value="1,254"
          icon={<FileText className="h-5 w-5 text-success" />}
          iconColor="bg-success/10"
        />
        <StatCard
          title="Critical Cases"
          value="3"
          icon={<Heart className="h-5 w-5 text-destructive" />}
          iconColor="bg-destructive/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-medium mb-4">Today's Appointments</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center p-3 bg-background rounded-md border">
                <div className="bg-chip-blue/10 p-2 rounded mr-3">
                  <Calendar className="h-4 w-4 text-chip-blue" />
                </div>
                <div>
                  <h3 className="font-medium">Patient #{(i + 1) * 100}</h3>
                  <p className="text-sm text-muted-foreground">Scheduled at {i + 9}:00 AM</p>
                </div>
                <div className="ml-auto text-xs">
                  <span
                    className={`py-1 px-2 rounded-full ${
                      i === 0 ? 'bg-success/10 text-success' : 'bg-chip-blue/10 text-chip-blue'
                    }`}
                  >
                    {i === 0 ? 'Current' : 'Upcoming'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-medium mb-4">Recent Patient Updates</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center p-3 bg-background rounded-md border">
                <div className="bg-chip-blue/10 p-2 rounded mr-3">
                  <FileText className="h-4 w-4 text-chip-blue" />
                </div>
                <div>
                  <h3 className="font-medium">Medical Report #{(i + 1) * 50}</h3>
                  <p className="text-sm text-muted-foreground">Updated {i + 1} hour(s) ago</p>
                </div>
                <div className="ml-auto text-xs">
                  <span className="bg-chip-blue/10 text-chip-blue py-1 px-2 rounded-full">
                    View Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalStaffDashboard;
