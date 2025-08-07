
import { useState, useEffect } from 'react';

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
  currentPage: number;
  zoom: number;
  onPageChange?: (page: number) => void;
}

export default function PdfViewer({ fileUrl, fileName, currentPage, zoom }: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // محاكاة تحميل PDF
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [fileUrl]);

  if (isLoading) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل ملف PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-100 overflow-auto">
      <div 
        className="bg-white shadow-lg mx-auto my-4 min-h-[800px]"
        style={{ 
          transform: `scale(${zoom / 100})`, 
          transformOrigin: 'top center',
          width: '210mm',
          maxWidth: '100%'
        }}
      >
        {/* PDF Content */}
        <div className="p-8">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {fileName}
            </h1>
            <p className="text-sm text-gray-500">الصفحة {currentPage}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              محتوى الصفحة {currentPage}
            </h2>
            
            <p className="text-gray-700 leading-relaxed text-justify">
              هذا محتوى تجريبي للصفحة {currentPage}. في التطبيق الحقيقي، سيتم عرض المحتوى الفعلي 
              لملف PDF هنا باستخدام مكتبة مثل PDF.js أو React-PDF. يمكن أن يشمل المحتوى النصوص، 
              الصور، الجداول، والرسوم البيانية.
            </p>

            {currentPage === 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">المقدمة</h3>
                <p className="text-blue-700 text-sm">
                  مرحباً بك في قارئ PDF المطور. يمكنك استخدام أدوات التحكم الجانبية للتنقل 
                  والتفاعل مع المحتوى.
                </p>
              </div>
            )}

            {currentPage === 2 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">قائمة المحتويات</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>الفصل الأول: مقدمة</li>
                  <li>الفصل الثاني: المفاهيم الأساسية</li>
                  <li>الفصل الثالث: التطبيقات العملية</li>
                  <li>الفصل الرابع: الخلاصة</li>
                </ul>
              </div>
            )}

            {currentPage > 2 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-sm">
                  محتوى الصفحة {currentPage} من الوثيقة. كل صفحة تحتوي على محتوى مختلف 
                  ومفيد للدراسة والمراجعة.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
