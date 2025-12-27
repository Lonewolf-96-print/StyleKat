"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import UserDashboardFooter from "./Footer";

export function DashboardLayout({ children }) {
  return (
    <>
      <div className="min-h-screen bg-background relative selection:bg-primary/10">

        {/* Sidebar (Responsive) */}
        <Sidebar />

        <div className="lg:pl-72 w-full min-h-screen flex flex-col transition-all duration-300 ease-in-out">

          {/* Header */}
          <Header onMenuClick={() => { }} />

          <main className="flex-1 w-full relative">
            <div className="pt-4 pb-24 lg:pt-6 lg:pb-10 min-h-[80vh] w-full max-w-[1600px] mx-auto px-0">{children}</div>
            <div className="pb-24 lg:pb-0 w-full">
              <UserDashboardFooter />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
