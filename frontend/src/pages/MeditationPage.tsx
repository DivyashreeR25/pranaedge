import { Navbar } from "@/components/Navbar";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pause, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/utils";

type Emotion = "calm" | "focus" | "relax" | "sleep";

export default function MeditationPage() {
  const [emotion, setEmotion] = useState<Emotion>("calm");
  const [script, setScript] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const pickCalmVoice = (): SpeechSynthesisVoice | undefined => {
    // Prefer an English, natural-sounding voice
    const english = voices.filter(v => /en(-|_|\b)/i.test(v.lang || ""));
    return english[0] || voices[0];
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  };

  const speakText = (text: string) => {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = pickCalmVoice();
    utterance.rate = 0.9; // slightly slower for calm delivery
    utterance.pitch = 0.9; // softer tone
    utterance.volume = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const togglePause = () => {
    if (!isSpeaking) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
  };

  const generateMeditation = async () => {
    setIsGenerating(true);
    stopSpeaking();
    try {
      const res = await apiFetch('http://127.0.0.1:8081/generate_meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion }),
      });
      if (!res.ok) throw new Error('Failed to generate meditation');
      const data = await res.json();
      const s = data?.script || "";
      setScript(s);
      if (s) {
        // Auto-start narration
        speakText(s);
      }
    } catch (e) {
      setScript("Could not generate meditation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            AI Meditation Narration
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate a guided meditation script and listen in a calm voice
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="shadow-wellness">
            <CardHeader>
              <CardTitle>Choose Emotion</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="w-full sm:w-64 space-y-2">
                <Label>Emotion</Label>
                <Select value={emotion} onValueChange={(v) => setEmotion(v as Emotion)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="focus">Focus</SelectItem>
                    <SelectItem value="relax">Relax</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="meditation" onClick={generateMeditation} disabled={isGenerating}>
                {isGenerating ? 'Generating…' : 'Generate Meditation'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-wellness">
            <CardHeader>
              <CardTitle>Meditation Script</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-[200px] p-4 bg-gradient-card rounded-lg whitespace-pre-wrap text-sm leading-6">
                {script || "Your generated meditation script will appear here."}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="module" onClick={() => speakText(script)} disabled={!script}>
                  <Play className="w-4 h-4" />
                  Play
                </Button>
                <Button variant="outline" onClick={togglePause} disabled={!script || !isSpeaking}>
                  <Pause className="w-4 h-4" />
                  Pause/Resume
                </Button>
                <Button variant="outline" onClick={stopSpeaking} disabled={!script || !isSpeaking}>
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChatBot />
    </div>
  );
}