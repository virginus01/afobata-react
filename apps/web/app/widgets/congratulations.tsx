import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define types for the component props
interface CongratulationsEffectProps {
  celebrationEmojis?: string[];
  confettiCount?: number;
  duration?: number;
  onComplete?: () => void;
}

// Define type for confetti piece
interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
  emoji: string;
}

// Define the ref type for imperative handle
export interface CongratulationsEffectRef {
  trigger: () => void;
}

const CongratulationsEffect = forwardRef<
  CongratulationsEffectRef,
  CongratulationsEffectProps
>(
  (
    {
      celebrationEmojis = ["🎊", "🥳", "🎉", "🍾"],
      confettiCount = 200,
      duration = 3000,
      onComplete,
    },
    ref
  ) => {
    const [showConfetti, setShowConfetti] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio on component mount
    React.useEffect(() => {
      audioRef.current = new Audio("/success.mp3"); // Changed path to start with "/"
      audioRef.current.preload = "auto";

      // Optional: Load the audio
      audioRef.current.load();
    }, []);

    // Expose trigger method to parent component
    useImperativeHandle(ref, () => ({
      trigger: triggerCongratulations,
    }));

    const generateConfetti = (): ConfettiPiece[] => {
      const confetti: ConfettiPiece[] = [];
      for (let i = 0; i < confettiCount; i++) {
        confetti.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 10 + 5,
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5,
          emoji:
            celebrationEmojis[
              Math.floor(Math.random() * celebrationEmojis.length)
            ],
        });
      }
      return confetti;
    };

    const triggerCongratulations = () => {
      // Play the success sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reset audio to start

        // Add user interaction check
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            if (error.name === "NotAllowedError") {
              console.warn("Audio playback requires user interaction first");
            } else {
              console.warn("Audio playback failed:", error);
            }
          });
        }
      }

      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        if (onComplete) onComplete();
      }, duration);
    };

    const confettiVariants = {
      hidden: { opacity: 0, scale: 0, rotate: 0 },
      visible: (custom: any) => ({
        opacity: [0, 1, 1, 0],
        scale: [0, 1.5, 1, 0.5],
        rotate: [custom.rotation, custom.rotation + 360],
        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
        y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
        transition: {
          delay: custom.delay,
          duration: 2,
          times: [0, 0.2, 0.8, 1],
          type: "tween",
          ease: "easeInOut",
        },
      }),
    };

    return (
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {generateConfetti().map((item) => (
              <motion.div
                key={item.id}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={item}
                variants={confettiVariants}
                style={{
                  position: "absolute",
                  left: item.x,
                  top: item.y,
                  fontSize: `${item.size}px`,
                }}
              >
                {item.emoji}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    );
  }
);

CongratulationsEffect.displayName = "CongratulationsEffect";

export default CongratulationsEffect;
