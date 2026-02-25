import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  variant?: "default" | "accent" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-card border-border",
  accent: "bg-accent/10 border-accent/30",
  success: "bg-success/10 border-success/30",
  warning: "bg-warning/10 border-warning/30",
  destructive: "bg-destructive/10 border-destructive/30",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  accent: "bg-accent/20 text-accent",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  destructive: "bg-destructive/20 text-destructive",
};

const StatCard = ({ title, value, icon, subtitle, variant = "default" }: StatCardProps) => {
  return (
    <div
      className={`rounded-lg border p-5 animate-fade-in ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-display font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
