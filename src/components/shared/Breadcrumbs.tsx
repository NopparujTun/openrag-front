import { useLocation, Link, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useBots } from "@/context/BotsContext";
import { Button } from "@/components/ui/button";

function useCrumbs() {
  const location = useLocation();
  const { getBot } = useBots();
  const parts = location.pathname.split("/").filter(Boolean);
  const crumbs: { label: string; to: string }[] = [];

  if (parts.length === 0) {
    crumbs.push({ label: "Dashboard", to: "/" });
  }
  if (parts[0] === "bots") {
    crumbs.push({ label: "Bots", to: "/bots" });
    if (parts[1]) {
      const bot = getBot(parts[1]);
      crumbs.push({ label: bot?.name ?? parts[1], to: `/bots/${parts[1]}` });
      if (parts[2]) {
        const map: Record<string, string> = {
          knowledge: "Knowledge Base",
          instructions: "Instructions",
          chat: "Chat Preview",
          embed: "Embed",
          settings: "Settings",
        };
        crumbs.push({ label: map[parts[2]] ?? parts[2], to: location.pathname });
      }
    }
  }
  return crumbs;
}

export function Breadcrumbs() {
  const crumbs = useCrumbs();
  const navigate = useNavigate();

  if (crumbs.length === 0) return null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <nav className="flex items-center gap-1 text-xs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={c.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
            <Link
              to={c.to}
              className={
                i === crumbs.length - 1
                  ? "text-muted-foreground font-medium hover:text-foreground"
                  : "text-muted-foreground/70 hover:text-foreground"
              }
            >
              {c.label}
            </Link>
          </span>
        ))}
      </nav>
    </div>
  );
}
