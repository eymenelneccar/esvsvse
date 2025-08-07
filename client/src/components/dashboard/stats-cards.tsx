import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, FileText, Trophy, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cardData = [
    {
      title: "ساعات الدراسة اليوم",
      value: stats?.todayHours || "0",
      icon: Clock,
      color: "bg-primary/10 text-primary",
      change: "+12%",
      changeText: "من الأمس",
    },
    {
      title: "الملفات المدروسة",
      value: stats?.studiedFiles || 0,
      icon: FileText,
      color: "bg-secondary/10 text-secondary",
      change: "+3",
      changeText: "ملفات جديدة",
    },
    {
      title: "نقاط الإنجاز",
      value: stats?.achievementPoints || 0,
      icon: Trophy,
      color: "bg-warning/10 text-warning",
      change: "+45",
      changeText: "نقطة اليوم",
    },
    {
      title: "الهدف اليومي",
      value: `${stats?.dailyGoalProgress || 0}%`,
      icon: Target,
      color: "bg-success/10 text-success",
      progress: stats?.dailyGoalProgress || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" data-testid={`stat-${index}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              
              {card.progress !== undefined ? (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              ) : (
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success font-medium">{card.change}</span>
                  <span className="text-gray-600 mr-2">{card.changeText}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
