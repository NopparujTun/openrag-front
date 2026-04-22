import { createContext, useContext, ReactNode, useMemo, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { botApi as api } from "@/features/bot/services/botApi";
import { BotOut, BotUpdate, DocumentOut } from "@/features/bot/types/api";
import { toast } from "sonner";
import { supabase } from "@/api";
import { Session, User } from "@supabase/supabase-js";

interface BotsContextValue {
  bots: BotOut[];
  isLoading: boolean;
  isAuthLoading: boolean;
  error: Error | null;
  getBot: (id: string | undefined) => BotOut | undefined;
  createBot: (name: string) => Promise<BotOut>;
  updateBot: (id: string, patch: BotUpdate) => Promise<void>;
  deleteBot: (id: string) => Promise<void>;
  addDocuments: (botId: string, files: File[]) => Promise<void>;
  addTextKnowledge: (botId: string, filename: string, content: string) => Promise<void>;
  removeDocument: (botId: string, docId: string) => Promise<void>;
  
  // Auth
  session: Session | null;
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const BotsContext = createContext<BotsContextValue | null>(null);

export function BotsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthLoading(false);
      if (session) {
        queryClient.invalidateQueries({ queryKey: ["bots"] });
      } else {
        queryClient.setQueryData(["bots"], []);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Queries
  const { data: bots = [], isLoading: isBotsLoading, error } = useQuery({
    queryKey: ["bots"],
    queryFn: api.bots.list,
    enabled: !!session,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: api.bots.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot created successfully");
    },
    onError: (err: Error) => toast.error(`Failed to create bot: ${err.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: BotUpdate }) => api.bots.update(id, patch),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["bot", id] });
      toast.success("Bot updated successfully");
    },
    onError: (err: Error) => toast.error(`Failed to update bot: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: api.bots.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot deleted successfully");
    },
    onError: (err: Error) => toast.error(`Failed to delete bot: ${err.message}`),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ botId, file }: { botId: string; file: File }) => api.documents.upload(botId, file),
    onSuccess: (_, { botId }) => {
      queryClient.invalidateQueries({ queryKey: ["documents", botId] });
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Document uploaded successfully");
    },
    onError: (err: Error) => toast.error(`Failed to upload document: ${err.message}`),
  });

  const addTextMutation = useMutation({
    mutationFn: ({ botId, filename, content }: { botId: string; filename: string; content: string }) => 
      api.documents.addText(botId, filename, content),
    onSuccess: (_, { botId }) => {
      queryClient.invalidateQueries({ queryKey: ["documents", botId] });
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Text knowledge added successfully");
    },
    onError: (err: Error) => toast.error(`Failed to add text: ${err.message}`),
  });

  const removeDocMutation = useMutation({
    mutationFn: ({ botId, docId }: { botId: string; docId: string }) => api.documents.delete(botId, docId),
    onSuccess: (_, { botId }) => {
      queryClient.invalidateQueries({ queryKey: ["documents", botId] });
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Document removed successfully");
    },
    onError: (err: Error) => toast.error(`Failed to remove document: ${err.message}`),
  });

  const value = useMemo<BotsContextValue>(
    () => ({
      bots,
      isLoading: isAuthLoading || (!!session && isBotsLoading),
      isAuthLoading,
      error: error as Error | null,
      getBot: (id) => bots.find((b) => b.id === id),
      createBot: async (name) => {
        return createMutation.mutateAsync({ name });
      },
      updateBot: async (id, patch) => {
        await updateMutation.mutateAsync({ id, patch });
      },
      deleteBot: async (id) => {
        await deleteMutation.mutateAsync(id);
      },
      addDocuments: async (botId, files) => {
        await Promise.all(files.map((file) => uploadMutation.mutateAsync({ botId, file })));
      },
      addTextKnowledge: async (botId, filename, content) => {
        await addTextMutation.mutateAsync({ botId, filename, content });
      },
      removeDocument: async (botId, docId) => {
        await removeDocMutation.mutateAsync({ botId, docId });
      },
      session,
      user: session?.user ?? null,
      signIn: async () => {
        const redirectTo = import.meta.env.VITE_FRONTEND_URL 
          ? `${import.meta.env.VITE_FRONTEND_URL.replace(/\/+$/, '')}/bots`
          : `${window.location.origin}/bots`;
          
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo }
        });
      },
      signOut: async () => {
        await supabase.auth.signOut();
      }
    }),
    [bots, isAuthLoading, isBotsLoading, error, createMutation, updateMutation, deleteMutation, uploadMutation, addTextMutation, removeDocMutation, session],
  );

  return <BotsContext.Provider value={value}>{children}</BotsContext.Provider>;
}

export function useBots() {
  const ctx = useContext(BotsContext);
  if (!ctx) throw new Error("useBots must be used within BotsProvider");
  return ctx;
}

export function useBotDocuments(botId: string | undefined) {
  const { session } = useBots();
  return useQuery({
    queryKey: ["documents", botId],
    queryFn: () => (botId ? api.documents.list(botId) : Promise.resolve([])),
    enabled: !!botId && !!session,
  });
}
