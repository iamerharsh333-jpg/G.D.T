import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface EnvironmentalAreaChartProps {
  data: {
    time: string;
    aqi: number;
    pm25: number;
    trafficIndex: number;
  }[];
}

export const EnvironmentalAreaChart: React.FC<EnvironmentalAreaChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
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
          <Area
            type="monotone"
            dataKey="aqi"
            name="Air Quality Index (AQI)"
            stroke="#f59e0b"
            fillOpacity={1}
            fill="url(#aqiGradient)"
          />
          <Area
            type="monotone"
            dataKey="pm25"
            name="PM2.5 Conc. (µg/m³)"
            stroke="#06b6d4"
            fillOpacity={1}
            fill="url(#pm25Gradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

