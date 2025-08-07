import { useAuth } from "@/hooks/use-auth";
import PomodoroTimer from "@/components/common/pomodoro-timer";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مرحباً بك في Study∀</h2>
          <p className="text-gray-600 mt-1">استمر في رحلتك التعليمية بذكاء وتنظيم</p>
        </div>
        
        <div className="flex items-center gap-4">
          <PomodoroTimer />
          
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-gray-900"
            data-testid="button-notifications"
          >
            <Bell size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-gray-900"
            data-testid="button-settings"
          >
            <Settings size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
