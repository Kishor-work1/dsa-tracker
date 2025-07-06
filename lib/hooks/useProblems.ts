import { useState, useEffect } from 'react';
import { auth, problemService, Problem } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        setUserId(null);
        setProblems([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to problems data changes
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = problemService.getProblems(userId, (problems) => {
      setProblems(problems);
      setError(null);
    });

    return () => unsubscribe();
  }, [userId]);

  const addProblem = async (problemData: Omit<Problem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      await problemService.addProblem({
        ...problemData,
        userId,
      });
    } catch (err) {
      setError('Failed to add problem');
      throw err;
    }
  };

  const updateProblem = async (problemId: string, updates: Partial<Problem>) => {
    try {
      setError(null);
      await problemService.updateProblem(problemId, updates);
    } catch (err) {
      setError('Failed to update problem');
      throw err;
    }
  };

  const deleteProblem = async (problemId: string) => {
    try {
      setError(null);
      await problemService.deleteProblem(problemId);
    } catch (err) {
      setError('Failed to delete problem');
      throw err;
    }
  };

  return {
    problems,
    loading,
    error,
    userId,
    addProblem,
    updateProblem,
    deleteProblem,
  };
}; 