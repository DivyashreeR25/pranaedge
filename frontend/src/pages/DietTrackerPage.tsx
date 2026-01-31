import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { apiFetch } from "@/lib/utils";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Apple, Plus, Trash2, TrendingUp, AlertCircle, Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Meal {
  name: string;
  items: string[];
}

interface DietData {
  meals: Meal[];
  water_intake: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DietResponse {
  consequences: string[];
  current_state: {
    hydration_status: string;
    macro_distribution: {
      carbs_percentage: number;
      fats_percentage: number;
      protein_percentage: number;
    };
    macronutrients: {
      carbs_grams: number;
      fats_grams: number;
      protein_grams: number;
    };
    meal_count: number;
    meal_frequency: string;
    total_calories: number;
    water_intake_liters: number;
  };
  improvements: string[];
}

export default function DietTrackerPage() {
  const [formData, setFormData] = useState<DietData>({
    meals: [{ name: "Breakfast", items: [""] }],
    water_intake: 2.0,
    calories: 2000,
    protein: 80,
    carbs: 250,
    fats: 70,
  });
  const [response, setResponse] = useState<DietResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMeal = () => {
    setFormData({
      ...formData,
      meals: [...formData.meals, { name: "", items: [""] }]
    });
  };

  const removeMeal = (index: number) => {
    const newMeals = formData.meals.filter((_, i) => i !== index);
    setFormData({ ...formData, meals: newMeals });
  };

  const updateMeal = (index: number, field: string, value: string) => {
    const newMeals = [...formData.meals];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setFormData({ ...formData, meals: newMeals });
  };

  const addMealItem = (mealIndex: number) => {
    const newMeals = [...formData.meals];
    newMeals[mealIndex].items.push("");
    setFormData({ ...formData, meals: newMeals });
  };

  const updateMealItem = (mealIndex: number, itemIndex: number, value: string) => {
    const newMeals = [...formData.meals];
    newMeals[mealIndex].items[itemIndex] = value;
    setFormData({ ...formData, meals: newMeals });
  };

  const removeMealItem = (mealIndex: number, itemIndex: number) => {
    const newMeals = [...formData.meals];
    newMeals[mealIndex].items.splice(itemIndex, 1);
    setFormData({ ...formData, meals: newMeals });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Filter out empty meals and items
    const cleanedData = {
      ...formData,
      meals: formData.meals
        .filter(meal => meal.name.trim())
        .map(meal => ({
          ...meal,
          items: meal.items.filter(item => item.trim())
        }))
        .filter(meal => meal.items.length > 0)
    };

    try {
      const res = await apiFetch('http://127.0.0.1:5000/track_diet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        toast({
          title: "Diet analysis complete!",
          description: "Your nutrition data has been analyzed successfully.",
        });
      } else {
        if (res.status === 401) {
          toast({ title: 'Unauthorized', description: 'Please login to continue.', variant: 'destructive' });
        }
        throw new Error('Failed to track diet');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze diet data. Please try again.",
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
            <Apple className="inline w-10 h-10 mr-2" />
            Diet Tracker
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your meals and macronutrients for optimal health
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-wellness fade-in mb-8">
            <CardHeader>
              <CardTitle>Daily Nutrition Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Meals Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Meals</Label>
                    <Button type="button" onClick={addMeal} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Meal
                    </Button>
                  </div>
                  
                  {formData.meals.map((meal, mealIndex) => (
                    <Card key={mealIndex} className="border-2">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Meal name (e.g., Breakfast)"
                              value={meal.name}
                              onChange={(e) => updateMeal(mealIndex, 'name', e.target.value)}
                              className="flex-1"
                            />
                            {formData.meals.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeMeal(mealIndex)}
                                variant="outline"
                                size="icon"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm">Food Items</Label>
                            {meal.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center gap-2">
                                <Input
                                  placeholder="Food item"
                                  value={item}
                                  onChange={(e) => updateMealItem(mealIndex, itemIndex, e.target.value)}
                                  className="flex-1"
                                />
                                {meal.items.length > 1 && (
                                  <Button
                                    type="button"
                                    onClick={() => removeMealItem(mealIndex, itemIndex)}
                                    variant="outline"
                                    size="icon"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => addMealItem(mealIndex)}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Item
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Macronutrients */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({...formData, calories: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={formData.protein}
                      onChange={(e) => setFormData({...formData, protein: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      value={formData.carbs}
                      onChange={(e) => setFormData({...formData, carbs: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fats">Fats (g)</Label>
                    <Input
                      id="fats"
                      type="number"
                      value={formData.fats}
                      onChange={(e) => setFormData({...formData, fats: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="water">Water Intake (liters)</Label>
                  <Input
                    id="water"
                    type="number"
                    step="0.1"
                    value={formData.water_intake}
                    onChange={(e) => setFormData({...formData, water_intake: Number(e.target.value)})}
                  />
                </div>

                <Button type="submit" variant="nutrition" className="w-full" disabled={isLoading}>
                  {isLoading ? "Analyzing..." : "Analyze Diet"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {response && (
            <div className="space-y-6 fade-in">
              {/* Current State */}
              <Card className="shadow-wellness">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nutrition">
                    <TrendingUp className="w-5 h-5" />
                    Nutrition Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-2xl font-bold text-nutrition">{response.current_state.total_calories}</div>
                      <div className="text-sm text-muted-foreground">Calories</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-2xl font-bold text-nutrition">{response.current_state.meal_count}</div>
                      <div className="text-sm text-muted-foreground">Meals</div>
                      <div className="text-xs font-medium">{response.current_state.meal_frequency}</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-2xl font-bold text-nutrition">{response.current_state.water_intake_liters}L</div>
                      <div className="text-sm text-muted-foreground">Water</div>
                      <div className="text-xs font-medium">{response.current_state.hydration_status}</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <Droplets className="w-8 h-8 mx-auto mb-2 text-nutrition" />
                      <div className="text-xs font-medium">Hydration Status</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Macronutrient Distribution</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-card rounded-lg">
                        <div className="text-lg font-bold text-nutrition">
                          {response.current_state.macro_distribution.protein_percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">Protein</div>
                        <div className="text-xs">{response.current_state.macronutrients.protein_grams}g</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-card rounded-lg">
                        <div className="text-lg font-bold text-nutrition">
                          {response.current_state.macro_distribution.carbs_percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">Carbs</div>
                        <div className="text-xs">{response.current_state.macronutrients.carbs_grams}g</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-card rounded-lg">
                        <div className="text-lg font-bold text-nutrition">
                          {response.current_state.macro_distribution.fats_percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">Fats</div>
                        <div className="text-xs">{response.current_state.macronutrients.fats_grams}g</div>
                      </div>
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