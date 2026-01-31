import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, X, Clock, Users, TrendingUp, AlertTriangle, Image as ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/utils";

interface NutritionData {
  height: number;
  weight: number;
  age: number;
  gender: string;
  activity_level: string;
  diseases: string[];
}

interface NutritionResponse {
  disease_specific_advice?: {
    [key: string]: {
      recommendation: string;
      recommended_foods: string[];
    };
  };
  health_metrics: {
    bmi: number;
    general_recommendation: string;
    weight_status: string;
  };
  nutrition_plan: {
    carbs_grams: number;
    daily_calories: number;
    fats_grams: number;
    macronutrient_split: {
      carbs: number;
      fats: number;
      protein: number;
    };
    protein_grams: number;
  };
  recommended_foods: {
    [key: string]: string[];
  };
  recommended_recipes: Array<{
    calories_per_serving: number;
    meal_type: string;
    prep_time: number;
    recipe_name: string;
  }>;
}

export default function NutritionGuidePage() {
  const [formData, setFormData] = useState<NutritionData>({
    height: 170,
    weight: 65,
    age: 25,
    gender: "male",
    activity_level: "moderate",
    diseases: [],
  });
  const [newDisease, setNewDisease] = useState("");
  const [response, setResponse] = useState<NutritionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [analyzerIsLoading, setAnalyzerIsLoading] = useState(false);
  const [analyzerResult, setAnalyzerResult] = useState<null | { nutrients?: Record<string, number>; raw_text?: string }>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const addDisease = () => {
    if (newDisease.trim() && !formData.diseases.includes(newDisease.trim().toLowerCase())) {
      setFormData({
        ...formData,
        diseases: [...formData.diseases, newDisease.trim().toLowerCase()]
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

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      toast({ title: "No image selected", description: "Please choose an image to analyze.", variant: "destructive" });
      return;
    }
    setAnalyzerIsLoading(true);
    setAnalyzerResult(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await apiFetch('http://127.0.0.1:8082/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to analyze image');
      const data = await res.json();
      const result = data?.result || {};
      setAnalyzerResult({ nutrients: result?.nutrients, raw_text: result?.raw_text });
      toast({ title: "Analysis complete", description: "Nutrition info extracted from the image." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to analyze image. Try again.", variant: "destructive" });
    } finally {
      setAnalyzerIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiFetch('http://127.0.0.1:5000/api/nutrition_recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("nutrition_recommendation response:", data);
        setResponse((data as any)?.recommendations ?? data);
        toast({
          title: "Nutrition analysis complete!",
          description: "Your personalized nutrition guide has been generated.",
        });
      } else {
        if (res.status === 401) {
          toast({ title: 'Unauthorized', description: 'Please login to continue.', variant: 'destructive' });
        }
        throw new Error('Failed to get nutrition recommendations');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate nutrition guide. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            <BookOpen className="inline w-10 h-10 mr-2" />
            Nutrition Guide
          </h1>
          <p className="text-lg text-muted-foreground">
            Get personalized nutrition recommendations based on your health profile
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Food Analyzer */}
          <Card className="shadow-wellness fade-in mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-nutrition">
                <ImageIcon className="w-5 h-5" />
                Food Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                <div className="w-full md:w-1/2 space-y-2">
                  <Label htmlFor="food-image">Upload an image</Label>
                  <Input id="food-image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </div>
                <Button variant="nutrition" onClick={handleAnalyzeImage} disabled={analyzerIsLoading}>
                  <Upload className="w-4 h-4" />
                  {analyzerIsLoading ? 'Analyzing…' : 'Analyze Image'}
                </Button>
              </div>

              {analyzerResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-base">Nutrients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyzerResult.nutrients ? (
                        <div className="space-y-2">
                          {Object.entries(analyzerResult.nutrients).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-2 bg-gradient-card rounded text-sm">
                              <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No nutrient data returned.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-base">Extracted Text</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-gradient-card rounded text-sm whitespace-pre-wrap">
                        {analyzerResult.raw_text || 'No text returned.'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-wellness fade-in mb-8">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="space-y-2">
                    <Label htmlFor="activity_level">Activity Level</Label>
                    <Select 
                      value={formData.activity_level} 
                      onValueChange={(value) => setFormData({...formData, activity_level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                        <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (physical job + exercise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Medical Conditions (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a medical condition (e.g., diabetes, hypertension)"
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

                <Button type="submit" variant="nutrition" className="w-full" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Get Nutrition Recommendations"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {response && (
            <div className="space-y-6 fade-in">
              <Tabs defaultValue="plan" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="plan">Nutrition Plan</TabsTrigger>
                  <TabsTrigger value="foods">Recommended Foods</TabsTrigger>
                  <TabsTrigger value="recipes">Recipes</TabsTrigger>
                  <TabsTrigger value="health">Health Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="plan" className="space-y-6">
                  {/* Nutrition Plan */}
                  <Card className="shadow-wellness">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-nutrition">
                        <TrendingUp className="w-5 h-5" />
                        Daily Nutrition Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gradient-card rounded-lg">
                          <div className="text-2xl font-bold text-nutrition">{response.nutrition_plan?.daily_calories ?? "-"}</div>
                          <div className="text-sm text-muted-foreground">Daily Calories</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-card rounded-lg">
                          <div className="text-2xl font-bold text-nutrition">{response.nutrition_plan?.protein_grams ?? "-"}g</div>
                          <div className="text-sm text-muted-foreground">Protein</div>
                          <div className="text-xs">{response.nutrition_plan?.macronutrient_split?.protein ?? "-"}%</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-card rounded-lg">
                          <div className="text-2xl font-bold text-nutrition">{response.nutrition_plan?.carbs_grams ?? "-"}g</div>
                          <div className="text-sm text-muted-foreground">Carbs</div>
                          <div className="text-xs">{response.nutrition_plan?.macronutrient_split?.carbs ?? "-"}%</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-card rounded-lg">
                          <div className="text-2xl font-bold text-nutrition">{response.nutrition_plan?.fats_grams ?? "-"}g</div>
                          <div className="text-sm text-muted-foreground">Fats</div>
                          <div className="text-xs">{response.nutrition_plan?.macronutrient_split?.fats ?? "-"}%</div>
                        </div>
                      </div>
                      {(!response.nutrition_plan ||
                        response.nutrition_plan.daily_calories === undefined) && (
                        <p className="text-sm text-muted-foreground">
                          No nutrition plan fields returned by the server. Check backend response shape.
                        </p>
                      )}

                      {/* Disease-specific advice */}
                      {response.disease_specific_advice && Object.keys(response.disease_specific_advice).length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Condition-Specific Advice
                          </h4>
                          {Object.entries(response.disease_specific_advice).map(([disease, advice]) => (
                            <Card key={disease} className="border-orange-200">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg capitalize">{disease}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm mb-4">{advice.recommendation}</p>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Recommended Foods:</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {advice.recommended_foods.map((food, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {food}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="foods" className="space-y-6">
                  {/* Recommended Foods */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(response.recommended_foods || {}).map(([category, foods]) => (
                      <Card key={category} className="shadow-wellness">
                        <CardHeader>
                          <CardTitle className="text-lg capitalize flex items-center gap-2">
                            {category.replace('_', ' ')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {foods?.map((food, index) => (
                              <div key={index} className="p-2 bg-gradient-card rounded text-sm">
                                {food}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recipes" className="space-y-6">
                  {/* Recommended Recipes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {response.recommended_recipes?.map((recipe, index) => (
                      <Card key={index} className="shadow-wellness hover:shadow-floating transition-wellness">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="text-2xl">{getMealTypeIcon(recipe.meal_type)}</span>
                            {recipe.recipe_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {recipe.prep_time} min
                              </span>
                              <Badge variant="outline" className="capitalize">
                                {recipe.meal_type}
                              </Badge>
                            </div>
                            <div className="text-center p-3 bg-gradient-card rounded-lg">
                              <div className="text-lg font-bold text-nutrition">{recipe.calories_per_serving}</div>
                              <div className="text-sm text-muted-foreground">Calories per serving</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-6">
                  {/* Health Metrics */}
                  <Card className="shadow-wellness">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Health Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-card rounded-lg">
                          <div className="text-3xl font-bold text-primary">{response.health_metrics?.bmi?.toFixed ? response.health_metrics.bmi.toFixed(1) : "-"}</div>
                          <div className="text-sm text-muted-foreground">BMI</div>
                          <Badge variant="secondary" className="mt-2">
                            {response.health_metrics?.weight_status || ""}
                          </Badge>
                        </div>
                        <div className="col-span-2 p-6 bg-gradient-card rounded-lg">
                          <h4 className="font-semibold mb-3">General Recommendation</h4>
                          <p className="text-sm text-muted-foreground">
                            {response.health_metrics?.general_recommendation || ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      <ChatBot />
    </div>
  );
}