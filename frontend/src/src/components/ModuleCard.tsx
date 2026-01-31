import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: "nutrition" | "sleep" | "vedic" | "meditation" | "default";
  gradient?: string;
}

export function ModuleCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color,
  gradient 
}: ModuleCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-gradient-card border-border/50 shadow-card hover:shadow-wellness transition-wellness fade-in">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon with color-specific styling */}
          <div className={`
            relative flex items-center justify-center w-16 h-16 rounded-full
            ${color === 'nutrition' ? 'bg-nutrition text-white' : ''}
            ${color === 'sleep' ? 'bg-sleep text-white' : ''}
            ${color === 'vedic' ? 'bg-vedic text-white' : ''}
            ${color === 'meditation' ? 'bg-meditation text-white' : ''}
            ${color === 'default' ? 'bg-gradient-primary text-primary-foreground' : ''}
            shadow-lg group-hover:scale-110 transition-wellness
          `}>
            <Icon className="w-8 h-8" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Action Button */}
          <Button 
            asChild 
            variant="module"
            className="w-full mt-4"
          >
            <Link to={href}>
              Get Started
            </Link>
          </Button>
        </div>
      </CardContent>

      {/* Subtle gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ background: gradient }} />
      )}
    </Card>
  );
}