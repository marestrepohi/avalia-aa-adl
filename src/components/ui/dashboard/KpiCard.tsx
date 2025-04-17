
import React from "react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive = true,
  icon
}) => {
  return (
    <div className="bg-white rounded-lg shadow-card p-5 card-hover">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {change && (
            <div className="flex items-center mt-2">
              <div className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{change}
              </div>
            </div>
          )}
        </div>
        {icon && (
          <div className="bg-primary-light p-2 rounded-md">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
