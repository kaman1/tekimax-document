import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@v1/backend/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { Navigation } from "./_components/navigation";
import { Theme, ThemePanel } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "@/styles/pattern.css";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";

export default async function Layout({
  children,
}: { children: React.ReactNode }) {
  const user = await fetchQuery(
    api.users.getUser,
    {},
    { token: convexAuthNextjsToken() },
  );
  if (!user?.username || !user?.subscription) {
    return redirect("/onboarding");
  }
  const preloadedUser = await preloadQuery(
    api.users.getUser,
    {},
    { token: convexAuthNextjsToken() },
  );
  return (
    <Theme accentColor="gold" panelBackground="solid" radius="small" scaling="95%">
      <WorkspaceProvider>
        <div className="relative min-h-[100vh] w-full flex flex-col bg-[#f3f3f2] bg-dot-pattern bg-dot-size">
          <div className="content-wrapper">
            <div className="header-wrapper">
              <div className="main-content">
                <Navigation preloadedUser={preloadedUser} />
              </div>
            </div>
            <div className="main-content">
              {children}
            </div>
          </div>
        </div>
      </WorkspaceProvider>
    </Theme>
  );
}
