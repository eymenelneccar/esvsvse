import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import FloatingActions from "@/components/common/floating-actions";
import AppLockModal from "@/components/common/app-lock-modal";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50" dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        {children}
      </main>
      <FloatingActions />
      <AppLockModal />
    </div>
  );
}
