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
  const [aiSimilar, setAiSimilar] = useState<{ title: string; link: string }[] | null>(null);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-full rounded-2xl bg-blue-300 text-black border border-zinc-800 p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold  mb-1">
            Similar Questions to "{problemName}"
          </DialogTitle>
          <DialogDescription className="text-sm text-black mb-4">
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

          {!loading && !error && aiSimilar && aiSimilar.length > 0 ? (
            <ul className="space-y-2">
              {aiSimilar.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-blue-400 px-4 py-2 rounded-md text-sm transition-all font-medium"
                  >
                    {i + 1}. {item.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            !loading &&
            !error && (
              <div className="text-sm text-center text-zinc-500">
                No similar problems found.
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
