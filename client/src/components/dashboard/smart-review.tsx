import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SmartReview() {
  const { data: flashcards, isLoading } = useQuery({
    queryKey: ["/api/flashcards/due"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>المراجعة الذكية</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const dueCount = flashcards?.length || 0;
  const progressPercentage = dueCount > 0 ? Math.max(35, Math.min(100 - dueCount * 10, 100)) : 100;

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Brain size={20} />
          المراجعة الذكية
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <div 
            className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{
              background: `conic-gradient(#2563EB 0deg ${progressPercentage * 3.6}deg, #E5E7EB ${progressPercentage * 3.6}deg 360deg)`
            }}
          >
            <span className="text-lg font-bold text-primary">{progressPercentage}%</span>
          </div>
          <p className="text-sm text-gray-600">من المواد محدثة</p>
        </div>
        
        <div className="space-y-3">
          {dueCount > 0 ? (
            <>
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">بطاقات للمراجعة</p>
                  <p className="text-xs text-gray-600">{dueCount} بطاقة تحتاج مراجعة</p>
                </div>
                <AlertTriangle className="text-warning" size={20} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">المواد المحدثة</p>
                  <p className="text-xs text-gray-600">محدثة حديثاً</p>
                </div>
                <CheckCircle className="text-success" size={20} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">جميع المواد محدثة</p>
                <p className="text-xs text-gray-600">لا توجد مراجعات مطلوبة</p>
              </div>
              <CheckCircle className="text-success" size={20} />
            </div>
          )}
        </div>

        <Button
          className="w-full mt-4"
          disabled={dueCount === 0}
          data-testid="button-start-review"
        >
          {dueCount > 0 ? "بدء المراجعة الذكية" : "لا توجد مراجعات"}
        </Button>
      </CardContent>
    </Card>
  );
}
