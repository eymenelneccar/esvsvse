import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentFiles() {
  const { data: files, isLoading } = useQuery({
    queryKey: ["/api/files/recent"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>الملفات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getFileIcon = (fileType: string) => {
    return <FileText className="w-6 h-6" />;
  };

  const getFileColor = (fileType: string) => {
    switch (fileType) {
      case '.pdf':
        return 'bg-red-100 text-red-600';
      case '.docx':
        return 'bg-blue-100 text-blue-600';
      case '.pptx':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            الملفات الأخيرة
          </CardTitle>
          <a
            href="/files"
            className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
            data-testid="link-view-all-files"
          >
            عرض الكل
            <ExternalLink size={14} />
          </a>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {!files || files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد ملفات حتى الآن</p>
            <p className="text-sm text-gray-500 mt-1">ابدأ برفع أول ملف لك</p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.slice(0, 3).map((file: any) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                data-testid={`file-${file.id}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor(file.fileType)}`}>
                  {getFileIcon(file.fileType)}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900" data-testid={`file-name-${file.id}`}>
                    {file.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    آخر تعديل: {new Date(file.lastAccessed || file.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {file.isTranslated && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        مترجم
                      </Badge>
                    )}
                    {file.studyProgress > 0 && (
                      <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                        مراجع
                      </Badge>
                    )}
                    {file.studyProgress === 100 && (
                      <Badge variant="secondary" className="text-xs bg-secondary/10 text-secondary">
                        مكتمل
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {file.studyProgress || 0}%
                  </div>
                  <div className="text-xs text-gray-500">مكتمل</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
