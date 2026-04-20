import { useBots } from "@/store/bots";
import { Button } from "@/components/ui/button";
import { Bot, LogIn } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { session, signIn } = useBots();

  if (session) {
    return <Navigate to="/bots" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm space-y-8 rounded-2xl border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-inner">
            <Bot className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to YourBot</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to start building and managing your AI assistants.
          </p>
        </div>

        <div className="space-y-4">
          <Button className="w-full" size="lg" onClick={signIn}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <p className="px-8 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
