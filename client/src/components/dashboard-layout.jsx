"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import UserDashboardFooter from "./Footer";

export function DashboardLayout({ children }) {
  return (
    <>
      <div className="flex min-h-screen bg-background relative overflow-x-hidden">

        {/* Sidebar (Responsive) */}
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 w-full lg:pl-72 transition-all duration-300">

          {/* Header */}
          <Header onMenuClick={() => { }} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
            <div className="p-4 pb-24 lg:p-6 lg:pb-10 min-h-[80vh] w-full">{children}</div>
            <div className="pb-24 lg:pb-0 w-full">
              <UserDashboardFooter />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
