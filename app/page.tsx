"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";

export default function Home() {
  const [isVisible, setIsVisible] = useState({});
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Counter animation for stats
  const [stats, setStats] = useState({ problems: 0, users: 0, solved: 0 });
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ problems: 2500, users: 15000, solved: 85000 });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Animated counter component
  const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (end === 0) {
        setCount(0);
        return;
      }
      let startTime: number | null = null;
      const animate = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp;
        }
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [end, duration]);
    
    return <span>{count.toLocaleString()}{suffix}</span>;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  } as const;

  return (
    <main className="flex flex-col items-center w-full overflow-hidden mt-0 pt-0">
      {/* Hero Section with Parallax */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative w-full flex flex-col items-center justify-center text-center py-20 gap-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 min-h-screen -mt-4"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20"
          />
          <motion.div 
            animate={{ 
              rotate: -360,
              scale: [1.1, 1, 1.1]
            }}
            transition={{ 
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute bottom-32 left-16 w-24 h-24 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-xl opacity-20"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="relative z-10"
        >
          <motion.h1
            className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Master DSA
            <br />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"
            >
              Track Everything
            </motion.span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mb-8 leading-relaxed"
          >
            Your complete DSA companion with <span className="font-semibold text-blue-600">progress tracking</span>, 
            <span className="font-semibold text-purple-600"> visual analytics</span>, and 
            <span className="font-semibold text-green-600"> personalized insights</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
            >
              Start Tracking Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300"
            >
              See Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 relative z-10"
        >
          {[
            { label: "Problems Available", value: stats.problems, suffix: "+" },
            { label: "Active Users", value: stats.users, suffix: "+" },
            { label: "Problems Solved", value: stats.solved, suffix: "+" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features Section with Enhanced Animations */}
      <section className="w-full max-w-7xl py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Everything You Need to Excel
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive tools designed to accelerate your DSA learning journey
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              title: "Smart Problem Tracking",
              desc: "Add problems from any platform, mark as solved/unsolved, and track your progress with detailed statistics.",
              icon: "📊",
              color: "from-blue-500 to-cyan-500"
            },
            {
              title: "Visual Progress Analytics",
              desc: "Beautiful charts and graphs showing your solving patterns, streaks, and improvement over time.",
              icon: "📈",
              color: "from-purple-500 to-pink-500"
            },
            {
              title: "Comprehensive Profile",
              desc: "Detailed profile with solving history, favorite topics, and personalized recommendations.",
              icon: "👤",
              color: "from-green-500 to-emerald-500"
            },
            {
              title: "Topic-wise Organization",
              desc: "Categorize problems by data structures and algorithms for focused practice sessions.",
              icon: "🗂️",
              color: "from-orange-500 to-red-500"
            },
            {
              title: "Streak Tracking",
              desc: "Maintain your coding streak with daily goals and achievement milestones.",
              icon: "🔥",
              color: "from-yellow-500 to-orange-500"
            },
            {
              title: "History & Insights",
              desc: "Complete solving history with timestamps, notes, and performance insights.",
              icon: "📚",
              color: "from-indigo-500 to-purple-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                rotateY: 10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 hover:border-transparent transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="w-full max-w-6xl py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
            Your DSA Dashboard
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            See your progress at a glance with our intuitive interface
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Solving Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Arrays</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ delay: 0.5, duration: 1 }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                      <span className="text-sm text-gray-500">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Trees</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "60%" }}
                          transition={{ delay: 0.7, duration: 1 }}
                          className="h-full bg-green-500"
                        />
                      </div>
                      <span className="text-sm text-gray-500">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Graphs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "45%" }}
                          transition={{ delay: 0.9, duration: 1 }}
                          className="h-full bg-purple-500"
                        />
                      </div>
                      <span className="text-sm text-gray-500">45%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { problem: "Two Sum", status: "✅", time: "2 hours ago" },
                    { problem: "Binary Tree Inorder", status: "✅", time: "1 day ago" },
                    { problem: "Merge Intervals", status: "❌", time: "2 days ago" }
                  ].map((activity, index) => (
                    <motion.div
                      key={activity.problem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{activity.status}</span>
                        <span className="text-gray-800 dark:text-white font-medium">{activity.problem}</span>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Weekly Progress</h3>
              <div className="space-y-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-8 text-sm text-gray-600 dark:text-gray-300">{day}</span>
                    <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.random() * 80 + 20}%` }}
                        transition={{ delay: 1.5 + index * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="w-full max-w-4xl py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to master DSA, completely free
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl p-12 text-center border border-gray-100 dark:border-gray-700"
        >
          <div className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            FREE
          </div>
          <div className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Forever. No credit card required.
          </div>
          
          <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
            {[
              "Unlimited problem tracking",
              "Visual progress analytics",
              "Complete solving history",
              "Topic-wise organization",
              "Streak tracking",
              "Personalized insights"
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </motion.div>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-12 py-4 rounded-full font-semibold text-lg shadow-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-6">
          {[
            {
              q: "How does the problem tracking work?",
              a: "Simply add any DSA problem from platforms like LeetCode, HackerRank, or CodeChef. Mark them as solved or unsolved, add notes, and track your progress over time with detailed analytics."
            },
            {
              q: "Can I track problems from multiple platforms?",
              a: "Yes! Our tracker is platform-agnostic. You can add problems from any coding platform and organize them in one place."
            },
            {
              q: "What kind of analytics do you provide?",
              a: "We provide comprehensive analytics including solving streaks, topic-wise progress, time-based charts, difficulty distribution, and personalized insights to help you improve."
            },
            {
              q: "Is my data secure?",
              a: "Absolutely! Your data is stored securely and privately. We don't share your information with third parties."
            },
            {
              q: "Do I need to create an account?",
              a: "You can start tracking immediately without an account. Creating an account ensures your data is saved and accessible across devices."
            }
          ].map((faq, index) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800"
            >
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                {faq.q}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Master DSA?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who are already tracking their progress and improving their skills.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 px-12 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-gray-100 transition-all duration-300"
          >
            Start Your Journey Today
          </motion.button>
        </motion.div>
      </section>
    </main>
  );
}