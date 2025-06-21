import { Mail, Building, Hash, User, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/store';
export default function ProfilePage() {
  const { user } = useAuthStore();
  console.log(user);
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      {/* Main Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-8xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-12">
          {/* Avatar */}
          <div className="w-24 h-24 bg-emerald-400 dark:bg-emerald-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">A</span>
          </div>

          {/* Name and Role */}
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            {user?.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">ADMIN</p>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Name */}
          <div className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                  admin
                </p>
              </div>
            </div>
          </div>
          {/* LDAP ID */}
          <div className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">LDAP ID</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                  {user?.ldapid}
                </p>
              </div>
            </div>
          </div>

          {/* Institute ID */}
          <div className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Institute ID</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                  {user?.idNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                  {user?.ldapid}@iitbhilai.ac.in
                </p>
              </div>
            </div>
          </div>

          {/* Role (Spans 2 columns on md and above) */}
          <div className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-600 col-span-1 md:col-span-2">
            <div className="flex items-start space-x-4 flex-wrap">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Role</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user?.roles?.map((role, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium border border-blue-300 shadow-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
