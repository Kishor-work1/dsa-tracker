// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-VocZjQrJjxjKWhJs79KPehqDgPGt2Ts",
  authDomain: "dsa-tracker-417df.firebaseapp.com",
  projectId: "dsa-tracker-417df",
  storageBucket: "dsa-tracker-417df.appspot.com",
  messagingSenderId: "805745890",
  appId: "1:805745890:web:cc213d6a0e904a438fdabb",
  measurementId: "G-81007HHVEW"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Problem types
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'Solved' | 'Unsolved' | 'Attempted';

export interface Problem {
  id?: string;
  title: string;
  link: string;
  topic: string;
  difficulty: Difficulty;
  status: Status;
  similarQuestions?: string;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

// Problem service functions
export const problemService = {
  // Get all problems for a user
  getProblems: (userId: string, callback: (problems: Problem[]) => void) => {
    const q = query(
      collection(db, 'problems'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const problems: Problem[] = [];
      snapshot.forEach((doc) => {
        problems.push({ id: doc.id, ...doc.data() } as Problem);
      });
      callback(problems);
    });
  },

  // Add a new problem
  addProblem: async (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'problems'), {
        ...problem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding problem:', error);
      throw error;
    }
  },

  // Update a problem
  updateProblem: async (problemId: string, updates: Partial<Problem>) => {
    try {
      const problemRef = doc(db, 'problems', problemId);
      await updateDoc(problemRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating problem:', error);
      throw error;
    }
  },

  // Delete a problem
  deleteProblem: async (problemId: string) => {
    try {
      const problemRef = doc(db, 'problems', problemId);
      await deleteDoc(problemRef);
    } catch (error) {
      console.error('Error deleting problem:', error);
      throw error;
    }
  },

  // Get problems with filters
  getFilteredProblems: async (userId: string, filters: {
    topic?: string;
    difficulty?: Difficulty | 'All';
    status?: Status | 'All';
  }) => {
    try {
      let q = query(
        collection(db, 'problems'),
        where('userId', '==', userId)
      );

      if (filters.topic && filters.topic !== 'All') {
        q = query(q, where('topic', '==', filters.topic));
      }
      if (filters.difficulty && filters.difficulty !== 'All') {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }
      if (filters.status && filters.status !== 'All') {
        q = query(q, where('status', '==', filters.status));
      }

      const snapshot = await getDocs(q);
      const problems: Problem[] = [];
      snapshot.forEach((doc) => {
        problems.push({ id: doc.id, ...doc.data() } as Problem);
      });
      return problems;
    } catch (error) {
      console.error('Error getting filtered problems:', error);
      throw error;
    }
  }
};