import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Thread = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [references, setReferences] = useState<any[] | null>(null);

  const handleQuery = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setReferences(null);
    try {
      const res = await fetch("http://localhost:3001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Query failed");
      setAnswer(data.answer);
      setReferences(data.references);
    } catch (err: any) {
      setError(err.message || "Query failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-8">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow border rounded px-3 py-2"
            placeholder="Enter your query..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleQuery(); }}
            disabled={loading}
          />
          <Button onClick={handleQuery} disabled={loading || !input.trim()}>
            {loading ? "Searching..." : "Query"}
          </Button>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {answer && (
          <div className="bg-muted rounded p-4">
            <div className="font-semibold mb-2">Answer:</div>
            <div>{answer}</div>
            {references && references.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold mb-1">References:</div>
                <ul className="list-disc ml-6 text-xs">
                  {references.map((ref, idx) => (
                    <li key={idx}>{ref.pageContent?.slice(0, 200)}...</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
