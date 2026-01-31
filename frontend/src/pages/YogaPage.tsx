import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, wasTrialExpiredHandled } from "@/lib/utils";
import { useTrialError } from "@/contexts/TrialErrorContext";
import { Play, Camera, Square, Timer, CheckCircle, AlertCircle, Maximize2, X } from "lucide-react";

export default function YogaPage() {
  const [selectedPose, setSelectedPose] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isPerfect, setIsPerfect] = useState(false);
  const [perfectSeconds, setPerfectSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const practiceContainerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const perfectTimerRef = useRef<number | null>(null);
  const lastSpokenAtRef = useRef<number>(0);
  const lastFeedbackKeyRef = useRef<string>("");
  const { toast } = useToast();
  const { registerStopAnalysisCallback, unregisterStopAnalysisCallback } = useTrialError();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const yogaPoses = [
    "Tree Pose",
    "ardhamatsyendrasana", 
    "bhujangasana",
    "dandasana",
    "gomukhasana",
    "padmasana",
    "vajrasana"
  ];

  const normalizedPose = (pose: string) => pose.toLowerCase().replace(/\s+/g, "");

  const getVideoSrcForPose = (pose: string) => {
    const key = normalizedPose(pose);
    // Place demo videos in public/videos/*.mp4, e.g., public/videos/treepose.mp4
    if (!key) return "";
    return `/videos/${key}.mp4`;
  };

  const getImageSrcForPose = (pose: string) => {
    const key = normalizedPose(pose);
    // Place demo images in public/images/*.jpg, e.g., public/images/treepose.jpg
    if (!key) return "";
    return `/images/${key}.jpg`;
  };

  const startCamera = async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      // Swallow to avoid noisy UI; could integrate toast in future
      console.error("Unable to access camera", err);
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const speakFeedback = (lines: string[]) => {
    if (!lines || lines.length === 0) return;
    try {
      if (!window.speechSynthesis) return;
      const now = Date.now();
      if (window.speechSynthesis.speaking) return; // avoid overlap
      if (now - lastSpokenAtRef.current < 3000) return; // 3s cooldown
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lines.join(". "));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        lastSpokenAtRef.current = Date.now();
      };
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS failed", err);
    }
  };

  const startPerfectTimer = () => {
    if (perfectTimerRef.current) return;
    perfectTimerRef.current = window.setInterval(() => {
      setPerfectSeconds((s) => s + 1);
    }, 1000);
  };

  const stopPerfectTimer = () => {
    if (perfectTimerRef.current) {
      window.clearInterval(perfectTimerRef.current);
      perfectTimerRef.current = null;
    }
  };

  const captureAndSendFrame = async () => {
    try {
      const poseKey = selectedPose || "";
      if (!poseKey) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      // Ensure canvas matches current video frame size
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/png");

      const body = {
        pose_name: poseKey, // already normalized on selection
        image: dataUrl
      };

      const res = await apiFetch("/api/predict_frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.status === 401) {
        setIsRecording(false);
        toast({ title: "Authentication required", description: "Please sign in to continue.", variant: "destructive" });
        return;
      }
      if (!res.ok) {
        // Check if this is a trial expired error that has already been handled
        if (res.status === 403 && wasTrialExpiredHandled()) {
          // Don't show duplicate error message, just return
          return;
        }
        toast({ title: "Prediction failed", description: `Server responded ${res.status}`, variant: "destructive" });
        return;
      }
      const json = await res.json();
      const lines: string[] = Array.isArray(json?.feedback) ? json.feedback : [];

      // Perfect pose = no corrective feedback
      if (lines.length === 0) {
        if (!isPerfect) {
          setIsPerfect(true);
          setPerfectSeconds(0);
        }
        startPerfectTimer();
      } else {
        if (isPerfect) setIsPerfect(false);
        stopPerfectTimer();
      }

      const newKey = lines.join("|");
      const nowTs = Date.now();
      const unchangedFor6s = nowTs - lastSpokenAtRef.current >= 6000;
      const changed = newKey !== lastFeedbackKeyRef.current;
      if (changed || unchangedFor6s) {
        lastFeedbackKeyRef.current = newKey;
        setFeedback(lines);
        speakFeedback(lines);
      }
    } catch (err) {
      console.warn("Frame send failed", err);
      toast({ title: "Network error", description: "Unable to send frame.", variant: "destructive" });
    }
  };

  // Register the stop analysis callback when component mounts
  useEffect(() => {
    const stopAnalysis = () => {
      setIsRecording(false);
      stopCamera();
      stopPerfectTimer();
    };

    registerStopAnalysisCallback(stopAnalysis);

    return () => {
      unregisterStopAnalysisCallback();
    };
  }, [registerStopAnalysisCallback, unregisterStopAnalysisCallback]);

  // Track fullscreen changes for the practice container
  useEffect(() => {
    const handler = () => {
      const currentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(currentlyFullscreen);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const enterFullscreen = async () => {
    try {
      const el = practiceContainerRef.current as any;
      if (!el) return;
      if (document.fullscreenElement) return;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
      } else {
        toast({ title: "Fullscreen unsupported", description: "Your browser doesn't support fullscreen.", variant: "destructive" });
      }
    } catch (err) {
      console.warn("Failed to enter fullscreen", err);
      toast({ title: "Couldn't enter fullscreen", description: "Please try again.", variant: "destructive" });
    }
  };

  const exitFullscreen = async () => {
    try {
      const doc: any = document as any;
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      }
    } catch (err) {
      console.warn("Failed to exit fullscreen", err);
      toast({ title: "Couldn't exit fullscreen", description: "Press Esc to exit.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isRecording) {
      startCamera().then(() => {
        if (!intervalRef.current) {
          intervalRef.current = window.setInterval(captureAndSendFrame, 1500);
        }
      });
    } else {
      stopCamera();
      stopPerfectTimer();
    }
    return () => {
      stopCamera();
      stopPerfectTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
           Yoga Pose AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Perfect your yoga practice with real-time AI feedback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Demo Section */}
          <Card className="shadow-wellness fade-in lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Pose Demonstration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPose} onValueChange={setSelectedPose}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a yoga pose" />
                </SelectTrigger>
                <SelectContent>
                  {yogaPoses.map(pose => (
                    <SelectItem key={pose} value={normalizedPose(pose)}>
                      {pose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="bg-muted rounded-lg flex items-center justify-center mt-4 overflow-hidden h-[40vh] lg:h-[60vh]">
                {selectedPose ? (
                  <img
                    key={selectedPose}
                    src={getImageSrcForPose(selectedPose)}
                    alt={selectedPose}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Play className="w-12 h-12 mx-auto mb-2" />
                    <p>Pose image will appear here</p>
                    <p className="text-sm">Select a pose to see demonstration</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Camera Feed Section */}
          <Card className="shadow-wellness fade-in lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Your Practice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={practiceContainerRef} className="relative aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {!isFullscreen && (
                  <button
                    type="button"
                    onClick={enterFullscreen}
                    className="absolute top-2 right-2 z-10 inline-flex items-center justify-center rounded-md border border-border bg-background/80 backdrop-blur px-2.5 py-2 text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Enter fullscreen"
                    title="Maximize"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
                {isFullscreen && (
                  <button
                    type="button"
                    onClick={exitFullscreen}
                    className="absolute top-2 right-2 z-10 inline-flex items-center justify-center rounded-md border border-border bg-background/80 backdrop-blur px-2.5 py-2 text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Exit fullscreen"
                    title="Exit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <video ref={videoRef} className="w-full h-full object-cover pointer-events-none" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex flex-col gap-2">
                {isPerfect && (
                  <div className="text-sm text-green-600 font-medium">Perfect pose timer: {Math.floor(perfectSeconds / 60).toString().padStart(2, "0")}:{(perfectSeconds % 60).toString().padStart(2, "0")}</div>
                )}
                {!isPerfect && (
                  <div className="text-sm text-muted-foreground">Hold a correct pose to start the timer</div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsRecording(!isRecording)}
                    variant={isRecording ? "destructive" : "wellness"}
                    className="flex-1"
                  >
                    {isRecording ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isRecording ? "Stop Analysis" : "Start Analysis"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setFeedback([]);
                      setIsPerfect(false);
                      setPerfectSeconds(0);
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                      }
                    }}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        {feedback.length > 0 && (
          <Card className="mt-8 shadow-wellness fade-in">
            <CardHeader>
              <CardTitle>AI Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feedback.map((item, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}