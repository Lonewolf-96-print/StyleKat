"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import UserDashboardFooter from "./Footer";

export function DashboardLayout({ children }) {
  return (
    <>
      <div className="flex min-h-screen bg-background relative">

        {/* Sidebar (Responsive) */}
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">

          {/* Header */}
          <Header onMenuClick={() => { }} />

          <main className="flex-1 overflow-auto">
            <div className="p-6 pb-24 lg:p-6 lg:pb-10">{children}</div>
          </main>
        </div>
      </div>

      <UserDashboardFooter />
    </>
  );
}
