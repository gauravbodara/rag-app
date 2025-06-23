import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MarkdownText } from "./markdown-text";
import { TooltipIconButton } from "./tooltip-icon-button";
import { PlusIcon } from "lucide-react";
import { ChatInputBar } from "./ChatInputBar";

export const Thread = ({
  uploading,
  uploadError,
  uploadSuccess,
  fileInputRef,
  handleFileChange,
}: {
  uploading: boolean;
  uploadError: string | null;
  uploadSuccess: null | { chunks: number };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [references, setReferences] = useState<any[] | null>(null);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant', content: string, references?: any[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message when history or loading changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, loading]);

  const handleQuery = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setReferences(null);
    // Add user message to history
    setHistory(prev => [...prev, { role: 'user', content: input }]);
    const userInput = input;
    setInput("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_RAG_BE_URL || "http://localhost:3001"}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Query failed");
      setReferences(data.references);
      // Add assistant answer to history
      setHistory(prev => [...prev, { role: 'assistant', content: data.answer, references: data.references }]);
    } catch (err: any) {
      setError(err.message || "Query failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-8 pb-32">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {/* Main chat content */}
        {history.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={
              msg.role === 'user'
                ? 'inline-block bg-blue-100 text-blue-900 rounded-lg px-4 py-2 mb-1'
                : 'inline-block bg-gray-100 text-gray-900 rounded-lg px-4 py-2 mb-1'
            }>
              {msg.role === 'user' ? msg.content : <MarkdownText content={msg.content} />}
            </div>
            {/* Show references for assistant messages */}
            {msg.role === 'assistant' && msg.references && msg.references.length > 0 && (
              <div className="mt-2 ml-2">
                <div className="font-semibold mb-1 text-xs">References:</div>
                <ul className="list-disc ml-6 text-xs">
                  {msg.references.map((ref, ridx) => (

                    <li key={ridx}>Page No. {ref.pageNumber}: {ref.pageContent?.slice(0, 100)}...</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {/* Loader for new response */}
        {loading && (
          <div className="flex justify-start items-center gap-2 text-gray-500 text-sm">
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span>Assistant is typing…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
      {/* Chat input bar fixed at bottom */}
      <ChatInputBar
        value={input}
        onChange={e => setInput(e.target.value)}
        onSend={handleQuery}
        onUpload={() => fileInputRef.current?.click()}
        uploading={uploading}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        disabled={loading}
      />
      {/* Upload status/errors below the bar */}
      <div className="fixed bottom-2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4 pointer-events-none">
        {uploadError && <div className="text-red-500 text-sm text-center pointer-events-auto">{uploadError}</div>}
        {uploadSuccess && (
          <div className="text-green-600 text-sm text-center pointer-events-auto">
            PDF uploaded and embedded successfully. Chunks: {uploadSuccess.chunks}
          </div>
        )}
      </div>
    </div>
  );
};
