"use client";

import * as React from "react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid rendering theme-dependent UI until mounted, since the server
  // doesn't know the persisted preference yet (see components/theme-provider.tsx).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // The persisted preference is only known client-side, so render the
    // server's dark default until hydration has completed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how DevTrace looks on this device.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Button
          variant={isDark ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("dark")}
          disabled={!mounted}
        >
          <Moon />
          Dark
        </Button>
        <Button
          variant={!isDark ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("light")}
          disabled={!mounted}
        >
          <Sun />
          Light
        </Button>
      </CardContent>
    </Card>
  );
}

export { ThemeToggle };
