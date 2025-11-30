import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import loadingVideo from "@/assets/loading-animation.mp4";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const { language } = useLanguage();

  const text = {
    en: "Warning : A bright future is loading",
    ml: "മുന്നറിയിപ്പ് : ഉജ്ജ്വലമായ ഭാവി ലോഡ് ചെയ്യുന്നു"
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 px-4">
        {/* Loading Animation */}
        <div className="animate-fade-in-up">
          <video 
            src={loadingVideo} 
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-4xl h-auto"
          />
        </div>

        {/* Progress Percentage */}
        <div className="text-muted-foreground text-sm font-mono animate-fade-in-up delay-200">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
