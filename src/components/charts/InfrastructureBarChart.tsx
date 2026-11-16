import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface InfraBarItem {
  category: string;
  count: number;
  planned: number;
}

interface InfrastructureBarChartProps {
  data: InfraBarItem[];
}

export const InfrastructureBarChart: React.FC<InfrastructureBarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="category"
            stroke="#64748b"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono',
              color: '#f8fafc',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '6px' }}
          />
          <Bar dataKey="count" name="Existing Operational" fill="#06b6d4" radius={[3, 3, 0, 0]} />
          <Bar dataKey="planned" name="Under Planning (Demo)" fill="#6366f1" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

