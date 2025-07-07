'use client'
import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Trophy, Calendar, Target, TrendingUp, BookOpen, Clock, Award, Camera, Plus, ExternalLink, Activity } from 'lucide-react';
import { auth, userProfileService, problemService, UserProfile, Problem, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';

const UserDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ [date: string]: number }>({});
  const [totalProblems, setTotalProblems] = useState(0);
  const [solvedProblems, setSolvedProblems] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [problems, setProblems] = useState<Problem[]>([]);
  const router = useRouter();

  // Create default profile
  const createDefaultProfile = async (user: any) => {
    const defaultProfile: UserProfile = {
      name: user.displayName || '',
      username: user.email?.split('@')[0] || '',
      email: user.email || '',
      location: '',
      bio: '',
      photoURL: user.photoURL || '',
      joinDate: new Date().toISOString(),
      totalProblems: 0,
      solvedProblems: 0,
      currentStreak: 0,
      maxStreak: 0,
      preferences: {
        notifications: true,
        publicProfile: false,
        showProgress: true
      }
    };
    
    await setDoc(doc(db, 'users', user.uid), defaultProfile, { merge: true });
    return defaultProfile;
  };

  // Generate heatmap data for the last year
  const generateHeatmapData = (problems: Problem[]) => {
    const heatmap: { [date: string]: number } = {};
    const today = new Date();
    
    // Initialize last 365 days
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      heatmap[dateStr] = 0;
    }
    
    // Count solved problems per day
    problems.forEach(problem => {
      if (problem.status === 'Solved' && problem.updatedAt) {
        let dateObj = problem.updatedAt;
        if (typeof dateObj?.toDate === 'function') dateObj = dateObj.toDate();
        const dateStr = new Date(dateObj).toISOString().split('T')[0];
        if (heatmap[dateStr] !== undefined) {
          heatmap[dateStr]++;
        }
      }
    });
    
    return heatmap;
  };

  // Get intensity color for heatmap
  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    if (count === 1) return 'bg-green-900';
    if (count === 2) return 'bg-green-700';
    if (count >= 3) return 'bg-green-500';
    return 'bg-green-300';
  };

  // Listen to auth state and user profile
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(true);
        
        // Listen to user profile changes
        const unsubscribeProfile = userProfileService.onUserProfileChange(user.uid, async (profile) => {
          if (!profile) {
            try {
              const defaultProfile = await createDefaultProfile(user);
              setUserProfile(defaultProfile);
              setEditForm({ ...defaultProfile });
            } catch (error) {
              console.error("Error creating default profile:", error);
            }
          } else {
            setUserProfile(profile);
            setEditForm({ ...profile });
          }
          setLoading(false);
        });

        // Listen to problems for recent activity and heatmap
        const unsubscribeProblems = problemService.getProblems(user.uid, (problems) => {
          setProblems(problems);
          // Get recent 6 problems
          const recent = problems.slice(0, 6);
          setRecentProblems(recent);
          
          // Generate heatmap data
          const heatmap = generateHeatmapData(problems);
          setHeatmapData(heatmap);
          
          // Update user stats
          const total = problems.length;
          const solved = problems.filter(p => p.status === 'Solved').length;
          const current = calculateCurrentStreak(problems);
          const max = calculateMaxStreak(problems);
          
          setTotalProblems(total);
          setSolvedProblems(solved);
          setCurrentStreak(current);
          setMaxStreak(max);
          
          if (userProfile) {
            const updatedProfile = {
              ...userProfile,
              totalProblems: total,
              solvedProblems: solved,
              currentStreak,
              maxStreak
            };
            userProfileService.setUserProfile(user.uid, updatedProfile);
          }
        });
        
        return () => {
          unsubscribeProfile();
          unsubscribeProblems();
        };
      } else {
        setUserId(null);
        setUserProfile(null);
        setEditForm(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribeAuth();
  }, []);

  const calculateCurrentStreak = (problems: Problem[]) => {
    const solvedProblems = problems.filter(p => p.status === 'Solved').sort((a, b) => {
      const aDate = typeof a.updatedAt?.toDate === 'function' ? a.updatedAt.toDate() : a.updatedAt;
      const bDate = typeof b.updatedAt?.toDate === 'function' ? b.updatedAt.toDate() : b.updatedAt;
      return bDate - aDate;
    });
    
    if (solvedProblems.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < solvedProblems.length; i++) {
      const problemDate = typeof solvedProblems[i].updatedAt?.toDate === 'function' ? solvedProblems[i].updatedAt.toDate() : solvedProblems[i].updatedAt;
      const daysDiff = Math.floor((today.getTime() - new Date(problemDate).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateMaxStreak = (problems: Problem[]) => {
    const solvedProblems = problems.filter(p => p.status === 'Solved').sort((a, b) => {
      const aDate = typeof a.updatedAt?.toDate === 'function' ? a.updatedAt.toDate() : a.updatedAt;
      const bDate = typeof b.updatedAt?.toDate === 'function' ? b.updatedAt.toDate() : b.updatedAt;
      return aDate - bDate;
    });
    
    if (solvedProblems.length === 0) return 0;
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < solvedProblems.length; i++) {
      const prevDate = typeof solvedProblems[i-1].updatedAt?.toDate === 'function' ? solvedProblems[i-1].updatedAt.toDate() : solvedProblems[i-1].updatedAt;
      const currDate = typeof solvedProblems[i].updatedAt?.toDate === 'function' ? solvedProblems[i].updatedAt.toDate() : solvedProblems[i].updatedAt;
      const daysDiff = Math.floor((new Date(currDate).getTime() - new Date(prevDate).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };

  const handleSave = async () => {
    if (!userId || !editForm) return;
    try {
      await userProfileService.setUserProfile(userId, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCancel = () => {
    setEditForm(userProfile ? { ...userProfile } : null);
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditForm(prev => prev ? { ...prev, photoURL: result } : prev);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Setting up your profile...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Problems', value: totalProblems, icon: BookOpen, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { label: 'Solved', value: solvedProblems, icon: Trophy, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    { label: 'Current Streak', value: currentStreak, icon: TrendingUp, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    { label: 'Max Streak', value: maxStreak, icon: Award, color: 'text-purple-400', bgColor: 'bg-purple-500/10' }
  ];

  const renderHeatmap = () => {
    const weeks = [];
    const today = new Date();
    
    // Generate 52 weeks of data
    for (let week = 0; week < 52; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + day));
        const dateStr = date.toISOString().split('T')[0];
        const count = heatmapData[dateStr] || 0;
        
        days.push(
          <div
            key={dateStr}
            className={`w-3 h-3 rounded-sm ${getHeatmapColor(count)} border border-slate-600`}
            title={`${dateStr}: ${count} problems solved`}
          />
        );
      }
      weeks.push(
        <div key={week} className="flex flex-col gap-1">
          {days.reverse()}
        </div>
      );
    }
    
    return weeks.reverse();
  };

  // Get all unique topics from solved problems
  const solvedTopics = Array.from(
    new Set(
      recentProblems
        .filter(p => p.status === 'Solved' && p.topic)
        .map(p => p.topic)
    )
  );

  // If you have a `problems` array (all problems for the user)
  const allTopics = Array.from(
    new Set(
      problems
        .filter(p => p.topic && p.topic.trim() !== '')
        .map(p => p.topic)
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
       
        {/* Profile Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {userProfile.photoURL ? (
                  <img 
                    src={userProfile.photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="space-y-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm?.name || ''}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : prev)}
                      className="text-2xl md:text-3xl font-bold bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Your Name"
                    />
                  ) : (
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{userProfile.name}</h2>
                  )}
                  
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm?.email || ''}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, email: e.target.value } : prev)}
                      className="text-slate-400 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="your.email@example.com"
                    />
                  ) : (
                    <p className="text-slate-400">{userProfile.email}</p>
                  )}
                </div>

                {/* Edit Button */}
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {isEditing ? (
                <textarea
                  value={editForm?.bio || ''}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, bio: e.target.value } : prev)}
                  rows={3}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-slate-300">{userProfile.bio || 'No bio added yet'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} backdrop-blur-sm rounded-xl p-6 border border-slate-700`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </h3>
              <button
                onClick={() => router.push('/problems')}
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                View All <ExternalLink size={14} />
              </button>
            </div>
            
            {recentProblems.length > 0 ? (
              <div className="space-y-3">
                {recentProblems.map((problem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        problem.status === 'Solved' ? 'bg-green-500' : 
                        problem.status === 'Attempted' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="text-white font-medium">{problem.title}</p>
                        <p className="text-sm text-slate-400">{problem.topic}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        problem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No problems solved yet</p>
                <button
                  onClick={() => router.push('/problems')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  Add Your First Problem
                </button>
              </div>
            )}
          </div>

          {/* Heatmap */}
          <div className="lg:col-span-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Coding Activity
            </h3>
            
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {renderHeatmap()}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>

            {solvedTopics.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-3">Solved Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {solvedTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1 rounded-full bg-blue-900 text-blue-200 text-sm font-medium border border-blue-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {allTopics.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-3">All Attempted Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {allTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1 rounded-full bg-blue-900 text-blue-200 text-sm font-medium border border-blue-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;