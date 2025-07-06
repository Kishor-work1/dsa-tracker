"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import React from "react";

const problemStatusData = [
  { name: "Unsolved", value: 2, color: "#4B5563" },
];

const problemDifficultyData = [
  { name: "Medium", value: 2, color: "#D97706" },
];

const ChartCard = ({ title, subtext, children }: { title: string; subtext: string; children: React.ReactNode; }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{subtext}</p>
      <div className="h-64 w-full">
        {children}
      </div>
    </div>
);

export default function StatisticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Problem Status Distribution" subtext="Breakdown of your solved, unsolved, and revisited problems">
          <ResponsiveContainer>
              <PieChart>
                  <Pie data={problemStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {problemStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
              </PieChart>
          </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Problem Difficulty Distribution" subtext="Breakdown of problem difficulty levels">
          <ResponsiveContainer>
              <PieChart>
                  <Pie data={problemDifficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {problemDifficultyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
              </PieChart>
          </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
