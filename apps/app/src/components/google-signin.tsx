"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { GridIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";

export function GoogleSignin() {
  const { signIn } = useAuthActions();

  return (
    <Button 
      onClick={() => signIn("google")} 
      size="3"
      variant="solid"
      className="bg-amber-800 hover:bg-amber-700 text-white font-medium min-w-[200px]"
    >
      Sign in with Google
    </Button>
  );
}
