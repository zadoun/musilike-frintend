import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Example usage:
 * <RadarCompatibilityChart
 *   userAName="You"
 *   userBName="Anna"
 *   data={[
 *     { metric: 'Genres', you: 75, other: 60 },
 *     { metric: 'Artists', you: 80, other: 70 },
 *     { metric: 'Tracks', you: 50, other: 90 },
 *     { metric: 'Playlists', you: 65, other: 40 },
 *     { metric: 'Liked Recs', you: 90, other: 85 },
 *   ]}
 * />
 */
export default function RadarCompatibilityChart({ userAName = 'You', userBName = 'Other', data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius={120} data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

        <Radar name={userAName} dataKey="you" stroke="#DBB77B" fill="#DBB77B" fillOpacity={0.45} />
        <Radar name={userBName} dataKey="other" stroke="#FFF2CC" fill="#FFF2CC" fillOpacity={0.28} />
        <Legend />
        <Tooltip
          formatter={(value) => `${Math.round(value)}%`}
          contentStyle={{ background: '#181818', border: '1px solid #FFF2CC', borderRadius: 10, color: '#FFF2CC', fontWeight: 500, fontSize: 18, boxShadow: '0 4px 16px #0008', opacity: 0.97 }}
          itemStyle={{ color: '#DBB77B' }}
          labelStyle={{ color: '#FFF2CC', fontWeight: 700 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
