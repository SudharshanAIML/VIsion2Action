import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraView } from '../components/CameraView';
import { CameraHandle, AppRoute } from '../types';
import { analyzeImage, askAboutImage } from '../services/geminiService';
import { speak, vibrate, playEarcon } from '../services/accessibilityService';
import { Mic, StopCircle, Navigation, Loader2 } from 'lucide-react';

export const ContinuousScreen: React.FC = () => {
  const navigate = useNavigate();
  const cameraRef = useRef<CameraHandle>(null);
  
  // States
  const [isActive, setIsActive] = useState(true); 
  const [status, setStatus] = useState<string>("Initializing...");
  const [isListening, setIsListening] = useState(false);
  const [lastImage, setLastImage] = useState<string | null>(null);

  // Refs for loop management
  const isLoopRunning = useRef(true);
  const processingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for Interaction
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const isLongPressHandled = useRef(false);
  const hasRecognitionResult = useRef(false); // New ref to track success

  // --- Voice Recognition Logic ---

  const startVoiceQuery = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Voice control not supported.");
      return;
    }

    // Cancel any existing speech immediately
    window.speechSynthesis.cancel();
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false; 
    recognition.interimResults = false;
    
    // Reset result tracker
    hasRecognitionResult.current = false;

    recognition.onstart = () => {
      setIsListening(true);
      playEarcon('listen');
      setStatus("Listening...");
      vibrate(100);
    };

    recognition.onend = () => {
      // If recognition ends (either naturally or forced by stop)
      // Check if we got a result. If not, reset everything.
      if (!hasRecognitionResult.current) {
         setIsListening(false);
         if (processingRef.current) {
            // If we were processing (locked), unlock it because we failed to get a query
            processingRef.current = false;
            // speak("Cancelled."); // Optional: too chatty?
            scheduleNextFrame(500);
         }
      }
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        hasRecognitionResult.current = true;
        handleUserQuestion(transcript);
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech Error", e);
      setIsListening(false);
      hasRecognitionResult.current = false; 
      
      // If user just denied permission or no speech, recover gracefully
      processingRef.current = false;
      scheduleNextFrame(1000);
      
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
         speak("Mic error.");
      }
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Recognition start failed", e);
      processingRef.current = false;
    }
  };

  const stopVoiceQuery = () => {
    if (recognitionRef.current) {
      // stopping triggers onend
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  // --- Logic Handlers ---

  const handleUserQuestion = async (question: string) => {
    setIsListening(false);
    processingRef.current = true; // Keep loop locked while answering
    
    playEarcon('processing'); 
    setStatus(`"${question}"`);

    try {
      // Capture fresh image or use last known
      const currentImage = cameraRef.current?.captureFrame() || lastImage;

      if (currentImage) {
        const answer = await askAboutImage(currentImage, question);
        setStatus(answer);
        speak(answer);
      } else {
        speak("I can't see anything right now.");
      }
    } catch (e) {
      speak("Sorry, I couldn't answer.");
    } finally {
      // Give time for the answer to be spoken before resuming nav
      // We unlock navigation after a fixed delay to ensure the answer is heard
      setTimeout(() => {
        processingRef.current = false;
        scheduleNextFrame(1000); 
      }, 4000); // Increased delay to 4s to allow answer to finish
    }
  };

  const processNavigationFrame = async () => {
    if (!isLoopRunning.current) return;
    
    // Don't process nav frames if we are listening or answering a question
    if (processingRef.current || isListening) {
      scheduleNextFrame(500);
      return;
    }

    processingRef.current = true;

    try {
      const imageBase64 = cameraRef.current?.captureFrame();
      
      if (imageBase64) {
        setLastImage(imageBase64); 
        const description = await analyzeImage(imageBase64);
        
        // Only speak if user hasn't interrupted
        if (description && isLoopRunning.current && !isListening && processingRef.current) {
          setStatus(description);
          speak(description);
        }
      }
    } catch (e) {
      console.warn("Nav frame skipped", e);
    } finally {
      // Note: We don't unlock processingRef here immediately if we want to ensure speech finishes?
      // Actually, analyzeImage returns text. speak() is async in nature (fire and forget).
      // We unlock processingRef so next frame can start processing, but maybe we want a gap?
      processingRef.current = false;
      scheduleNextFrame(4000); // 4s interval
    }
  };

  const scheduleNextFrame = (delay: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isLoopRunning.current) {
      timerRef.current = setTimeout(processNavigationFrame, delay);
    }
  };

  // --- Interaction Handlers (Tap vs Hold) ---

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Crucial: stop existing speech immediately when user touches screen
    // This makes the UI feel responsive
    if (isActive) {
        window.speechSynthesis.cancel();
    }
    
    isLongPressHandled.current = false;
    
    longPressTimer.current = setTimeout(() => {
      // Long Press Detected
      isLongPressHandled.current = true;
      processingRef.current = true; // Lock Nav Loop immediately so no new analysis starts
      startVoiceQuery();
    }, 500); // 500ms threshold
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isLongPressHandled.current) {
      // User was holding, now released -> Stop listening and wait for result
      stopVoiceQuery();
      // processingRef.current remains true until onend or handleUserQuestion resolves it
    } else {
      // Short tap detected -> Toggle Session
      toggleSession();
    }
  };

  const toggleSession = () => {
    if (isActive) {
      setIsActive(false);
      speak("Paused.");
      vibrate([50, 50]);
    } else {
      setIsActive(true);
      // speak handled in effect
      vibrate(50);
    }
  };

  // --- Effects ---

  useEffect(() => {
    if (isActive) {
      isLoopRunning.current = true;
      speak("Navigation Active.");
      // Small delay to let "Navigation Active" start speaking before we grab camera
      timerRef.current = setTimeout(processNavigationFrame, 1000);
    } else {
      isLoopRunning.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setStatus("Paused. Tap to Resume.");
    }
    
    return () => {
      isLoopRunning.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="flex flex-col h-full bg-slate-900 relative select-none">
      
      {/* Hidden Camera Layer */}
      <div className="absolute inset-0 z-0 opacity-50">
        <CameraView ref={cameraRef} />
      </div>

      {/* Main Interactive Layer */}
      <div 
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()} // Prevent context menu
        className="absolute inset-0 z-10 w-full h-full flex flex-col items-center justify-center p-6 bg-transparent active:bg-white/5 transition-colors cursor-pointer touch-none"
        role="button"
        aria-label={isListening ? "Listening" : (isActive ? "Stop Navigation" : "Start Navigation")}
        tabIndex={0}
      >
        {/* Status Display */}
        <div className={`
           p-8 rounded-3xl backdrop-blur-md border-4 shadow-2xl max-w-sm w-full
           flex flex-col items-center text-center gap-4 transition-all duration-300
           ${isListening ? 'bg-red-900/80 border-red-500 scale-110' : (isActive ? 'bg-black/60 border-yellow-400' : 'bg-slate-800/90 border-slate-600')}
        `}>
          
          {isListening ? (
             <Mic size={64} className="text-white animate-pulse" />
          ) : isActive ? (
             <Navigation size={48} className="text-yellow-400" />
          ) : (
             <StopCircle size={48} className="text-slate-400" />
          )}

          <h2 className={`text-2xl font-black uppercase ${isActive || isListening ? 'text-white' : 'text-slate-400'}`}>
            {isListening ? "Listening..." : (isActive ? "Monitoring" : "Paused")}
          </h2>

          <p className="text-xl font-bold text-yellow-300 leading-snug min-h-[3rem]">
            {status}
          </p>
          
          {isActive && processingRef.current && !isListening && (
            <Loader2 className="animate-spin text-white opacity-50" size={24}/>
          )}
        </div>

        {/* Footer Instruction */}
        <div className="absolute bottom-10 opacity-80 bg-black/60 px-6 py-3 rounded-full border border-white/10 backdrop-blur">
          <p className="text-white font-bold tracking-wide">
            Tap to {isActive ? "Pause" : "Start"} • Hold to Ask
          </p>
        </div>
      </div>

      {/* Back Button (Small, top left) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Only works if pointer events enabled
            navigate(AppRoute.HOME);
          }}
          className="p-3 bg-slate-800 rounded-full text-white border border-slate-600 pointer-events-auto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

    </div>
  );
};