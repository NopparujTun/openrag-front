import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useBots } from "@/store/bots";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export default function BotSettings() {
  const { id } = useParams();
  const { getBot, updateBot, deleteBot, isLoading } = useBots();
  const navigate = useNavigate();
  const bot = id ? getBot(id) : undefined;
  
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (bot) {
      setName(bot.name);
      setIsPublic(bot.is_public);
    }
  }, [bot?.id, bot?.name, bot?.is_public]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!bot) return <Navigate to="/bots" replace />;

  const save = async () => {
    setIsSaving(true);
    try {
      await updateBot(bot.id, { name, is_public: isPublic });
    } catch (err) {
      // toast is handled in store
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Are you sure you want to delete this bot? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteBot(bot.id);
      navigate("/bots");
    } catch (err) {
      // toast is handled in store
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={`${bot.name} - Settings`} description="Manage bot configuration." />
      <div className="px-6 py-6 max-w-2xl space-y-6">
        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-medium">General</h3>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Public Access</Label>
              <p className="text-xs text-muted-foreground">Allow anyone with the link to chat with this bot.</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <h3 className="text-sm font-medium text-destructive">Danger zone</h3>
          <p className="mt-1 text-xs text-muted-foreground">Deleting this bot is permanent and cannot be undone.</p>
          <Button
            variant="destructive"
            className="mt-4"
            onClick={remove}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete bot
          </Button>
        </div>
      </div>
    </div>
  );
}
