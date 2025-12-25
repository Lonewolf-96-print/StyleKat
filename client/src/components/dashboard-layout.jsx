"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import UserDashboardFooter from "./Footer";

export function DashboardLayout({ children }) {
  return (
    <>
      <div className="flex h-screen bg-background relative py-4">

        {/* Sidebar (Responsive) */}
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <Header onMenuClick={() => { }} />

          <main className="flex-1 overflow-auto">
            <div className="p-6 pb-20 lg:pb-6">{children}</div>
          </main>
        </div>
      </div>

      <UserDashboardFooter />
    </>
  );
}
