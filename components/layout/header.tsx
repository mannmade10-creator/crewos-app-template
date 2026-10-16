import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function Header() {
  const user = await currentUser();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {user?.emailAddresses?.[0]?.emailAddress}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
