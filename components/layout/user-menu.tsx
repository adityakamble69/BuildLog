import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

function UserMenu() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </Show>
      <Show when="signed-out">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </Show>
    </div>
  );
}

export { UserMenu };
