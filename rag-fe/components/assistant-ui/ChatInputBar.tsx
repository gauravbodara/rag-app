import React from "react";
import { PlusIcon, Settings2Icon, MicIcon, SendIcon } from "lucide-react";
import { TooltipIconButton } from "./tooltip-icon-button";

export interface ChatInputBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onUpload: () => void;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChange,
  onSend,
  onUpload,
  uploading,
  fileInputRef,
  handleFileChange,
  disabled,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4">
      <div className="flex items-center gap-3 rounded-2xl bg-white shadow-lg px-4 py-3 border border-zinc-200">
        {/* Left: + icon, tools icon, Tools label */}
        <div className="flex items-center gap-2">
          <TooltipIconButton
            tooltip={uploading ? "Uploading..." : "Upload PDF"}
            onClick={onUpload}
            disabled={uploading}
            aria-label="Upload PDF"
          >
            <PlusIcon color="black" />
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </TooltipIconButton>
          <TooltipIconButton tooltip="Tools" aria-label="Tools">
            <Settings2Icon color="black" />
          </TooltipIconButton>
        </div>
        {/* Center: Input */}
        <input
          type="text"
          className="flex-grow bg-transparent outline-none border-none text-zinc-900 placeholder-zinc-400 px-4 py-2 text-base"
          placeholder="Ask anything"
          value={value}
          onChange={onChange}
          onKeyDown={e => { if (e.key === "Enter") onSend(); }}
          disabled={disabled || uploading}
        />
        {/* Right: Mic and Send icons */}
        <div className="flex items-center gap-2">
          <TooltipIconButton tooltip="Voice input" aria-label="Voice input">
            <MicIcon color="black" />
          </TooltipIconButton>
          <TooltipIconButton tooltip="Send" aria-label="Send" onClick={onSend}>
            <SendIcon color="black" />
          </TooltipIconButton>
        </div>
      </div>
    </div>
  );
}; 