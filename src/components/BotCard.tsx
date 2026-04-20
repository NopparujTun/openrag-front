import { Link } from "react-router-dom";
import { BotOut } from "@/types/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Bot as BotIcon, FileText, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function BotCard({ bot }: { bot: BotOut }) {
  const ready = (bot.document_count ?? 0) > 0 && bot.instructions.trim().length > 0;
  
  return (
    <Link
      to={`/bots/${bot.id}`}
      className="group block rounded-lg border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BotIcon className="h-4 w-4" />
        </div>
        <StatusBadge variant={ready ? "ready" : "missing"}>{ready ? "Ready" : "Missing setup"}</StatusBadge>
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground group-hover:text-primary">{bot.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem]">
        {bot.instructions ? bot.instructions : "No instructions yet."}
      </p>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {bot.document_count ?? 0} {(bot.document_count ?? 0) === 1 ? "doc" : "docs"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {bot.updated_at ? formatDistanceToNow(new Date(bot.updated_at), { addSuffix: true }) : "never"}
        </span>
      </div>
    </Link>
  );
}
