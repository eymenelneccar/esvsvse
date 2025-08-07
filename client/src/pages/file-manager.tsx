import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Folder, 
  FolderPlus, 
  Upload, 
  FileText, 
  Trash2, 
  Eye,
  MoreVertical,
  ArrowLeft,
  Download
} from "lucide-react";
import { Link } from "wouter";

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  isTranslated: boolean;
  studyProgress: number;
  createdAt: string;
  folderId?: string;
}

interface FolderItem {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  parentId?: string;
}

export default function FileManager() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#2563EB");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Fetch folders
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ["/api/folders"],
  });

  // Fetch files for current folder
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ["/api/files", currentFolderId],
    queryFn: async () => {
      const url = currentFolderId ? `/api/files?folderId=${currentFolderId}` : "/api/files";
      const response = await fetch(url);
      return response.json();
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; parentId?: string }) => {
      const response = await apiRequest("POST", "/api/folders", {
        ...data,
        userId: "current-user", // Will be set by server
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setIsCreateFolderOpen(false);
      setFolderName("");
      setFolderColor("#2563EB");
      toast({
        title: "تم إنشاء المجلد بنجاح",
        description: "تم إضافة المجلد الجديد إلى ملفاتك",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء المجلد",
        description: "حدث خطأ أثناء إنشاء المجلد",
        variant: "destructive",
      });
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolderId) {
        formData.append("folderId", currentFolderId);
      }
      
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files", currentFolderId] });
      setIsUploadOpen(false);
      setSelectedFile(null);
      toast({
        title: "تم رفع الملف بنجاح",
        description: "تم إضافة الملف إلى مكتبتك",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في رفع الملف",
        description: "حدث خطأ أثناء رفع الملف",
        variant: "destructive",
      });
    },
  });

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    
    createFolderMutation.mutate({
      name: folderName,
      color: folderColor,
      parentId: currentFolderId || undefined,
    });
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;
    uploadFileMutation.mutate(selectedFile);
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'ك.بايت', 'م.بايت', 'ج.بايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const currentFolder = currentFolderId ? folders?.find((f: FolderItem) => f.id === currentFolderId) : null;
  const currentFolders = folders?.filter((f: FolderItem) => f.parentId === currentFolderId) || [];
  const currentFiles = files || [];

  return (
    <MainLayout>
      <div className="p-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {currentFolderId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFolderId(null)}
                className="flex items-center gap-2"
                data-testid="button-back-to-root"
              >
                <ArrowLeft size={16} />
                العودة
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentFolder ? currentFolder.name : "إدارة الملفات"}
              </h1>
              <p className="text-gray-600">
                {currentFolder ? "المجلد الحالي" : "جميع الملفات والمجلدات"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2 bg-secondary text-white"
                  data-testid="button-create-folder"
                >
                  <FolderPlus size={16} />
                  مجلد جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إنشاء مجلد جديد</DialogTitle>
                  <DialogDescription>
                    أنشئ مجلداً جديداً لتنظيم ملفاتك
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name">اسم المجلد</Label>
                    <Input
                      id="folder-name"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="أدخل اسم المجلد"
                      data-testid="input-folder-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="folder-color">لون المجلد</Label>
                    <Select value={folderColor} onValueChange={setFolderColor}>
                      <SelectTrigger data-testid="select-folder-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#2563EB">🔵 أزرق</SelectItem>
                        <SelectItem value="#DC2626">🔴 أحمر</SelectItem>
                        <SelectItem value="#16A34A">🟢 أخضر</SelectItem>
                        <SelectItem value="#CA8A04">🟡 أصفر</SelectItem>
                        <SelectItem value="#7C3AED">🟣 بنفسجي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateFolder}
                      disabled={!folderName.trim() || createFolderMutation.isPending}
                      className="flex-1"
                      data-testid="button-confirm-create-folder"
                    >
                      {createFolderMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateFolderOpen(false)}
                      className="flex-1"
                      data-testid="button-cancel-create-folder"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  data-testid="button-upload-file"
                >
                  <Upload size={16} />
                  رفع ملف
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96" dir="rtl">
                <DialogHeader>
                  <DialogTitle>رفع ملف جديد</DialogTitle>
                  <DialogDescription>
                    اختر ملفاً من جهازك لرفعه (PDF, DOCX, PPTX)
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">اختر الملف</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.docx,.pptx"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      data-testid="input-file-upload"
                    />
                  </div>
                  
                  {selectedFile && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-600">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFileUpload}
                      disabled={!selectedFile || uploadFileMutation.isPending}
                      className="flex-1"
                      data-testid="button-confirm-upload"
                    >
                      {uploadFileMutation.isPending ? "جاري الرفع..." : "رفع"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadOpen(false)}
                      className="flex-1"
                      data-testid="button-cancel-upload"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Folders Grid */}
          {(foldersLoading || currentFolders.length > 0) && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Folder size={20} />
                المجلدات
              </h2>
              
              {foldersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentFolders.map((folder: FolderItem) => (
                    <Card
                      key={folder.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setCurrentFolderId(folder.id)}
                      data-testid={`folder-${folder.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: folder.color + '20', color: folder.color }}
                          >
                            <Folder size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900" data-testid={`folder-name-${folder.id}`}>
                              {folder.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {new Date(folder.createdAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files Grid */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              الملفات
            </h2>
            
            {filesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : currentFiles.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {currentFolder ? "لا توجد ملفات في هذا المجلد" : "لا توجد ملفات"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">ابدأ برفع أول ملف لك</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentFiles.map((file: FileItem) => (
                  <Card key={file.id} className="hover:shadow-md transition-shadow" data-testid={`file-${file.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor(file.fileType)}`}>
                          {getFileIcon(file.fileType)}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1" data-testid={`file-name-${file.id}`}>
                            {file.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">
                            {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-3">
                            {file.isTranslated && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                مترجم
                              </Badge>
                            )}
                            {file.studyProgress > 0 && (
                              <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                                مراجع {file.studyProgress}%
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Link href={`/pdf/${file.id}`}>
                              <Button size="sm" className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white" data-testid={`button-open-${file.id}`}>
                                <Eye size={14} />
                                فتح PDF
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
