import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { apiFetch } from "@/lib/utils";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SleepData {
  hours: number;
  quality: number;
  sleep_time: string;
  wake_time: string;
  interruptions: number;
}

interface SleepResponse {
  consequences: string[];
  current_state: {
    continuity: string;
    duration_category: string;
    interruptions_count: number;
    quality_category: string;
    sleep_duration_hours: number;
    sleep_quality_rating: number;
    sleep_time: string;
    wake_time: string;
  };
  improvements: string[];
}

export default function SleepTrackerPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SleepData>({
    hours: 7,
    quality: 8,
    sleep_time: "23:00",
    wake_time: "06:00",
    interruptions: 0,
  });
  const [response, setResponse] = useState<SleepResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiFetch('http://127.0.0.1:5000/track_sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("track_sleep response:", data);
        setResponse((data as any)?.recommendations ?? (data as any)?.analysis ?? data);
        toast({
          title: "Sleep analysis complete!",
          description: "Your sleep data has been analyzed successfully.",
        });
      } else {
        if (res.status === 401) {
          toast({ title: 'Unauthorized', description: 'Please login to continue.', variant: 'destructive' });
        }
        throw new Error('Failed to track sleep');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze sleep data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            <Moon className="inline w-10 h-10 mr-2" />
            Sleep Tracker
          </h1>
          <p className="text-lg text-muted-foreground">
            Monitor your sleep patterns and get personalized insights
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-wellness fade-in mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Sleep Data Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hours">Sleep Duration (hours)</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.hours}
                    onChange={(e) => setFormData({...formData, hours: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality">Sleep Quality (1-10)</Label>
                  <Select 
                    value={formData.quality.toString()} 
                    onValueChange={(value) => setFormData({...formData, quality: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} - {i < 3 ? 'Poor' : i < 6 ? 'Fair' : i < 8 ? 'Good' : 'Excellent'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleep_time">Sleep Time</Label>
                  <Input
                    id="sleep_time"
                    type="time"
                    value={formData.sleep_time}
                    onChange={(e) => setFormData({...formData, sleep_time: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wake_time">Wake Time</Label>
                  <Input
                    id="wake_time"
                    type="time"
                    value={formData.wake_time}
                    onChange={(e) => setFormData({...formData, wake_time: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interruptions">Sleep Interruptions</Label>
                  <Input
                    id="interruptions"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.interruptions}
                    onChange={(e) => setFormData({...formData, interruptions: Number(e.target.value)})}
                  />
                </div>

                <div className="flex items-end">
                  <Button type="submit" variant="sleep" className="w-full" disabled={isLoading}>
                    {isLoading ? "Analyzing..." : "Analyze Sleep"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {response && (
            <div className="space-y-6 fade-in">
              {/* Current State */}
              <Card className="shadow-wellness">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sleep">
                    <TrendingUp className="w-5 h-5" />
                    Sleep Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-2xl font-bold text-sleep">{response.current_state?.sleep_duration_hours ?? '-' }h</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="text-xs font-medium">{response.current_state?.duration_category ?? ''}</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-2xl font-bold text-sleep">{response.current_state?.sleep_quality_rating ?? '-' }/10</div>
                      <div className="text-sm text-muted-foreground">Quality</div>
                      <div className="text-xs font-medium">{response.current_state?.quality_category ?? ''}</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-2xl font-bold text-sleep">{response.current_state?.interruptions_count ?? '-'}</div>
                      <div className="text-sm text-muted-foreground">Interruptions</div>
                      <div className="text-xs font-medium">{response.current_state?.continuity ?? ''}</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-sm font-bold text-sleep">
                        {response.current_state?.sleep_time ?? '-'} - {response.current_state?.wake_time ?? '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">Sleep Window</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consequences */}
              {response.consequences?.length > 0 && (
                <Card className="shadow-wellness">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-5 h-5" />
                      Areas of Concern
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {response.consequences?.map((consequence, index) => (
                        <div key={index} className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                          <p className="text-sm">{consequence}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Improvements */}
              <Card className="shadow-wellness">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nutrition">
                    <TrendingUp className="w-5 h-5" />
                    Improvement Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {response.improvements?.map((improvement, index) => (
                      <div key={index} className="p-4 bg-nutrition/5 border border-nutrition/20 rounded-lg">
                        <p className="text-sm">{improvement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <ChatBot />
    </div>
  );
}