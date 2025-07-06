'use client'
import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area, LabelList } from "recharts";
import { useProblems } from '@/lib/hooks/useProblems';
import { startOfDay, format, startOfWeek, startOfMonth, eachDayOfInterval, subDays, getDay, getMonth, getDate, getYear, addDays } from "date-fns";


const StatCard = ({ title, value, subtext, children, trend }: { 
  title: string; 
  value?: number | string; 
  subtext?: string; 
  children?: React.ReactNode; 
  trend?: string;
}) => (
  <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800 hover:border-gray-700 transition-all duration-300">
    <div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      {value !== undefined && (
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
      {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
    </div>
    {children}
  </div>
);

const ChartCard = ({ title, subtext, children }: { 
  title: string; 
  subtext: string; 
  children: React.ReactNode; 
}) => (
  <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800">
    <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
    <p className="text-gray-400 text-sm mb-6">{subtext}</p>
    <div className="h-80 w-full">
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-gray-300 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StatisticsPage() {
  const { problems, loading, userId } = useProblems();
  const [activeTab, setActiveTab] = useState("summary");

  const tabs = [
    { id: "summary", name: "Summary", icon: "📊" },
    { id: "problems", name: "Problems", icon: "🧩" },
    { id: "streaks", name: "Streaks", icon: "🔥" },
  ];

  const getSolvedPercentage = () => {
    return problems.length > 0 ? Math.round((problems.filter(p => p.status === 'Solved').length / problems.length) * 100) : 0;
  };

  // Compute statistics
  const stats = useMemo(() => {
    const totalProblems = problems.length;
    const solved = problems.filter(p => p.status === 'Solved').length;
    const attempted = problems.filter(p => p.status === 'Attempted').length;
    const unsolved = problems.filter(p => p.status === 'Unsolved').length;

    // --- Streak Calculation ---
    // 1. Get all unique days with at least one solved/attempted problem
    const daysSet = new Set(
      problems
        .filter(p => p.status === 'Solved' || p.status === 'Attempted')
        .map(p => format(new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt), "yyyy-MM-dd"))
    );
    const days = Array.from(daysSet).sort(); // ascending

    let currentStreak = 0;
    let maxStreak = 0;
    let streak = 0;
    let prevDate = null;

    // If there are no days, streaks are 0
    if (days.length > 0) {
      // Go through all days in order
      for (let i = 0; i < days.length; i++) {
        const date = new Date(days[i]);
        if (prevDate) {
          const diff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            streak += 1;
          } else {
            streak = 1;
          }
        } else {
          streak = 1;
        }
        if (streak > maxStreak) maxStreak = streak;
        prevDate = date;
      }

      // Check if the last day is today or yesterday for current streak
      const today = startOfDay(new Date());
      const lastDay = new Date(days[days.length - 1]);
      const diffToToday = (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24);
      if (diffToToday === 0) {
        currentStreak = streak;
      } else if (diffToToday === 1) {
        currentStreak = streak;
      } else {
        currentStreak = 0;
      }
    }

    return {
      totalProblems,
      solved,
      attempted,
      unsolved,
      currentStreak,
      maxStreak,
    };
  }, [problems]);

  // Status distribution for PieChart
  const problemStatusData = useMemo(() => [
    { name: "Unsolved", value: problems.filter(p => p.status === "Unsolved").length, color: "#EF4444" },
    { name: "Solved", value: problems.filter(p => p.status === "Solved").length, color: "#10B981" },
    { name: "Attempted", value: problems.filter(p => p.status === "Attempted").length, color: "#F59E0B" },
  ], [problems]);

  // Difficulty distribution for BarChart
  const problemDifficultyData = useMemo(() => [
    { name: "Easy", value: problems.filter(p => p.difficulty === "Easy").length, color: "#10B981" },
    { name: "Medium", value: problems.filter(p => p.difficulty === "Medium").length, color: "#F59E0B" },
    { name: "Hard", value: problems.filter(p => p.difficulty === "Hard").length, color: "#EF4444" },
  ], [problems]);

  // Topic distribution for PieChart/BarChart
  const topicColors = [
    "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16", "#F97316", "#F59E0B", "#10B981", "#EF4444"
  ];
  const topicDistributionData = useMemo(() => {
    const topicMap = new Map();
    problems.forEach(p => {
      if (!p.topic) return;
      topicMap.set(p.topic, (topicMap.get(p.topic) || 0) + 1);
    });
    return Array.from(topicMap.entries()).map(([name, value], i) => ({
      name,
      value,
      color: topicColors[i % topicColors.length]
    }));
  }, [problems]);

  // Daily Progress
  const dailyProgressData = useMemo(() => {
    const map = new Map();
    problems.forEach(p => {
      if (!p.createdAt) return;
      const date = format(new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt), "yyyy-MM-dd");
      if (!map.has(date)) map.set(date, { date, solved: 0, attempted: 0 });
      if (p.status === "Solved") map.get(date).solved += 1;
      if (p.status === "Attempted") map.get(date).attempted += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [problems]);

  // Weekly Streak Data
  const streakData = useMemo(() => {
    const map = new Map();
    problems.forEach(p => {
      if (!p.createdAt) return;
      const week = format(startOfWeek(new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt)), "'Week' w");
      if (!map.has(week)) map.set(week, { week, streak: 0, maxStreak: 0 });
      if (p.status === "Solved") map.get(week).streak += 1;
    });
    // Optionally calculate maxStreak logic here
    return Array.from(map.values()).sort((a, b) => a.week.localeCompare(b.week));
  }, [problems]);

  // Monthly Activity
  const monthlyStreakData = useMemo(() => {
    const map = new Map();
    problems.forEach(p => {
      if (!p.createdAt) return;
      const month = format(startOfMonth(new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt)), "MMM");
      if (!map.has(month)) map.set(month, { month, days: 0, color: "#10B981" });
      if (p.status === "Solved") map.get(month).days += 1;
    });
    // Optionally set color based on activity
    return Array.from(map.values());
  }, [problems]);

  // Problems Over Time (by month and difficulty)
  const problemsOverTimeData = useMemo(() => {
    const map = new Map();
    problems.forEach(p => {
      if (!p.createdAt) return;
      const month = format(startOfMonth(new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt)), "MMM");
      if (!map.has(month)) map.set(month, { month, easy: 0, medium: 0, hard: 0 });
      if (p.difficulty === "Easy") map.get(month).easy += 1;
      if (p.difficulty === "Medium") map.get(month).medium += 1;
      if (p.difficulty === "Hard") map.get(month).hard += 1;
    });
    return Array.from(map.values());
  }, [problems]);

  const easyProblems = useMemo(() => problems.filter(p => p.difficulty === "Easy"), [problems]);
  const mediumProblems = useMemo(() => problems.filter(p => p.difficulty === "Medium"), [problems]);
  const hardProblems = useMemo(() => problems.filter(p => p.difficulty === "Hard"), [problems]);

  const easySolved = useMemo(() => easyProblems.filter(p => p.status === "Solved").length, [easyProblems]);
  const mediumSolved = useMemo(() => mediumProblems.filter(p => p.status === "Solved").length, [mediumProblems]);
  const hardSolved = useMemo(() => hardProblems.filter(p => p.status === "Solved").length, [hardProblems]);

  // --- Dynamic streak stats ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const activeDaysSet = useMemo(() => new Set(
    problems
      .filter(p => p.status === 'Solved' || p.status === 'Attempted')
      .map(p => format(new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt), "yyyy-MM-dd"))
  ), [problems]);

  const activeDaysThisMonth = useMemo(() =>
    Array.from(activeDaysSet).filter(dateStr => {
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length
  , [activeDaysSet, currentMonth, currentYear]);

  const activeDaysThisYear = useMemo(() =>
    Array.from(activeDaysSet).filter(dateStr => {
      const d = new Date(dateStr);
      return d.getFullYear() === currentYear;
    }).length
  , [activeDaysSet, currentYear]);

  // Build a map of date string -> count of problems solved/attempted
  const activityMap = useMemo(() => {
    const map = new Map();
    problems.forEach(p => {
      if (!p.createdAt) return;
      const date = format(new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt), "yyyy-MM-dd");
      if (!map.has(date)) map.set(date, 0);
      if (p.status === "Solved" || p.status === "Attempted") {
        map.set(date, map.get(date) + 1);
      }
    });
    return map;
  }, [problems]);

  // Generate all days for the past year (ending today)
  const yearAgo = subDays(today, 364);
  const allDays = eachDayOfInterval({ start: yearAgo, end: today });

  // Find the first Sunday before or on yearAgo
  const firstSunday = startOfWeek(yearAgo, { weekStartsOn: 0 }); // 0 = Sunday

  // Build a 2D array: weeks[weekIndex][dayOfWeek]
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  let dayPointer: Date = firstSunday;

  while (dayPointer <= today) {
    for (let d = 0; d < 7; d++) {
      if (dayPointer < yearAgo || dayPointer > today) {
        week.push(null); // pad before/after range
      } else {
        week.push(new Date(dayPointer));
      }
      dayPointer = addDays(dayPointer, 1);
    }
    weeks.push(week);
    week = [];
  }

  if (loading) return <div>Loading...</div>;
  if (!userId) return <div>Please log in to view statistics.</div>;

  const renderSummaryTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Problems" value={stats.totalProblems} trend="+2" />
        <StatCard title="Solved" value={stats.solved} subtext={`${getSolvedPercentage()}% of total`} trend="+0" />
        <StatCard title="Current Streak" value={stats.currentStreak} subtext="days" trend="+1" />
        <StatCard title="Max Streak" value={stats.maxStreak} subtext="best streak" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Problem Status Distribution" subtext="Your solving progress overview">
          <ResponsiveContainer>
            <PieChart>
              <Pie 
                data={problemStatusData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {problemStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Difficulty Distribution" subtext="Problems by difficulty level">
          <ResponsiveContainer>
            <BarChart data={problemDifficultyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {problemDifficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="col-span-1">
        <ChartCard title="Topic Distribution" subtext="Problems by topic category">
            <ResponsiveContainer width="100%" minWidth={300} height="100%">
            <PieChart>
              <Pie 
                data={topicDistributionData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80}
                label={({ name, value }) => (value || 0) > 0 ? `${name}: ${value}` : ''}
              >
                {topicDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        </div>
        <div className="col-span-1">
          <ChartCard title="Daily Progress" subtext="Your daily problem-solving activity">
            <ResponsiveContainer width="100%" minWidth={300} height="100%">
              <AreaChart data={dailyProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="attempted" 
                  stackId="1"
                  stroke="#F59E0B" 
                  fill="#F59E0B"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="solved" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );

  const renderProblemsTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Easy Problems"
          value={easyProblems.length}
          subtext={`${easySolved} solved`}
          trend={`+${easyProblems.length}`}
        />
        <StatCard
          title="Medium Problems"
          value={mediumProblems.length}
          subtext={`${mediumSolved} solved`}
          trend={`+${mediumProblems.length}`}
        />
        <StatCard
          title="Hard Problems"
          value={hardProblems.length}
          subtext={`${hardSolved} solved`}
          trend={`+${hardProblems.length}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Problems Solved Over Time" subtext="Monthly solved problems by difficulty">
          <ResponsiveContainer width="100%" minWidth={350} height={350}>
            <LineChart data={problemsOverTimeData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} label={{ value: 'Month', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }} />
              <YAxis tick={{ fill: '#9CA3AF' }} label={{ value: 'Problems Solved', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle"/>
              <Line type="monotone" dataKey="easy" name="Easy" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="medium" name="Medium" stroke="#F59E0B" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="hard" name="Hard" stroke="#EF4444" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Topic Mastery" subtext="Your strongest and weakest topics (by solved count)">
          <ResponsiveContainer width="100%" minWidth={350} height={350}>
            <BarChart
              data={[...topicDistributionData].sort((a, b) => b.value - a.value)}
              layout="vertical"
              margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{ fill: '#9CA3AF' }} label={{ value: 'Problems', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF', fontSize: 14 }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} isAnimationActive>
                {topicDistributionData.sort((a, b) => b.value - a.value).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="value" position="right" fill="#fff" fontSize={14} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Weekly Problem Distribution" subtext="Problems attempted and solved each week">
        <ResponsiveContainer>
          <BarChart data={streakData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" tick={{ fill: '#9CA3AF' }} />
            <YAxis tick={{ fill: '#9CA3AF' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="streak" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );

  const renderStreaksTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Current Streak" value={stats.currentStreak} subtext="days" trend="+1" />
        <StatCard title="Max Streak" value={stats.maxStreak} subtext="personal best" />
        <StatCard title="This Month" value={activeDaysThisMonth} subtext="active days" trend="" />
        <StatCard title="Total Active Days" value={activeDaysThisYear} subtext="this year" trend="" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Streak Progress" subtext="Your streak journey over time">
          <ResponsiveContainer>
            <LineChart data={streakData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" tick={{ fill: '#9CA3AF' }} />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="streak" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="maxStreak" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Activity" subtext="Active days per month">
          <ResponsiveContainer>
            <BarChart data={monthlyStreakData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                {monthlyStreakData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Streak Heat Map" subtext="Your consistency over the past year">
        <div className="w-full h-full flex flex-col">
          {/* Month labels */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            <div className="flex-1 flex justify-between text-xs text-gray-400">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <span key={i} className="text-center">{month}</span>
              ))}
            </div>
          </div>
          
          {/* Heat map grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-between text-xs text-gray-400 mr-2 py-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex-1 grid grid-cols-53 gap-1">
              {weeks.map((week, weekIdx) =>
                week.map((day, dayIdx) => {
                  if (!day) return <div key={`${weekIdx}-${dayIdx}`} />;
                  const dateStr = format(day, "yyyy-MM-dd");
                  const count = activityMap.get(dateStr) || 0;

                  // Color logic: 0 = gray, 1 = green-900, 2 = green-700, 3-4 = green-500, 5+ = green-400
                let bgColor = "bg-gray-800 border-gray-700";
                  if (count === 1) bgColor = "bg-green-900 border-green-800";
                  else if (count === 2) bgColor = "bg-green-700 border-green-600";
                  else if (count >= 3 && count <= 4) bgColor = "bg-green-500 border-green-400";
                  else if (count >= 5) bgColor = "bg-green-400 border-green-300";
                
                return (
                  <div
                      key={`${weekIdx}-${dayIdx}`}
                    className={`w-3 h-3 rounded-sm border ${bgColor} hover:ring-1 hover:ring-green-400 hover:scale-110 transition-all duration-200 cursor-pointer`}
                      title={`${format(day, "MMM d, yyyy")}: ${count} problems`}
                  />
                );
                })
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-800 border border-gray-700"></div>
              <div className="w-3 h-3 rounded-sm bg-green-900 border border-green-800"></div>
              <div className="w-3 h-3 rounded-sm bg-green-700 border border-green-600"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500 border border-green-400"></div>
              <div className="w-3 h-3 rounded-sm bg-green-400 border border-green-300"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </ChartCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return renderSummaryTab();
      case "problems":
        return renderProblemsTab();
      case "streaks":
        return renderStreaksTab();
      default:
        return renderSummaryTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Statistics Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Visualize your progress and problem-solving patterns</p>
        </header>

        <div className="mb-8">
          <div className="border-b border-gray-800">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "text-white border-blue-500 bg-gradient-to-t from-blue-500/10 to-transparent"
                      : "text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {renderTabContent()}
      </div>
    </div>
  );
}