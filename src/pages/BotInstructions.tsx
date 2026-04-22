import { useParams, Navigate } from "react-router-dom";
import { useBots } from "@/context/BotsContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

const examples = [
  "You are a friendly support bot for SaaS company.",
  "Be concise and cite sources from the knowledge base.",
  "Always ask a clarifying question before suggesting a solution.",
  "If unsure, escalate to a human and collect contact info.",
];

export default function BotInstructions() {
  const { id } = useParams();
  const { getBot, updateBot, isLoading } = useBots();
  const bot = id ? getBot(id) : undefined;
  const [instructions, setInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (bot) {
      setInstructions(bot.instructions);
    }
  }, [bot?.id, bot?.instructions]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading instructions...</p>
      </div>
    );
  }

  if (!bot) return <Navigate to="/bots" replace />;

  const dirty = instructions !== bot.instructions;

  const save = async () => {
    setIsSaving(true);
    try {
      await updateBot(bot.id, { instructions });
    } catch (err) {
      // toast is handled in store
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in pb-24">
      <PageHeader title={`${bot.name} - Instructions`} description="Tell your bot how to behave and respond." />
      <div className="px-6 py-6 space-y-4">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <Label htmlFor="instructions" className="text-sm font-medium">System prompt</Label>
          <p className="mb-3 text-xs text-muted-foreground">This is sent at the start of every conversation.</p>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. You are a helpful assistant for our SaaS product..."
            className="min-h-[280px] font-mono text-sm"
          />
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-medium">Examples</h3>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setInstructions((p) => (p ? `${p}\n${ex}` : ex))}
                className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                + {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {dirty && (
        <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-lg animate-fade-in">
          <span className="text-sm text-muted-foreground">Unsaved changes</span>
          <Button size="sm" onClick={save} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
