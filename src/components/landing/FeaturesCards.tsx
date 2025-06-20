import { Zap, Shield, Users, Sparkles, Globe } from 'lucide-react';
import ScrollWrapper from './ScrollWrapper';

const FeaturesCards = () => {
  const features = [
    {
      icon: Zap,
      title: 'SCOSTA Smart ID',
      description: 'Tamper-proof smart cards with encrypted biometric storage.',
      gradient: 'from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-gray-900',
      iconBg: 'bg-indigo-500',
      delay: 200,
    },
    {
      icon: Shield,
      title: 'Smart Card Reader',
      description: 'Real-time data, flexible security, and limitless biometric scans.',
      gradient: 'from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950',
      iconBg: 'bg-purple-500',
      delay: 400,
    },
    {
      icon: Users,
      title: 'Custom Software',
      description: 'Tailored features to fit your unique campus workflow.',
      gradient: 'from-pink-50 to-indigo-50 dark:from-zinc-900 dark:to-indigo-950',
      iconBg: 'bg-pink-500',
      delay: 600,
    },
    {
      icon: Sparkles,
      title: 'Seamless Campus Life',
      description: 'Smart, secure, and student-centric digital ecosystem.',
      gradient: 'from-violet-50 to-fuchsia-50 dark:from-gray-900 dark:to-violet-950',
      iconBg: 'bg-violet-500',
      delay: 800,
    },
    {
      icon: Globe,
      title: 'AI Insights',
      description: 'Learns from feedback to deliver smarter interventions.',
      gradient: 'from-indigo-50 to-violet-50 dark:from-zinc-900 dark:to-indigo-950',
      iconBg: 'bg-indigo-500',
      delay: 1000,
    },
  ];

  return (
    <div className="relative py-24 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-neutral-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-zinc-800 rounded-full blur-3xl opacity-30 dark:opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 dark:bg-zinc-800 rounded-full blur-3xl opacity-30 dark:opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <ScrollWrapper animationType="slideUp" className="text-center mb-16" threshold={0.2}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Seamless?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the power of unified business operations with our comprehensive platform
            designed for modern teams
          </p>
        </ScrollWrapper>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <ScrollWrapper
                key={index}
                animationType="slideUp"
                delay={feature.delay}
                threshold={0.2}
              >
                <div
                  className={`group p-8 bg-gradient-to-br ${feature.gradient} rounded-2xl hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-white/50 dark:border-white/20 backdrop-blur-sm relative overflow-hidden`}
                >
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div
                    className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg relative z-10`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10">
                    {feature.description}
                  </p>

                  {/* Decorative element */}
                  <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent dark:from-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                </div>
              </ScrollWrapper>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturesCards;
