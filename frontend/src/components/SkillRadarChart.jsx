import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const CustomTooltip = ({ active, payload, theme }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div style={{
        background: theme === 'dark' ? 'rgba(18,13,43,0.95)' : 'rgba(255,255,255,0.95)',
        border: '1.5px solid var(--border-glow)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: '0.85rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: 'var(--indigo)', fontWeight: 700, marginBottom: 4, fontFamily: 'Space Grotesk' }}>{d.payload.skill}</p>
        <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Score: <strong>{d.value}%</strong></p>
      </div>
    );
  }
  return null;
};

export default function SkillRadarChart({ perSkillScores }) {
  const { theme } = useTheme();
  if (!perSkillScores || perSkillScores.length === 0) return null;

  const data = perSkillScores.map(s => ({
    skill: s.skill,
    score: s.score,
    fullMark: 100,
  }));

  const tickColor = theme === 'dark' ? '#94a3b8' : '#475569';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(163, 82, 0, 0.12)';
  const labelColor = theme === 'dark' ? '#cbd5e1' : '#1e293b';

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid
            stroke={gridColor}
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="skill"
            tick={{
              fill: labelColor,
              fontSize: 11,
              fontFamily: 'Space Grotesk',
              fontWeight: 600,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: tickColor, fontSize: 9, fontFamily: 'Space Grotesk' }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="var(--indigo)"
            fill="url(#radarGradient)"
            fillOpacity={theme === 'dark' ? 0.35 : 0.25}
            strokeWidth={2}
            dot={{ fill: 'var(--violet)', strokeWidth: 0, r: 4.5 }}
            activeDot={{ r: 6, fill: '#ffffff', stroke: 'var(--indigo)', strokeWidth: 2 }}
          />
          <Tooltip content={<CustomTooltip theme={theme} />} />
          <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.8} />
              <stop offset="100%" stopColor="var(--indigo)" stopOpacity={0.3} />
            </radialGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
