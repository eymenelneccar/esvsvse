import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarCheck, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingExams() {
  const { data: exams, isLoading } = useQuery({
    queryKey: ["/api/exams/upcoming"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>الاختبارات القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getTimeUntilExam = (examDate: string) => {
    const now = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "انتهى";
    if (diffDays === 0) return "اليوم";
    if (diffDays === 1) return "غداً";
    if (diffDays <= 7) return `${diffDays} أيام متبقية`;
    if (diffDays <= 14) return `أسبوعين متبقية`;
    if (diffDays <= 21) return `3 أسابيع متبقية`;
    return `${Math.ceil(diffDays / 7)} أسابيع متبقية`;
  };

  const getBadgeVariant = (examDate: string) => {
    const now = new Date();
    const exam = new Date(examDate);
    const diffDays = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return "destructive";
    if (diffDays <= 14) return "default";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={20} />
          الاختبارات القادمة
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {!exams || exams.length === 0 ? (
          <div className="text-center py-8">
            <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد اختبارات مجدولة</p>
            <p className="text-sm text-gray-500 mt-1">أضف اختباراتك لتتبع مواعيدها</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.slice(0, 3).map((exam: any) => (
              <div
                key={exam.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                data-testid={`exam-${exam.id}`}
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <CalendarCheck className="text-red-600" size={20} />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900" data-testid={`exam-subject-${exam.id}`}>
                    {exam.subject}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(exam.examDate).toLocaleDateString('ar-SA')}
                  </p>
                  <Badge variant={getBadgeVariant(exam.examDate)} className="text-xs mt-1">
                    {getTimeUntilExam(exam.examDate)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          className="w-full mt-4 bg-secondary text-white hover:bg-secondary/90"
          data-testid="button-add-exam"
        >
          <Plus size={16} className="ml-2" />
          إضافة اختبار جديد
        </Button>
      </CardContent>
    </Card>
  );
}
