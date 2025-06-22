import { useAuthStore } from '@/store';
import { useTheme } from '@/theme/ThemeProvider';
import { Building, Hash, Mail, User, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
export default function ProfilePage() {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark'); // initialize from theme
  const { user } = useAuthStore();

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  return (
    <div className="container">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${
            isDark ? 'bg-purple-500' : 'bg-blue-400'
          }`}
        ></div>
        <div
          className={`absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${
            isDark ? 'bg-violet-500' : 'bg-indigo-400'
          }`}
        ></div>
      </div>

      <div className="relative z-10 p-8 md:p-12">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-16">
          {/* Avatar with glow effect */}
          <div className="relative mb-6">
            <div
              className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
                isDark
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                  : 'bg-gradient-to-r from-blue-400 to-purple-400'
              }`}
            ></div>
            <div
              className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 transform hover:scale-110 ${
                isDark
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50'
                  : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-2xl shadow-blue-500/50'
              }`}
            >
              <span className="text-4xl font-bold text-white drop-shadow-lg">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>

          {/* Name and Role */}
          <div className="text-center">
            <h1
              className={`text-4xl md:text-5xl font-bold mb-3 transition-colors duration-700 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {user?.name}
            </h1>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Name Card */}
          <div
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${
              isDark
                ? 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70 hover:border-purple-500/50'
                : 'bg-white/70 border border-gray-200/50 hover:bg-white/90 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 ${
                  isDark
                    ? 'bg-blue-500/20 group-hover:bg-blue-500/30'
                    : 'bg-blue-100 group-hover:bg-blue-200'
                }`}
              >
                <User
                  className={`w-6 h-6 transition-colors duration-500 ${
                    isDark
                      ? 'text-blue-400 group-hover:text-blue-300'
                      : 'text-blue-600 group-hover:text-blue-700'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Full Name
                </p>
                <p
                  className={`text-xl font-bold break-words transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {user?.name}
                </p>
              </div>
            </div>
          </div>

          {/* LDAP ID Card */}
          <div
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${
              isDark
                ? 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70 hover:border-purple-500/50'
                : 'bg-white/70 border border-gray-200/50 hover:bg-white/90 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 ${
                  isDark
                    ? 'bg-green-500/20 group-hover:bg-green-500/30'
                    : 'bg-green-100 group-hover:bg-green-200'
                }`}
              >
                <Hash
                  className={`w-6 h-6 transition-colors duration-500 ${
                    isDark
                      ? 'text-green-400 group-hover:text-green-300'
                      : 'text-green-600 group-hover:text-green-700'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  LDAP ID
                </p>
                <p
                  className={`text-xl font-bold break-words transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {user?.ldapid}
                </p>
              </div>
            </div>
          </div>

          {/* Institute ID Card */}
          <div
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${
              isDark
                ? 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70 hover:border-purple-500/50'
                : 'bg-white/70 border border-gray-200/50 hover:bg-white/90 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 ${
                  isDark
                    ? 'bg-orange-500/20 group-hover:bg-orange-500/30'
                    : 'bg-orange-100 group-hover:bg-orange-200'
                }`}
              >
                <Building
                  className={`w-6 h-6 transition-colors duration-500 ${
                    isDark
                      ? 'text-orange-400 group-hover:text-orange-300'
                      : 'text-orange-600 group-hover:text-orange-700'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Institute ID
                </p>
                <p
                  className={`text-xl font-bold break-words transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {user?.idNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Email Card */}
          <div
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${
              isDark
                ? 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70 hover:border-purple-500/50'
                : 'bg-white/70 border border-gray-200/50 hover:bg-white/90 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 ${
                  isDark
                    ? 'bg-pink-500/20 group-hover:bg-pink-500/30'
                    : 'bg-pink-100 group-hover:bg-pink-200'
                }`}
              >
                <Mail
                  className={`w-6 h-6 transition-colors duration-500 ${
                    isDark
                      ? 'text-pink-400 group-hover:text-pink-300'
                      : 'text-pink-600 group-hover:text-pink-700'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Email Address
                </p>
                <p
                  className={`text-xl font-bold break-words transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {user?.ldapid}@iitbhilai.ac.in
                </p>
              </div>
            </div>
          </div>

          {/* Roles Card (Full Width) */}
          <div
            className={`group relative overflow-hidden rounded-2xl p-6 col-span-1 md:col-span-2 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${
              isDark
                ? 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70 hover:border-purple-500/50'
                : 'bg-white/70 border border-gray-200/50 hover:bg-white/90 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 ${
                  isDark
                    ? 'bg-purple-500/20 group-hover:bg-purple-500/30'
                    : 'bg-purple-100 group-hover:bg-purple-200'
                }`}
              >
                <UserCheck
                  className={`w-6 h-6 transition-colors duration-500 ${
                    isDark
                      ? 'text-purple-400 group-hover:text-purple-300'
                      : 'text-purple-600 group-hover:text-purple-700'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium mb-4 transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  User Roles
                </p>
                <div className="flex flex-wrap gap-3">
                  {user?.roles?.map((role, index) => (
                    <span
                      key={index}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                        isDark
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50'
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-16 pt-8 border-t border-gray-200/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p
                className={`text-2xl font-bold transition-colors duration-700 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                24/7
              </p>
              <p
                className={`text-sm transition-colors duration-700 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Active Status
              </p>
            </div>
            <div>
              <p
                className={`text-2xl font-bold transition-colors duration-700 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {user?.roles?.length || 0}
              </p>
              <p
                className={`text-sm transition-colors duration-700 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Active Roles
              </p>
            </div>
            <div>
              <p
                className={`text-2xl font-bold transition-colors duration-700 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                100%
              </p>
              <p
                className={`text-sm transition-colors duration-700 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Access Level
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
