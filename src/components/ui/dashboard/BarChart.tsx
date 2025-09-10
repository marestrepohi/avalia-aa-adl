
import React from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title: string;
  subtitle?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, subtitle }) => {
  return (
    <div className="bg-white rounded-lg shadow-card p-5 card-hover h-80">
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ border: "none", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "0.375rem" }}
          />
          <Bar dataKey="value" fill="#4A3EF9" barSize={30} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
