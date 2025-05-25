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

        <Radar name={userAName} dataKey="you" stroke="#1db954" fill="#1db954" fillOpacity={0.4} />
        <Radar name={userBName} dataKey="other" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
        <Legend />
        <Tooltip formatter={(value) => `${Math.round(value)}%`} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
