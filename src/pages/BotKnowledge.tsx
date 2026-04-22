import { useParams, Navigate } from "react-router-dom";
import { useBots, useBotDocuments } from "@/context/BotsContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRef, useState } from "react";
import { Upload, FileText, Trash2, FileType2, Loader2, Type } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function BotKnowledge() {
  const { id } = useParams();
  const { getBot, addDocuments, removeDocument, addTextKnowledge, isLoading: botsLoading } = useBots();
  const { data: documents = [], isLoading: docsLoading } = useBotDocuments(id);
  const bot = id ? getBot(id) : undefined;
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [textFilename, setTextFilename] = useState("notes.txt");
  const [textContent, setTextContent] = useState("");
  const [isAddingText, setIsAddingText] = useState(false);

  if (botsLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading bot...</p>
      </div>
    );
  }

  if (!bot) return <Navigate to="/bots" replace />;

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      await addDocuments(bot.id, Array.from(files));
      toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onAddText = async () => {
    if (!textContent.trim()) return;
    setIsAddingText(true);
    try {
      await addTextKnowledge(bot.id, textFilename, textContent);
      setTextContent("");
      setTextFilename("notes.txt");
    } catch (err: unknown) {
      // toast handled in store
    } finally {
      setIsAddingText(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={`${bot.name} - Knowledge Base`} 
        description="Upload documents or add text to ground your bot's answers." 
      />
      <div className="px-6 py-6 space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* File Upload Section */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              onFiles(e.dataTransfer.files);
            }}
            className={cn(
              "rounded-lg border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition-colors h-full flex flex-col items-center justify-center",
              drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              isUploading && "opacity-50 pointer-events-none"
            )}
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-background text-primary shadow-sm">
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            </div>
            <h3 className="text-base font-semibold">{isUploading ? "Uploading..." : "Drop files here"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">PDF, MD, TXT, DOCX up to 25MB</p>
            <Button className="mt-4" onClick={() => inputRef.current?.click()} disabled={isUploading}>
              {isUploading ? "Please wait" : "Choose files"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
              accept=".pdf,.docx,.txt,.csv"
            />
          </div>

          {/* Text Knowledge Section */}
          <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Type className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold">Add Plain Text</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input 
                id="filename" 
                value={textFilename} 
                onChange={(e) => setTextFilename(e.target.value)} 
                placeholder="notes.txt" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                value={textContent} 
                onChange={(e) => setTextContent(e.target.value)} 
                placeholder="Paste or type any text content your bot should know..." 
                className="min-h-[120px]"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={onAddText} disabled={!textContent.trim() || isAddingText} size="sm">
                {isAddingText && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAddingText ? "Adding..." : "Add text"}
              </Button>
            </div>
          </div>
        </div>

        {/* Documents Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Documents</h3>
            <p className="text-sm text-muted-foreground">{documents.length} items</p>
          </div>

          {docsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <EmptyState 
              icon={<FileText className="h-5 w-5" />} 
              title="No documents yet" 
              description="Upload your first file or add text above to get started." 
            />
          ) : (
            <div className="rounded-lg border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileType2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{d.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {d.created_at ? formatDistanceToNow(new Date(d.created_at), { addSuffix: true }) : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          variant={d.status === "ready" ? "ready" : (d.status === "processing" || d.status === "pending") ? "processing" : "failed"}
                        >
                          {d.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={async () => {
                            if (!confirm("Delete this document?")) return;
                            try {
                              await removeDocument(bot.id, d.id);
                              toast.success("Document removed");
                            } catch (err: unknown) {
                              const msg = err instanceof Error ? err.message : String(err);
                              toast.error(`Failed to remove: ${msg}`);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
