import {
  LayoutDashboard,
  Bot,
  FileText,
  MessageSquare,
  Code2,
  Settings,
  BookOpen,
  CircleHelp,
  Sparkles,
  PanelLeft,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/layout/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useBots } from "@/store/bots";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const workspaceItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true },
  { title: "Bots", url: "/bots", icon: Bot },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const { getBot, user, signOut } = useBots();

  // detect current bot from URL
  const match = location.pathname.match(/^\/bots\/([^/]+)/);
  const botId = match?.[1] && match[1] !== "new" ? match[1] : params.id;
  const currentBot = botId ? getBot(botId) : undefined;

  const botItems = currentBot
    ? [
        { title: "Overview", url: `/bots/${currentBot.id}`, icon: LayoutDashboard, end: true },
        { title: "Knowledge Base", url: `/bots/${currentBot.id}/knowledge`, icon: BookOpen },
        { title: "Instructions", url: `/bots/${currentBot.id}/instructions`, icon: FileText },
        { title: "Chat Preview", url: `/bots/${currentBot.id}/chat`, icon: MessageSquare },
        { title: "Embed", url: `/bots/${currentBot.id}/embed`, icon: Code2 },
        { title: "Settings", url: `/bots/${currentBot.id}/settings`, icon: Settings },
      ]
    : [];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
    toast.success("Signed out successfully");
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "group/logo flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4 transition-opacity group-hover/logo:opacity-0" />
            <PanelLeft className="absolute h-4 w-4 opacity-0 transition-opacity group-hover/logo:opacity-100" />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-semibold">OpenRag</span>
              <span className="truncate text-[11px] text-muted-foreground">Workspace</span>
            </div>
          )}
          {!collapsed && (
            <PanelLeft className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/logo:opacity-100" />
          )}
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="text-sidebar-foreground"
                      activeClassName="bg-black/5 text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentBot && (
          <SidebarGroup>
            <SidebarGroupLabel>Current Bot</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={currentBot.name}>
                    <NavLink
                      to={`/bots/${currentBot.id}`}
                      end
                      className="text-sidebar-foreground"
                      activeClassName="bg-black/5 text-sidebar-accent-foreground font-medium"
                    >
                      <Bot className="h-4 w-4" />
                      <span className="truncate">{currentBot.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {botItems.slice(1).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.end}
                        className="pl-8 text-sidebar-foreground"
                        activeClassName="bg-black/5 text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full justify-start gap-2 px-2 hover:bg-sidebar-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.email?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start text-left text-sm leading-tight min-w-0 flex-1">
                  <span className="truncate font-semibold">{user?.email?.split('@')[0]}</span>
                  <span className="truncate text-[11px] text-muted-foreground">{user?.email}</span>
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={8}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast("Settings coming soon")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Support coming soon")}>
              <CircleHelp className="mr-2 h-4 w-4" />
              Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
