import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface SimilarQuesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  similarQuestions: string | string[];
  problemName: string;
  problemLink?: string;
  problemId?: string;
}

export default function SimilarQuesModal({
  open,
  onOpenChange,
  similarQuestions,
  problemName,
  problemLink,
  problemId,
}: SimilarQuesModalProps) {
  const [aiSimilar, setAiSimilar] = useState<(
    { title: string; link: string; tags?: string[]; description?: string; difficulty?: string }
  )[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && problemName) {
      setLoading(true);
      setError(null);
      setAiSimilar(null);
      fetch(`/api/ai-similar?name=${encodeURIComponent(problemName)}&link=${encodeURIComponent(problemLink ?? "")}&id=${encodeURIComponent(problemId ?? "")}`)
        .then((res) => res.json())
        .then((data) => {
          setAiSimilar(data.similar || []);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch similar problems.");
          setLoading(false);
        });
    }
  }, [open, problemName, problemLink, problemId]);

  const addAllToPractice = (problems: (
    { title: string; link: string; tags?: string[]; description?: string; difficulty?: string }
  )[] | null) => {
    // Implementation of addAllToPractice function
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-full rounded-2xl bg-zinc-900 text-zinc-100 border border-zinc-700 p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-1">
            Similar Questions to "{problemName}"
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400 mb-4">
            Boost your preparation by exploring these related problems.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading && (
            <div className="text-sm text-blue-400 text-center animate-pulse">
              Loading similar problems...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-400 bg-red-900/30 rounded-md p-3 text-center">
              {error}
            </div>
          )}

          {aiSimilar && aiSimilar.length > 0 && (
            <>
              <ul className="space-y-2">
                {aiSimilar.map((item, i) => (
                  <li key={i} className="relative group">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-zinc-800 hover:bg-blue-700 text-zinc-100 hover:text-white px-4 py-2 rounded-md text-sm transition-all font-medium"
                    >
                      {i + 1}. {item.title}
                      {item.tags?.map(tag => (
                        <span key={tag} className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </a>
                    <div className="absolute left-full top-0 ml-2 w-64 p-3 bg-zinc-800 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition">
                      <div className="font-bold">{item.title}</div>
                      <div className="text-xs text-zinc-400 mb-1">{item.tags?.join(', ')}</div>
                      <div className="text-sm">{item.description || "No preview available."}</div>
                      <div className="text-xs mt-1">Difficulty: {item.difficulty || "Unknown"}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-semibold"
                onClick={() => addAllToPractice(aiSimilar)}
              >
                Add all to practice list
              </button>
              <div className="mt-4 text-xs text-center text-zinc-500">
                Suggested using semantic similarity between titles (AI-powered).
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
