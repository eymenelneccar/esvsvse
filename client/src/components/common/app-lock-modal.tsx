import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { APP_LOCK_PASSWORD } from "@/lib/constants";

interface AppLockModalProps {
  isOpen?: boolean;
  onUnlock?: () => void;
}

export default function AppLockModal({ isOpen = false, onUnlock }: AppLockModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === APP_LOCK_PASSWORD) {
      setPassword("");
      setError("");
      onUnlock?.();
    } else {
      setError("كلمة مرور خاطئة");
      setPassword("");
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-96 max-w-90vw" dir="rtl">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary text-2xl" size={32} />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            التطبيق مقفل
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            أدخل كلمة المرور للمتابعة
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="كلمة المرور (235711)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center text-lg tracking-widest"
              data-testid="input-unlock-password"
            />
            {error && (
              <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full"
            data-testid="button-unlock-app"
          >
            فتح التطبيق
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
