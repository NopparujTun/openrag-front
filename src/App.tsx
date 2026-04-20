import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BotsProvider, useBots } from "@/store/bots";
import { AppShell } from "@/components/AppShell";
import Dashboard from "./pages/Dashboard";
import Bots from "./pages/Bots";
import BotOverview from "./pages/BotOverview";
import BotKnowledge from "./pages/BotKnowledge";
import BotInstructions from "./pages/BotInstructions";
import BotChat from "./pages/BotChat";
import BotEmbed from "./pages/BotEmbed";
import BotSettings from "./pages/BotSettings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useBots();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <AuthGuard>
          <AppShell />
        </AuthGuard>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="bots" element={<Bots />} />
      <Route path="bots/:id" element={<BotOverview />} />
      <Route path="bots/:id/knowledge" element={<BotKnowledge />} />
      <Route path="bots/:id/instructions" element={<BotInstructions />} />
      <Route path="bots/:id/chat" element={<BotChat />} />
      <Route path="bots/:id/embed" element={<BotEmbed />} />
      <Route path="bots/:id/settings" element={<BotSettings />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BotsProvider>
          <AppRoutes />
        </BotsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
