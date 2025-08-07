import MainLayout from "@/components/layout/main-layout";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentFiles from "@/components/dashboard/recent-files";
import SmartReview from "@/components/dashboard/smart-review";
import UpcomingExams from "@/components/dashboard/upcoming-exams";
import QuickActions from "@/components/dashboard/quick-actions";
import { Trophy } from "lucide-react";

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="p-6" dir="rtl">
        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Recent Files */}
          <div className="lg:col-span-2">
            <RecentFiles />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <SmartReview />
            <UpcomingExams />
            <QuickActions />
          </div>
        </div>

        {/* Motivational Section */}
        <div className="mt-8 bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2" data-testid="text-motivation-title">
                أداء ممتاز اليوم! 🎉
              </h3>
              <p className="text-primary-100" data-testid="text-motivation-message">
                واصل العمل الجيد! تقدمك اليوم يقربك أكثر من تحقيق أهدافك.
              </p>
            </div>
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm text-primary-100">مستوى التقدم</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
