import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Calendar as CalendarIcon, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AcademicEvent {
  id: string;
  title: string;
  date: Date;
  type: 'exam' | 'deadline' | 'holiday' | 'registration' | 'lecture';
  description?: string;
  reminderEnabled: boolean;
}

export default function Calendar() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([
    // الأحداث الأساسية
    {
      id: "1",
      title: "امتحان الفصل الأول",
      date: new Date(2024, 11, 15), // December 15, 2024
      type: "exam",
      description: "امتحان نهائي للفصل الدراسي الأول",
      reminderEnabled: false
    },
    {
      id: "2", 
      title: "موعد التسجيل للفصل الثاني",
      date: new Date(2024, 11, 20), // December 20, 2024
      type: "registration",
      description: "فتح التسجيل للفصل الدراسي الثاني",
      reminderEnabled: false
    },
    {
      id: "3",
      title: "عطلة نصف العام",
      date: new Date(2024, 11, 25), // December 25, 2024
      type: "holiday", 
      description: "بداية عطلة نصف السنة الدراسية",
      reminderEnabled: false
    },
    {
      id: "4",
      title: "تسليم مشروع التخرج",
      date: new Date(2025, 0, 10), // January 10, 2025
      type: "deadline",
      description: "موعد أخير لتسليم مشاريع التخرج",
      reminderEnabled: false
    },
    {
      id: "5",
      title: "بداية الفصل الثاني",
      date: new Date(2025, 0, 15), // January 15, 2025
      type: "lecture",
      description: "بداية المحاضرات للفصل الدراسي الثاني",
      reminderEnabled: false
    },
    // أحداث التقويم الأكاديمي المضافة
    {
      id: "6",
      title: "بداية التسجيل المبكر",
      date: new Date(2025, 1, 1), // February 1, 2025
      type: "registration",
      description: "فتح التسجيل المبكر للفصل الصيفي",
      reminderEnabled: false
    },
    {
      id: "7",
      title: "امتحانات منتصف الفصل",
      date: new Date(2025, 2, 15), // March 15, 2025
      type: "exam",
      description: "امتحانات منتصف الفصل الدراسي الثاني",
      reminderEnabled: false
    },
    {
      id: "8",
      title: "عطلة الربيع",
      date: new Date(2025, 3, 10), // April 10, 2025
      type: "holiday",
      description: "عطلة الربيع - أسبوع",
      reminderEnabled: false
    },
    {
      id: "9",
      title: "آخر موعد لسحب المواد",
      date: new Date(2025, 3, 20), // April 20, 2025
      type: "deadline",
      description: "آخر موعد لسحب المواد بدون رسوب",
      reminderEnabled: false
    },
    {
      id: "10",
      title: "امتحانات نهاية الفصل",
      date: new Date(2025, 4, 15), // May 15, 2025
      type: "exam",
      description: "امتحانات نهاية الفصل الدراسي الثاني",
      reminderEnabled: false
    },
    {
      id: "11",
      title: "بداية الفصل الصيفي",
      date: new Date(2025, 5, 1), // June 1, 2025
      type: "lecture",
      description: "بداية المحاضرات للفصل الصيفي",
      reminderEnabled: false
    },
    {
      id: "12",
      title: "إعلان النتائج",
      date: new Date(2025, 5, 10), // June 10, 2025
      type: "registration",
      description: "إعلان نتائج الفصل الدراسي الثاني",
      reminderEnabled: false
    }
  ]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'deadline': return 'bg-orange-100 text-orange-800';
      case 'holiday': return 'bg-green-100 text-green-800';
      case 'registration': return 'bg-blue-100 text-blue-800';
      case 'lecture': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <AlertTriangle className="h-4 w-4" />;
      case 'deadline': return <Clock className="h-4 w-4" />;
      case 'holiday': return <CalendarIcon className="h-4 w-4" />;
      case 'registration': return <Bell className="h-4 w-4" />;
      case 'lecture': return <CalendarIcon className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getDaysUntilEvent = (eventDate: Date) => {
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleReminder = (eventId: string) => {
    setAcademicEvents(events => 
      events.map(event => 
        event.id === eventId 
          ? { ...event, reminderEnabled: !event.reminderEnabled }
          : event
      )
    );

    const event = academicEvents.find(e => e.id === eventId);
    if (event) {
      const isEnabling = !event.reminderEnabled;
      toast({
        title: isEnabling ? "تم تفعيل التذكير" : "تم إلغاء التذكير",
        description: isEnabling 
          ? `ستتلقى تذكيرات أسبوعية ويومية قبل ${event.title}` 
          : "لن تتلقى تذكيرات لهذا الحدث",
      });

      // في تطبيق حقيقي، ستقوم هنا بجدولة الإشعارات
      if (isEnabling) {
        console.log(`Scheduling reminders for: ${event.title} on ${event.date}`);
      }
    }
  };

  const scheduleReminders = (event: AcademicEvent) => {
    const daysUntil = getDaysUntilEvent(event.date);

    if (daysUntil === 14) {
      toast({
        title: "تذكير: أسبوعين متبقية",
        description: `${event.title} - باقي أسبوعين`,
        variant: "default"
      });
    }

    if (daysUntil <= 7 && daysUntil > 0) {
      toast({
        title: "تذكير يومي",
        description: `${event.title} - باقي ${daysUntil} ${daysUntil === 1 ? 'يوم' : 'أيام'}`,
        variant: "default"
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      academicEvents.forEach(event => {
        if (event.reminderEnabled) {
          scheduleReminders(event);
        }
      });
    }, 24 * 60 * 60 * 1000); // Check daily

    return () => clearInterval(interval);
  }, [academicEvents]);

  const selectedDateEvents = academicEvents.filter(event => 
    selectedDate && 
    event.date.toDateString() === selectedDate.toDateString()
  );

  const upcomingEvents = academicEvents
    .filter(event => getDaysUntilEvent(event.date) >= 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="p-6" dir="rtl">
        <h1 className="text-2xl font-bold mb-6">التقويم الأكاديمي</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                التقويم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  eventDay: academicEvents.map(event => event.date)
                }}
                modifiersClassNames={{
                  eventDay: "bg-blue-100 text-blue-900"
                }}
              />
            </CardContent>
          </Card>

          {/* Events for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? `أحداث ${selectedDate.toLocaleDateString('ar-SA')}` : 'أحداث اليوم المحدد'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(event.type)}
                          <span className="font-medium">{event.title}</span>
                        </div>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={event.reminderEnabled}
                          onCheckedChange={() => toggleReminder(event.id)}
                        />
                        <Label className="text-sm">تفعيل التذكير</Label>
                        <Bell className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  لا توجد أحداث في هذا التاريخ
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Academic Calendar PDF Events */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              التقويم الأكاديمي الرسمي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 mb-2">
                📄 تم تحميل التقويم الأكاديمي الرسمي
              </p>
              <p className="text-xs text-blue-600">
                جميع الأحداث المهمة للعام الدراسي متوفرة أدناه
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {academicEvents.slice(5).map(event => (
                <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    {getEventTypeIcon(event.type)}
                    <span className="font-medium text-sm">{event.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {event.date.toLocaleDateString('ar-SA')}
                    </span>
                    <Badge className={`${getEventTypeColor(event.type)} text-xs`}>
                      {event.type === 'exam' ? 'امتحان' :
                       event.type === 'deadline' ? 'موعد نهائي' :
                       event.type === 'holiday' ? 'عطلة' :
                       event.type === 'registration' ? 'تسجيل' :
                       event.type === 'lecture' ? 'محاضرات' : event.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الأحداث القادمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map(event => {
                const daysUntil = getDaysUntilEvent(event.date);
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event.type)}
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.date.toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>

                      <div className="text-sm">
                        {daysUntil === 0 ? 'اليوم' : 
                         daysUntil === 1 ? 'غداً' : 
                         daysUntil > 0 ? `باقي ${daysUntil} ${daysUntil === 1 ? 'يوم' : 'أيام'}` : 
                         'انتهى'}
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={event.reminderEnabled}
                          onCheckedChange={() => toggleReminder(event.id)}
                        />
                        <Label className="text-sm">تذكير</Label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}