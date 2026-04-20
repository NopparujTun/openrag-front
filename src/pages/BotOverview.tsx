import { Link, useParams, Navigate } from "react-router-dom";
import { useBots } from "@/store/bots";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BookOpen, FileText, MessageSquare, Code2, Settings, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BotOverview() {
  const { id } = useParams();
  const { getBot, isLoading } = useBots();
  const bot = id ? getBot(id) : undefined;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Loading bot details...</p>
      </div>
    );
  }

  if (!bot) return <Navigate to="/bots" replace />;

  const ready = (bot.document_count ?? 0) > 0 && bot.instructions.trim().length > 0;

  const actionCards = [
    {
      title: "Knowledge Base",
      description: "Upload documents your bot can reference.",
      to: `/bots/${bot.id}/knowledge`,
      icon: BookOpen,
      meta: `${bot.document_count ?? 0} ${(bot.document_count ?? 0) === 1 ? "file" : "files"} uploaded`,
      configured: (bot.document_count ?? 0) > 0,
    },
    {
      title: "Instructions",
      description: "Define your bot's behavior and personality.",
      to: `/bots/${bot.id}/instructions`,
      icon: FileText,
      meta: bot.instructions.trim() ? "Configured" : "Not configured",
      configured: bot.instructions.trim().length > 0,
    },
    {
      title: "Chat Preview",
      description: "Try your bot before deploying it.",
      to: `/bots/${bot.id}/chat`,
      icon: MessageSquare,
      meta: "Open playground",
      configured: true,
    },
  ];

  const secondary = [
    { title: "Embed", description: "Install on your website.", to: `/bots/${bot.id}/embed`, icon: Code2 },
    { title: "Settings", description: "Manage bot configuration.", to: `/bots/${bot.id}/settings`, icon: Settings },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {bot.name}
            <StatusBadge variant={ready ? "ready" : "missing"}>{ready ? "Ready" : "Missing setup"}</StatusBadge>
          </span>
        }
        description={bot.instructions || "No instructions yet."}
        actions={
          <Button asChild>
            <Link to={`/bots/${bot.id}/chat`}>
              <MessageSquare className="h-4 w-4" />
              Try chat
            </Link>
          </Button>
        }
      />
      <div className="px-6 py-6 space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {actionCards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="group flex flex-col rounded-lg border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <card.icon className="h-5 w-5" />
                </div>
                <StatusBadge variant={card.configured ? "ready" : "missing"}>
                  {card.configured ? "Set up" : "Empty"}
                </StatusBadge>
              </div>
              <h3 className="mt-4 text-base font-semibold group-hover:text-primary">{card.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
              <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{card.meta}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {secondary.map((s) => (
            <Link
              key={s.title}
              to={s.to}
              className="group flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/40"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
