"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Assistant = () => {
  const runtime = useChatRuntime({
    api: "/api/chat",
  });

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<null | { chunks: number }>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_RAG_BE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploadSuccess({ chunks: data.chunks });
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Upload UI at the top */}
          <div className="flex flex-col gap-2 p-4 border-b bg-background">
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="max-w-xs"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                type="button"
              >
                {uploading ? "Uploading..." : "Upload PDF"}
              </Button>
            </div>
            {uploadError && (
              <div className="text-red-500 text-sm">{uploadError}</div>
            )}
            {uploadSuccess && (
              <div className="text-green-600 text-sm">
                PDF uploaded and embedded successfully. Chunks: {uploadSuccess.chunks}
              </div>
            )}
          </div>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <Thread />
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
