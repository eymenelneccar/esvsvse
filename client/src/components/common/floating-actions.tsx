import { Button } from "@/components/ui/button";
import { Languages, Mic } from "lucide-react";

export default function FloatingActions() {
  const handleQuickTranslate = () => {
    console.log("Quick translate action");
  };

  const handleVoiceCommand = () => {
    console.log("Voice command action");
  };

  return (
    <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-40">
      <Button
        size="icon"
        className="w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90"
        onClick={handleQuickTranslate}
        data-testid="button-quick-translate"
      >
        <Languages size={20} />
      </Button>
      
      <Button
        size="icon"
        className="w-12 h-12 bg-secondary text-white rounded-full shadow-lg hover:bg-secondary/90"
        onClick={handleVoiceCommand}
        data-testid="button-voice-command"
      >
        <Mic size={20} />
      </Button>
    </div>
  );
}
