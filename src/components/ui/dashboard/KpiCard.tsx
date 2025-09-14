
import React from "react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral"
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="rounded-md border bg-card p-3 h-[64px] flex items-center">
      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground font-medium whitespace-normal break-words leading-tight">{title}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {change && (
            <span className={`text-[10px] font-medium ${getChangeColor()}`}>{changeType === "positive" ? '+' : ''}{change}</span>
          )}
          <span className="text-xl font-bold text-foreground">{value}</span>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
