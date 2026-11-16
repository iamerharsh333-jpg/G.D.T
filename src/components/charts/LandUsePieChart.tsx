import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface LandUseItem {
  name: string;
  value: number;
  color: string;
}

interface LandUsePieChartProps {
  data: LandUseItem[];
}

export const LandUsePieChart: React.FC<LandUsePieChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={48}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono',
              color: '#f8fafc',
            }}
            formatter={(value: number) => [`${value}% (Sample)`, 'Share']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: '11px',
              fontFamily: 'Inter',
              paddingTop: '8px',
              color: '#94a3b8',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

