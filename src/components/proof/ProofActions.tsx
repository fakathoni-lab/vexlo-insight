import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Share2, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { shareProof } from "@/hooks/useProofs";

interface ProofActionsProps {
  proofId: string;
  narrative: string | null;
  publicSlug: string | null;
  isPublic: boolean;
  onSlugUpdate?: (slug: string) => void;
}

const ProofActions = ({ proofId, narrative, publicSlug, isPublic, onSlugUpdate }: ProofActionsProps) => {
  const navigate = useNavigate();
  const [shareState, setShareState] = useState<"idle" | "loading" | "copied">("idle");

  const handleCopyNarrative = async () => {
    if (!narrative) {
      toast.error("No narrative to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(narrative);
      toast.success("Narrative copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    setShareState("loading");
    try {
      const result = await shareProof(proofId, publicSlug);

      try {
        await navigator.clipboard.writeText(result.url);
      } catch {
        // Fallback for older browsers
        window.prompt("Copy this link:", result.url);
      }

      onSlugUpdate?.(result.slug);
      setShareState("copied");
      toast.success("Link copied! Valid for anyone with this URL.");

      setTimeout(() => setShareState("idle"), 3000);
    } catch (err) {
      setShareState("idle");
      toast.error("Failed to generate share link");
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 md:left-60 border-t z-40 flex items-center justify-end gap-3 px-8 py-4"
      style={{
        backgroundColor: "var(--bg-raised)",
        borderColor: "var(--border)",
      }}
    >
      <button
        onClick={handleCopyNarrative}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)]"
        style={{ borderColor: "var(--border-strong)", color: "var(--text-dim)" }}
      >
        <Copy size={14} /> Copy Narrative
      </button>
      <button
        onClick={handleShare}
        disabled={shareState === "loading"}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)]"
        style={{
          borderColor: shareState === "copied" ? "rgba(34,197,94,0.25)" : "var(--border-strong)",
          color: shareState === "copied" ? "#22c55e" : "var(--text-dim)",
        }}
      >
        {shareState === "copied" ? <Check size={14} /> : <Share2 size={14} />}
        {shareState === "copied" ? "Copied!" : shareState === "loading" ? "Generating…" : "Share Link"}
      </button>
      <button
        onClick={() => navigate("/dashboard/new")}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        style={{
          backgroundColor: "var(--accent)",
          color: "#fff",
          boxShadow: "var(--emboss-shadow), var(--inset-shadow)",
        }}
      >
        <Plus size={14} /> Generate New
      </button>
    </div>
  );
};

export default ProofActions;
