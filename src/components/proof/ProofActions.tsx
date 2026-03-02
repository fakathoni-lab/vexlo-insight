import { useNavigate } from "react-router-dom";
import { Copy, Share2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProofActionsProps {
  narrative: string | null;
  publicSlug: string | null;
  isPublic: boolean;
}

const ProofActions = ({ narrative, publicSlug, isPublic }: ProofActionsProps) => {
  const navigate = useNavigate();

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
    if (isPublic && publicSlug) {
      const url = `${window.location.origin}/p/${publicSlug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard");
      } catch {
        toast.error("Failed to copy link");
      }
    } else {
      toast("Make the proof public first to share it");
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
        className="inline-flex items-center gap-2 h-10 px-5 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)]"
        style={{ borderColor: "var(--border-strong)", color: "var(--text-dim)" }}
      >
        <Share2 size={14} /> Share Link
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
