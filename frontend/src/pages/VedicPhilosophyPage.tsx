import { Navbar } from "@/components/Navbar";
import { ChatBot } from "@/components/ChatBot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Sun, 
  Leaf, 
  Heart, 
  Brain, 
  Flower2, 
  Mountain, 
  Waves,
  Star,
  Moon
} from "lucide-react";

const doshaData = [
  {
    name: "Vata",
    element: "Air & Space",
    icon: <Waves className="w-8 h-8" />,
    characteristics: ["Creative", "Energetic", "Quick thinking", "Restless"],
    bodyType: "Thin, light frame, dry skin",
    balancingFoods: ["Warm, moist foods", "Sweet, sour, salty tastes", "Cooked grains", "Warm milk"],
    imbalanceSigns: ["Anxiety", "Dry skin", "Constipation", "Insomnia"],
    color: "text-blue-600"
  },
  {
    name: "Pitta",
    element: "Fire & Water",
    icon: <Sun className="w-8 h-8" />,
    characteristics: ["Intense", "Goal-oriented", "Sharp intellect", "Leadership"],
    bodyType: "Medium build, warm body, oily skin",
    balancingFoods: ["Cool, refreshing foods", "Sweet, bitter, astringent", "Fresh fruits", "Coconut water"],
    imbalanceSigns: ["Anger", "Inflammation", "Acidity", "Skin rashes"],
    color: "text-red-600"
  },
  {
    name: "Kapha",
    element: "Earth & Water",
    icon: <Mountain className="w-8 h-8" />,
    characteristics: ["Calm", "Stable", "Compassionate", "Patient"],
    bodyType: "Heavy build, cool, moist skin",
    balancingFoods: ["Light, warm foods", "Pungent, bitter, astringent", "Spices", "Herbal teas"],
    imbalanceSigns: ["Weight gain", "Lethargy", "Depression", "Congestion"],
    color: "text-green-600"
  }
];

const practices = [
  {
    title: "Pranayama (Breathing)",
    icon: <Leaf className="w-6 h-6" />,
    description: "Ancient breathing techniques to control life force energy",
    benefits: ["Reduces stress", "Improves focus", "Balances emotions", "Enhances vitality"],
    techniques: ["Ujjayi (Victorious Breath)", "Nadi Shodhana (Alternate Nostril)", "Bhastrika (Bellows Breath)"]
  },
  {
    title: "Meditation (Dhyana)",
    icon: <Brain className="w-6 h-6" />,
    description: "Practices for mental clarity and spiritual growth",
    benefits: ["Inner peace", "Self-awareness", "Emotional balance", "Spiritual growth"],
    techniques: ["Mindfulness meditation", "Mantra meditation", "Trataka (candle gazing)", "Walking meditation"]
  },
  {
    title: "Yoga Asanas",
    icon: <Flower2 className="w-6 h-6" />,
    description: "Physical postures for body-mind harmony",
    benefits: ["Physical strength", "Flexibility", "Mental clarity", "Energy balance"],
    techniques: ["Sun Salutations", "Standing poses", "Backbends", "Inversions"]
  },
  {
    title: "Ayurvedic Lifestyle",
    icon: <Heart className="w-6 h-6" />,
    description: "Daily routines aligned with natural rhythms",
    benefits: ["Optimal health", "Natural healing", "Longevity", "Disease prevention"],
    techniques: ["Dinacharya (daily routine)", "Ritucharya (seasonal routine)", "Proper diet", "Herbal medicine"]
  }
];

const philosophies = [
  {
    title: "Dharma",
    subtitle: "Life Purpose",
    description: "Living in alignment with your true nature and purpose",
    icon: <Star className="w-8 h-8 text-yellow-500" />
  },
  {
    title: "Artha",
    subtitle: "Material Security",
    description: "Achieving prosperity through righteous means",
    icon: <Mountain className="w-8 h-8 text-green-500" />
  },
  {
    title: "Kama",
    subtitle: "Desires & Pleasure",
    description: "Fulfilling desires in harmony with dharma",
    icon: <Heart className="w-8 h-8 text-red-500" />
  },
  {
    title: "Moksha",
    subtitle: "Liberation",
    description: "Ultimate freedom and self-realization",
    icon: <Moon className="w-8 h-8 text-blue-500" />
  }
];

export default function VedicPhilosophyPage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            <BookOpen className="inline w-10 h-10 mr-2" />
            Vedic Philosophy
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover ancient wisdom for modern living through Ayurveda, yoga philosophy, 
            and timeless principles for holistic well-being
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="doshas" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="doshas">Doshas</TabsTrigger>
              <TabsTrigger value="practices">Practices</TabsTrigger>
              <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
              <TabsTrigger value="wisdom">Daily Wisdom</TabsTrigger>
            </TabsList>

            <TabsContent value="doshas" className="space-y-8">
              <Card className="shadow-wellness fade-in">
                <CardHeader>
                  <CardTitle className="text-center">The Three Doshas</CardTitle>
                  <p className="text-center text-muted-foreground">
                    Ayurvedic body-mind types that govern our physical and mental characteristics
                  </p>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {doshaData.map((dosha, index) => (
                  <Card key={dosha.name} className="shadow-wellness hover:shadow-floating transition-wellness fade-in">
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-3 ${dosha.color}`}>
                        {dosha.icon}
                        {dosha.name}
                      </CardTitle>
                      <Badge variant="outline">{dosha.element}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Characteristics</h4>
                        <div className="flex flex-wrap gap-1">
                          {dosha.characteristics.map((char, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Body Type</h4>
                        <p className="text-sm text-muted-foreground">{dosha.bodyType}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Balancing Foods</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {dosha.balancingFoods.map((food, i) => (
                            <li key={i}>• {food}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Imbalance Signs</h4>
                        <div className="flex flex-wrap gap-1">
                          {dosha.imbalanceSigns.map((sign, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              {sign}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="practices" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {practices.map((practice, index) => (
                  <Card key={practice.title} className="shadow-wellness hover:shadow-floating transition-wellness fade-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-vedic">
                        {practice.icon}
                        {practice.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{practice.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Benefits</h4>
                        <div className="grid grid-cols-2 gap-1">
                          {practice.benefits.map((benefit, i) => (
                            <Badge key={i} variant="outline" className="text-xs justify-center">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Techniques</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {practice.techniques.map((technique, i) => (
                            <li key={i}>• {technique}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="philosophy" className="space-y-6">
              <Card className="shadow-wellness fade-in">
                <CardHeader>
                  <CardTitle className="text-center">The Four Purusharthas</CardTitle>
                  <p className="text-center text-muted-foreground">
                    The four goals of human life according to Vedic tradition
                  </p>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {philosophies.map((philosophy, index) => (
                  <Card key={philosophy.title} className="shadow-wellness hover:shadow-floating transition-wellness fade-in">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        {philosophy.icon}
                        <div>
                          <CardTitle className="text-vedic">{philosophy.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{philosophy.subtitle}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{philosophy.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="shadow-wellness fade-in">
                <CardHeader>
                  <CardTitle>The Eightfold Path of Yoga (Ashtanga)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-card rounded-lg">
                        <h4 className="font-semibold">1. Yamas (Restraints)</h4>
                        <p className="text-sm text-muted-foreground">Ethical guidelines</p>
                      </div>
                      <div className="p-3 bg-gradient-card rounded-lg">
                        <h4 className="font-semibold">2. Niyamas (Observances)</h4>
                        <p className="text-sm text-muted-foreground">Personal practices</p>
                      </div>
                      <div className="p-3 bg-gradient-card rounded-lg">
                        <h4 className="font-semibold">3. Asana (Postures)</h4>
                        <p className="text-sm text-muted-foreground">Physical practices</p>
                      </div>
                      <div className="p-3 bg-gradient-card rounded-lg">
                        <h4 className="font-semibold">4. Pranayama (Breath Control)</h4>
                        <p className="text-sm text-muted-foreground">Energy regulation</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-card rounded-lg">
                        <h4 className="font-semibold">5. Pratyahara (Withdrawal)</h4>
                        <p className="text-sm text-muted-foreground">Sense control</p>
                      </div>
                      <div className="p-3 bg-gradient-card rounded-lg">
                        <h4 className="font-semibold">6. Dharana (Concentration)</h4>
                        <p className="text-sm text-muted-foreground">Focused attention</p>
                      </div>
                      <div className="p-3 bg-gradient-card rounded-lg">
                        <h4 className="font-semibold">7. Dhyana (Meditation)</h4>
                        <p className="text-sm text-muted-foreground">Sustained awareness</p>
                      </div>
                      <div className="p-3 bg-gradient-card rounded-lg">
                        <h4 className="font-semibold">8. Samadhi (Union)</h4>
                        <p className="text-sm text-muted-foreground">Supreme consciousness</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wisdom" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="shadow-wellness fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vedic">
                      <Sun className="w-5 h-5" />
                      Morning Routine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Wake before sunrise</li>
                      <li>• Drink warm water</li>
                      <li>• Oil pulling (gandusha)</li>
                      <li>• Yoga & meditation</li>
                      <li>• Nourishing breakfast</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-wellness fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vedic">
                      <Heart className="w-5 h-5" />
                      Mindful Eating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Eat in peaceful environment</li>
                      <li>• Chew food thoroughly</li>
                      <li>• Include all six tastes</li>
                      <li>• Eat according to dosha</li>
                      <li>• Express gratitude</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-wellness fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vedic">
                      <Moon className="w-5 h-5" />
                      Evening Practice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Light dinner before sunset</li>
                      <li>• Gentle yoga or stretching</li>
                      <li>• Self-massage (abhyanga)</li>
                      <li>• Meditation or reading</li>
                      <li>• Early bedtime</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-wellness fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vedic">
                      <Leaf className="w-5 h-5" />
                      Seasonal Living
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Adjust diet by season</li>
                      <li>• Seasonal cleansing</li>
                      <li>• Nature connection</li>
                      <li>• Adapt exercise routine</li>
                      <li>• Honor natural cycles</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-wellness fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vedic">
                      <Brain className="w-5 h-5" />
                      Mental Wellness
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Daily meditation practice</li>
                      <li>• Positive thinking (sankalpa)</li>
                      <li>• Mantra repetition</li>
                      <li>• Cultivate satsang</li>
                      <li>• Practice self-inquiry</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-wellness fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vedic">
                      <Star className="w-5 h-5" />
                      Spiritual Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Study sacred texts</li>
                      <li>• Karma yoga (selfless service)</li>
                      <li>• Bhakti (devotional practices)</li>
                      <li>• Satsang with wisdom seekers</li>
                      <li>• Regular spiritual retreats</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ChatBot />
    </div>
  );
}