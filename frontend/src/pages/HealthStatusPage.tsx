import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { apiFetch } from "@/lib/utils";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, TrendingUp, User, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HealthData {
  height: number;
  weight: number;
  age: number;
  gender: string;
  diseases: string[];
}

interface HealthResponse {
  bmi: number;
  general_recommendation: string;
  weight_status: string;
}

export default function HealthStatusPage() {
  const [formData, setFormData] = useState<HealthData>({
    height: 170,
    weight: 65,
    age: 25,
    gender: "male",
    diseases: [],
  });
  const [newDisease, setNewDisease] = useState("");
  const [response, setResponse] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addDisease = () => {
    if (newDisease.trim() && !formData.diseases.includes(newDisease.trim())) {
      setFormData({
        ...formData,
        diseases: [...formData.diseases, newDisease.trim()]
      });
      setNewDisease("");
    }
  };

  const removeDisease = (disease: string) => {
    setFormData({
      ...formData,
      diseases: formData.diseases.filter(d => d !== disease)
    });
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-600", bg: "bg-blue-50" };
    if (bmi < 25) return { status: "Normal", color: "text-green-600", bg: "bg-green-50" };
    if (bmi < 30) return { status: "Overweight", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { status: "Obese", color: "text-red-600", bg: "bg-red-50" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiFetch('http://127.0.0.1:5000/api/health_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        toast({
          title: "Health analysis complete!",
          description: "Your health status has been analyzed successfully.",
        });
      } else {
        if (res.status === 401) {
          toast({ title: 'Unauthorized', description: 'Please login to continue.', variant: 'destructive' });
        }
        throw new Error('Failed to analyze health status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze health data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bmiStatusInfo = response ? getBMIStatus(response.bmi) : null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            <Activity className="inline w-10 h-10 mr-2" />
            Health Status
          </h1>
          <p className="text-lg text-muted-foreground">
            Monitor your overall health metrics and get personalized insights
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-wellness fade-in mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Health Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="100"
                      max="250"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="20"
                      max="300"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => setFormData({...formData, gender: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Medical Conditions (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a medical condition"
                      value={newDisease}
                      onChange={(e) => setNewDisease(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDisease())}
                    />
                    <Button type="button" onClick={addDisease} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.diseases.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.diseases.map((disease, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {disease}
                          <button
                            type="button"
                            onClick={() => removeDisease(disease)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" variant="default" className="w-full" disabled={isLoading}>
                  {isLoading ? "Analyzing..." : "Analyze Health Status"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {response && (
            <div className="space-y-6 fade-in">
              {/* BMI Analysis */}
              <Card className="shadow-wellness">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Health Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* BMI Circle */}
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeDasharray={`${Math.min((response.bmi / 40) * 100, 100)}, 100`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{response.bmi.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">BMI</div>
                          </div>
                        </div>
                      </div>
                      {bmiStatusInfo && (
                        <Badge variant="secondary" className={`${bmiStatusInfo.color} ${bmiStatusInfo.bg}`}>
                          {bmiStatusInfo.status}
                        </Badge>
                      )}
                    </div>

                    {/* Weight Status */}
                    <div className="text-center p-6 bg-gradient-card rounded-lg">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-semibold">{response.weight_status}</div>
                      <div className="text-sm text-muted-foreground">Weight Status</div>
                    </div>

                    {/* BMI Scale */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">BMI Scale</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Underweight</span>
                          <span>&lt; 18.5</span>
                        </div>
                        <div className="flex justify-between font-medium text-green-600">
                          <span>Normal</span>
                          <span>18.5 - 24.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overweight</span>
                          <span>25.0 - 29.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Obese</span>
                          <span>≥ 30.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="shadow-wellness">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nutrition">
                    <TrendingUp className="w-5 h-5" />
                    General Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-nutrition/5 border border-nutrition/20 rounded-lg">
                    <p className="text-sm">{response.general_recommendation}</p>
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