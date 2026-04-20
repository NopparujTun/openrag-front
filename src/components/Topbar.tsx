import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
