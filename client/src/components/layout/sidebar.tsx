import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Home, Folder, FileText, Languages, Brain, Calendar,
  BarChart3, Focus, GraduationCap
} from "lucide-react";

const navigationItems = [
  { href: "/", icon: Home, label: "الصفحة الرئيسية" },
  { href: "/files", icon: Folder, label: "إدارة الملفات" },
  { href: "/pdf-reader", icon: FileText, label: "ملخصات صوتية" },
  { href: "/translation", icon: Languages, label: "الترجمة الذكية" },
  { href: "/review", icon: Brain, label: "المراجعة الذكية" },
  { href: "/calendar", icon: Calendar, label: "التقويم الدراسي" },
  { href: "/productivity", icon: BarChart3, label: "تتبع الإنتاجية" },
  { href: "/focus", icon: Focus, label: "أدوات التركيز" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-white shadow-lg border-l border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Study∀</h1>
            <p className="text-sm text-gray-500">تطبيق الدراسة الذكي</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              data-testid={`nav-${item.href.substring(1) || 'home'}`}
            >
              <Icon className="text-lg" size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-gradient-to-br from-success to-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'ط'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900" data-testid="text-user-name">
              {user?.fullName || user?.username || 'طالب محمد'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.level || 'المستوى الثالث'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}