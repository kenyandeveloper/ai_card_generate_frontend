"use client";

import NavBar from "../NavBar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <NavBar />
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 bg-[size:20px_20px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-slate-900/50" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
