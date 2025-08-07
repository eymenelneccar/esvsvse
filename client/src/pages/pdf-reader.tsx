import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  BookCheck,
  ArrowLeft,
  Languages,
  Brain,
  Clock
} from "lucide-react";
import PdfViewer from "@/components/pdf-viewer/pdf-viewer";

interface FileData {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  filePath: string;
  studyProgress: number;
  isTranslated: boolean;
  createdAt: string;
}

export default function PdfReader() {
  const { fileId } = useParams();
  const [file, setFile] = useState<{
    id: string;
    name: string;
    type: string;
    url: string;
    size?: number;
    uploadedAt?: string;
  } | null>(null);

  // Ensure fileId is defined
  if (!fileId) {
    return (
      <MainLayout>
        <div className="p-6" dir="rtl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">خطأ: لم يتم العثور على الملف</h1>
            <p className="mt-2 text-gray-600">معرف الملف غير صحيح</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [studyStartTime] = useState(new Date());
  const { toast } = useToast();

  // Fetch file data
  const { data: fileData, isLoading: fileLoading } = useQuery({
    queryKey: ["/api/files", fileId],
    queryFn: async () => {
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }
      return response.json();
    },
    enabled: !!fileId,
  });

  // Mark study session complete mutation
  const completeStudyMutation = useMutation({
    mutationFn: async () => {
      const studyDuration = Math.round((new Date().getTime() - studyStartTime.getTime()) / 60000); // minutes

      // Create study session
      await apiRequest("POST", "/api/study-sessions", {
        fileId: fileId,
        startTime: studyStartTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: studyDuration,
        sessionType: "reading",
        notes: `تم إنهاء قراءة الملف: ${fileData?.name}`,
      });

      // Update file study progress
      await apiRequest("PUT", `/api/files/${fileId}`, {
        studyProgress: Math.min(100, (fileData?.studyProgress || 0) + 25),
        lastAccessed: new Date().toISOString(),
      });

      return { duration: studyDuration };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/files", fileId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });

      toast({
        title: "تم تسجيل جلسة الدراسة!",
        description: `تم تسجيل ${data.duration} دقيقة من الدراسة. ستتم إضافة تذكير للمراجعة قريباً.`,
      });

      // Navigate back to file manager after a delay
      setTimeout(() => {
        setLocation("/files");
      }, 2000);
    },
    onError: () => {
      toast({
        title: "خطأ في حفظ جلسة الدراسة",
        description: "حدث خطأ أثناء حفظ تقدم الدراسة",
        variant: "destructive",
      });
    },
  });

  // Translation mutation
  const translateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/files/${fileId}/translate`, {
        targetLanguage: "ar",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files", fileId] });
      toast({
        title: "تم بدء الترجمة",
        description: "جاري ترجمة الملف إلى العربية، ستظهر النتائج قريباً",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الترجمة",
        description: "فشل في بدء عملية الترجمة",
        variant: "destructive",
      });
    },
  });

  // Generate flashcards mutation
  const generateFlashcardsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/files/${fileId}/flashcards/generate`);
      return response.json();
    },
    onSuccess: (flashcards) => {
      toast({
        title: "تم إنشاء البطاقات الذكية",
        description: `تم إنشاء ${flashcards.length} بطاقة ذكية للمراجعة`,
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء البطاقات",
        description: "فشل في إنشاء البطاقات الذكية",
        variant: "destructive",
      });
    },
  });

  // Reminder mutation
  const reminderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/files/${fileId}/reminder`, {
        reminderDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // two weeks from now
        dailyNotification: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم ضبط التذكير",
        description: "سيتم تذكيرك قبل الحدث بأسبوعين وسيتم إرسال إشعار يومي.",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في ضبط التذكير",
        description: "فشل في ضبط التذكير",
        variant: "destructive",
      });
    },
  });

  const handleCompleteStudy = () => {
    completeStudyMutation.mutate();
  };

  const handleTranslate = () => {
    translateMutation.mutate();
  };

  const handleGenerateFlashcards = () => {
    generateFlashcardsMutation.mutate();
  };

  const handleSetReminder = () => {
    reminderMutation.mutate();
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (fileLoading) {
    return (
      <MainLayout>
        <div className="h-screen flex">
          <div className="flex-1 p-6">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!fileData) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الملف غير موجود</h1>
          <p className="text-gray-600 mb-4">لم يتم العثور على الملف المطلوب</p>
          <Button onClick={() => setLocation("/files")}>
            <ArrowLeft className="ml-2" size={16} />
            العودة إلى الملفات
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-screen flex" dir="rtl">
        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/files")}
              className="flex items-center gap-2 mb-3"
              data-testid="button-back-to-files"
            >
              <ArrowLeft size={16} />
              العودة إلى الملفات
            </Button>

            <h1 className="text-lg font-bold text-gray-900 mb-1">{fileData.name}</h1>
            <p className="text-sm text-gray-600">{(fileData.fileType || 'PDF').toUpperCase()} • {new Date(fileData.createdAt).toLocaleDateString('ar-SA')}</p>

            <div className="flex items-center gap-2 mt-3">
              {fileData.isTranslated && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  مترجم
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                تقدم الدراسة {fileData.studyProgress}%
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 space-y-4">
            {/* Page Navigation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">التنقل بين الصفحات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronRight size={16} />
                  </Button>

                  <span className="text-sm font-medium">
                    صفحة {currentPage}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    data-testid="button-next-page"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Zoom Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">التكبير والتصغير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                    data-testid="button-zoom-out"
                  >
                    <ZoomOut size={16} />
                  </Button>

                  <span className="text-sm font-medium">{zoom}%</span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                    data-testid="button-zoom-in"
                  >
                    <ZoomIn size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Study Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">أدوات الدراسة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleTranslate}
                  disabled={translateMutation.isPending || fileData.isTranslated}
                  data-testid="button-translate"
                >
                  <Languages size={16} className="ml-2" />
                  {fileData.isTranslated ? "مترجم بالفعل" : "ترجمة إلى العربية"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleGenerateFlashcards}
                  disabled={generateFlashcardsMutation.isPending}
                  data-testid="button-generate-flashcards"
                >
                  <Brain size={16} className="ml-2" />
                  إنشاء بطاقات ذكية
                </Button>
              </CardContent>
            </Card>

            {/* Complete Study */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full bg-success text-white hover:bg-success/90"
                  onClick={handleCompleteStudy}
                  disabled={completeStudyMutation.isPending}
                  data-testid="button-complete-study"
                >
                  <BookCheck size={16} className="ml-2" />
                  {completeStudyMutation.isPending ? "جاري الحفظ..." : "تم الدراسة"}
                </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  سيتم تسجيل جلسة الدراسة وإضافة تذكير للمراجعة
                </p>
              </CardContent>
            </Card>

            {/* Reminder Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  onClick={handleSetReminder}
                  disabled={reminderMutation.isPending}
                  data-testid="button-set-reminder"
                >
                  <Clock size={16} className="ml-2" />
                  ضبط تذكير
                </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  سيتم تذكيرك قبل أسبوعين من الحدث ويومياً.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Study Timer */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>وقت الدراسة: {Math.round((new Date().getTime() - studyStartTime.getTime()) / 60000)} دقيقة</span>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-100 relative">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">ملخصات صوتية</h1>
            <PdfViewer
              fileUrl={fileData.filePath}
              fileName={fileData.name}
              currentPage={currentPage}
              zoom={zoom}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}