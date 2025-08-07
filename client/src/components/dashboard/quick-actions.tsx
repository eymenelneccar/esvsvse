import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BookOpen, Eye, Zap } from "lucide-react";

const quickActions = [
  {
    icon: Upload,
    label: "رفع ملف جديد",
    action: "uploadFile",
    color: "text-primary",
  },
  {
    icon: BookOpen,
    label: "إنشاء بطاقات ذكية",
    action: "createFlashcards",
    color: "text-secondary",
  },
  {
    icon: Eye,
    label: "تفعيل وضع التركيز",
    action: "startFocus",
    color: "text-success",
  },
];

export default function QuickActions() {
  const handleAction = (action: string) => {
    switch (action) {
      case "uploadFile":
        // Navigate to file upload
        console.log("Navigate to file upload");
        break;
      case "createFlashcards":
        // Navigate to flashcard creation
        console.log("Navigate to flashcard creation");
        break;
      case "startFocus":
        // Start focus mode
        console.log("Start focus mode");
        break;
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Zap size={20} />
          إجراءات سريعة
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={action.action}
              variant="outline"
              className="w-full justify-start gap-3 p-3 h-auto"
              onClick={() => handleAction(action.action)}
              data-testid={`button-${action.action}`}
            >
              <Icon className={action.color} size={20} />
              <span className="font-medium">{action.label}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
