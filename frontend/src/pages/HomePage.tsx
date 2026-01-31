import { ModuleCard } from "@/components/ModuleCard";
import { Navbar } from "@/components/Navbar";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Brain, 
  Moon, 
  Apple, 
  BookOpen, 
  Activity, 
  MessageCircle,
  Sparkles 
} from "lucide-react";
import heroImage from "@/assets/hero-wellness.jpg";
import { useState } from "react";
import { SignupDialog } from "@/components/auth/SignupDialog";

const modules = [
  {
    title: "Yoga Pose AI",
    description: "Get real-time feedback on your yoga poses with AI-powered guidance and corrections.",
    icon: Users,
    href: "/yoga",
    color: "meditation" as const,
  },
  {
    title: "Meditation",
    description: "Discover guided meditations, breathing exercises, and mindfulness practices.",
    icon: Brain,
    href: "/meditation", 
    color: "meditation" as const,
  },
  {
    title: "Sleep Tracker",
    description: "Monitor your sleep patterns and get personalized recommendations for better rest.",
    icon: Moon,
    href: "/sleep",
    color: "sleep" as const,
  },
  {
    title: "Diet Tracker",
    description: "Track your meals, calories, and macronutrients for optimal health.",
    icon: Apple,
    href: "/diet",
    color: "nutrition" as const,
  },
  {
    title: "Nutrition Guide",
    description: "Get personalized nutrition recommendations based on your health profile.",
    icon: BookOpen,
    href: "/nutrition",
    color: "nutrition" as const,
  },
  {
    title: "Health Status",
    description: "Monitor your overall health metrics and get insights into your wellness journey.",
    icon: Activity,
    href: "/health",
    color: "default" as const,
  },
];

export default function HomePage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Wellness journey background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero/80" />
        </div>
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Your Personal
              <br />
              <span className="flex items-center justify-center gap-2">
                Wellness Journey
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover harmony between mind, body, and spirit with AI-powered wellness tools, 
              ancient wisdom, and modern technology.
            </p>
            <Button variant="wellness" size="lg" className="shadow-floating">
              Begin Your Journey
              <Users className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Wellness Modules
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our comprehensive wellness tools designed to support every aspect 
            of your health and mindfulness journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((module, index) => (
            <div 
              key={module.title}
              className="fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ModuleCard {...module} />
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-card rounded-2xl p-8 md:p-12 text-center shadow-wellness fade-in border border-border/50">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Transform Your Wellness?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands who have discovered the power of holistic wellness through 
            our AI-powered platform combining ancient wisdom with modern technology.
          </p>
          <div className="flex justify-center">
            <Button variant="wellness" size="lg" onClick={() => setShowSignup(true)}>
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Floating Chatbot */}
      <ChatBot />

      {/* Signup Dialog */}
      <SignupDialog 
        open={showSignup} 
        onOpenChange={setShowSignup}
        onSwitchToLogin={() => setShowSignup(false)}
      />
    </div>
  );
}