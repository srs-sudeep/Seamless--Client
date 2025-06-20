import React, { useState } from 'react';
import {
  PanelLeft,
  Shield,
  FileText,
  Scale,
  Users,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react';

const Terms: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: CheckCircle, color: 'blue' },
    { id: 'services', title: 'Description of Services', icon: Globe, color: 'emerald' },
    { id: 'user-accounts', title: 'User Accounts', icon: Users, color: 'violet' },
    { id: 'acceptable-use', title: 'Acceptable Use Policy', icon: AlertCircle, color: 'amber' },
    { id: 'intellectual-property', title: 'Intellectual Property', icon: Shield, color: 'rose' },
    { id: 'privacy', title: 'Privacy & Data Protection', icon: Shield, color: 'indigo' },
    { id: 'payment', title: 'Payment Terms', icon: Scale, color: 'teal' },
    { id: 'liability', title: 'Limitation of Liability', icon: AlertCircle, color: 'orange' },
    { id: 'termination', title: 'Termination', icon: AlertCircle, color: 'red' },
    { id: 'governing-law', title: 'Governing Law', icon: Scale, color: 'cyan' },
    { id: 'contact', title: 'Contact Information', icon: FileText, color: 'slate' },
  ];

  return (
    <div>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-10 h-10 bg-white dark:bg-slate-800 rounded-md shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform duration-200 hover:scale-105"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </button>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 transition-all duration-300">
        {/* Header */}
        <div className="relative pt-20 pb-12 mt-24">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-purple-900/5 to-blue-900/5 dark:from-blue-900/5 dark:via-purple-900/5 dark:to-blue-900/5"></div>
          <div className="relative max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 dark:text-slate-100 tracking-tight mb-4">
              Terms & Conditions
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before using our services
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-slate-500 dark:text-slate-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: June 19, 2025</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 pb-20  pt-24">
          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <div
              className={`lg:w-72 ${isSidebarOpen ? 'block' : 'hidden lg:block'} fixed lg:relative top-0 left-0 h-full lg:h-auto z-40 lg:z-auto`}
            >
              <div className="lg:sticky lg:top-6 h-full lg:h-auto">
                <div className="h-full lg:h-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm lg:backdrop-blur-md rounded-none lg:rounded-2xl border-r lg:border border-slate-200 dark:border-slate-700 p-6 lg:shadow-lg">
                  <div className="flex items-center justify-between lg:justify-start mb-6 lg:mb-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Navigation
                    </h3>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {sections.map((section, index) => {
                      return (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          onClick={() => setIsSidebarOpen(false)}
                          className="group flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
                        >
                          <span className="flex items-center justify-center w-6 h-6 mr-3 text-xs font-medium text-slate-500 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {index + 1}
                          </span>
                          <span className="flex-1 truncate">{section.title}</span>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </a>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:max-w-none">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                {/* Content Sections */}
                <div className="p-8 lg:p-12 space-y-12">
                  <section id="acceptance">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Acceptance of Terms
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          By accessing and using TechVision's services, you accept and agree to be
                          bound by the terms and provision of this agreement. If you do not agree to
                          abide by the above, please do not use this service.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="services">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Description of Services
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                          TechVision provides comprehensive technology consulting, software
                          development, web development, mobile application development, and related
                          digital services.
                        </p>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3"></div>
                            Custom software development
                          </div>
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3"></div>
                            Web & mobile applications
                          </div>
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3"></div>
                            Technology consulting
                          </div>
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3"></div>
                            Digital transformation
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section id="user-accounts">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          User Accounts
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          When you create an account with us, you must provide information that is
                          accurate, complete, and current at all times. You are responsible for
                          safeguarding the password and maintaining the confidentiality of your
                          account.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="acceptable-use">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Acceptable Use Policy
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                          You may not use our service for any illegal or unauthorized purpose. You
                          agree to comply with all local laws regarding online conduct and
                          acceptable content.
                        </p>
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            Prohibited activities include transmitting spam, viruses, or harmful
                            code; attempting unauthorized access; harassment; or disrupting our
                            services.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section id="intellectual-property">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Intellectual Property Rights
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          The service and its original content, features, and functionality are and
                          will remain the exclusive property of TechVision and its licensors. Our
                          trademarks and trade dress may not be used without our prior written
                          consent.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="privacy">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Privacy and Data Protection
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          Your privacy is important to us. Our Privacy Policy explains how we
                          collect, use, and protect your information when you use our service. By
                          using our service, you agree to the collection and use of information in
                          accordance with our Privacy Policy.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="payment">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                        <Scale className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Payment Terms
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          Payment terms are specified in individual service agreements. Unless
                          otherwise agreed, payments are due within 30 days of invoice date. Late
                          payments may incur additional charges.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="liability">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Limitation of Liability
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          In no event shall TechVision, nor its directors, employees, partners,
                          agents, suppliers, or affiliates, be liable for any indirect, incidental,
                          special, consequential, or punitive damages resulting from your use of the
                          service.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="termination">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Termination
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          We may terminate or suspend your account and bar access to the service
                          immediately, without prior notice or liability, under our sole discretion,
                          for any reason whatsoever, including if you breach the Terms.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="governing-law">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                        <Scale className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Governing Law
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          These Terms shall be interpreted and governed by the laws of India. Any
                          disputes relating to these terms and conditions shall be subject to the
                          jurisdiction of the courts of Chhattisgarh, India.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="contact">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-3">
                          Contact Information
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                          If you have any questions about these Terms and Conditions, please contact
                          us:
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                                TechVision
                              </p>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                TechVision Plaza, Floor 15
                                <br />
                                Innovation District
                                <br />
                                Durg, Chhattisgarh 491001, India
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600 dark:text-slate-400">
                                <span className="font-medium">Email:</span> legal@techvision.com
                                <br />
                                <span className="font-medium">Phone:</span> +91 788 123 4567
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-8 text-center backdrop-blur-sm">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Important Notice
                </h3>
                <p className="text-blue-700 dark:text-blue-300 max-w-xl mx-auto text-sm leading-relaxed">
                  These terms may be updated from time to time. Continued use of our services after
                  changes constitutes acceptance of the new terms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-30"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default Terms;
