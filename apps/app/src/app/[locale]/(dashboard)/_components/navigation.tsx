"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@v1/backend/convex/_generated/api";
import { Button, Box, DropdownMenu, Flex, Text, Separator } from '@radix-ui/themes';
import { Logo } from "@v1/ui/logo";
import { cn } from "@v1/ui/utils";
import { type Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { ChevronUpIcon, ChevronDownIcon, ExitIcon, GearIcon, StarFilledIcon, PlusIcon, DashboardIcon, IdCardIcon} from '@radix-ui/react-icons';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PLANS } from "@v1/backend/convex/schema";
import { useChangeLocale, useCurrentLocale } from "@/locales/client";
import { Languages } from "lucide-react";
import { CreateWorkspaceModal } from "@/components/CreateWorkspaceModal";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";

export function Navigation({
  preloadedUser,
}: {
  preloadedUser: Preloaded<typeof api.users.getUser>;
}) {
  const { signOut } = useAuthActions();
  const pathname = usePathname();
  const router = useRouter();
  const isDashboardPath = pathname === "/";
  const isSettingsPath = pathname === "/settings";
  const isBillingPath = pathname === "/settings/billing";
  const changeLocale = useChangeLocale();
  const locale = useCurrentLocale();
  const workspaces = useQuery(api.workspaces.list);
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspace();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const user = usePreloadedQuery(preloadedUser);
  const activeWorkspace = workspaces?.find(w => w._id === activeWorkspaceId) || {
    name: "Personal",
    logoUrl: null,
  };

  if (!user) {
    return null;
  }

  const personalWorkspace = {
    _id: user._id,
    name: "Personal",
    logoUrl: user.imageUrl,
    type: "personal" as const,
  };

  const allWorkspaces = [personalWorkspace, ...(workspaces || [])];

  const langs = [
    { text: "English", value: "en" },
    { text: "French", value: "fr" },
    { text: "Spanish", value: "es" },
  ];

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col bg-card/20">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "absolute inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
          )}
        />
        <div className="absolute inset-0 bg-background/20" />
      </div>
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-6 pt-6 pb-6">
        <Flex align="center" gap="2">
          <Link href="/" className="flex h-10 items-center gap-1">
            <img
              src="https://industrious-narwhal-216.convex.cloud/api/storage/b81dbd4b-cf62-4422-8381-cf8ee09adcf8"
              alt="logo"
              className="h-7 w-auto"
            />
          </Link>
          <Text size="2" color="gray">/</Text>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="ghost" className="gap-2 data-[state=open]:bg-transparent ml-1">
                <Flex align="center" gap="2">
                  {activeWorkspace.logoUrl ? (
                    <img
                      src={activeWorkspace.logoUrl}
                      alt={activeWorkspace.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <Box className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--accent-9)] to-[var(--accent-3)]" />
                  )}
                  <Text size="2" weight="medium">
                    {activeWorkspace.name}
                  </Text>
                  <Box className="rounded-full bg-[var(--accent-3)] px-2 py-0.5">
                    <Text size="1" weight="medium">
                      {allWorkspaces.length} workspace{allWorkspaces.length !== 1 ? 's' : ''}
                    </Text>
                  </Box>
                  <Flex direction="column" align="center" justify="center" gap="0">
                    <ChevronUpIcon className="relative top-[1px] h-3 w-3 text-[var(--gray-8)]" />
                    <ChevronDownIcon className="relative bottom-[1px] h-3 w-3 text-[var(--gray-8)]" />
                  </Flex>
                </Flex>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>
                <Text size="1" color="gray">Switch Workspace</Text>
              </DropdownMenu.Label>
              {/* Personal Workspace */}
              <DropdownMenu.Item 
                key={personalWorkspace._id} 
                onSelect={() => setActiveWorkspaceId(personalWorkspace._id)}
              >
                <Flex align="center" gap="2">
                  {personalWorkspace.logoUrl ? (
                    <img
                      src={personalWorkspace.logoUrl}
                      alt={personalWorkspace.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <Box className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--accent-9)] to-[var(--accent-3)]" />
                  )}
                  <Text size="2">{personalWorkspace.name}</Text>
                  <Box className="rounded-full bg-[var(--accent-3)] px-2 py-0.5">
                    <Text size="1" weight="medium">Personal</Text>
                  </Box>
                  {activeWorkspaceId === personalWorkspace._id && (
                    <Text size="1" color="gray" className="ml-auto">Active</Text>
                  )}
                </Flex>
              </DropdownMenu.Item>
              
              {/* Separator between Personal and Team Workspaces */}
              {workspaces && workspaces.length > 0 && (
                <DropdownMenu.Separator />
              )}

              {/* Team Workspaces */}
              {workspaces?.map((workspace) => (
                <DropdownMenu.Item 
                  key={workspace._id} 
                  onSelect={() => setActiveWorkspaceId(workspace._id)}
                >
                  <Flex align="center" gap="2">
                    {workspace.logoUrl ? (
                      <img
                        src={workspace.logoUrl}
                        alt={workspace.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <Box className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--accent-9)] to-[var(--accent-3)]" />
                    )}
                    <Text size="2">{workspace.name}</Text>
                    <Box className="rounded-full bg-[var(--accent-3)] px-2 py-0.5">
                      <Text size="1" weight="medium">
                        {workspace.type === 'custom' ? workspace.customType : workspace.type}
                      </Text>
                    </Box>
                    {activeWorkspaceId === workspace._id && (
                      <Text size="1" color="gray" className="ml-auto">Active</Text>
                    )}
                  </Flex>
                </DropdownMenu.Item>
              ))}

              {/* Create Workspace Option */}
              <DropdownMenu.Separator />
              <DropdownMenu.Item onSelect={() => setIsCreateModalOpen(true)}>
                <Flex align="center" gap="2">
                  <PlusIcon className="h-4 w-4" />
                  <Text size="2">Create Workspace</Text>
                </Flex>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" className="gap-2 data-[state=open]:bg-transparent">
              <Flex align="center" gap="2">
                {user.avatarUrl ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    alt={user.name ?? user.email}
                    src={user.avatarUrl}
                  />
                ) : (
                  <Box className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent-9)] to-[var(--accent-3)]" />
                )}
                <Text size="2" weight="medium">
                  @{user?.name || ""}
                </Text>
                <Box className="rounded-full bg-[var(--accent-3)] px-2 py-0.5">
                  <Text size="1" weight="medium">
                    {user.subscription?.planId === user.plan ? "Pro" : "Free"}
                  </Text>
                </Box>
                <Flex direction="column" align="center" justify="center" gap="0">
                  <ChevronUpIcon className="relative top-[1px] h-3 w-3 text-[var(--gray-8)]" />
                  <ChevronDownIcon className="relative bottom-[1px] h-3 w-3 text-[var(--gray-8)]" />
                </Flex>
              </Flex>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>
              <Text size="1" color="gray">Personal Account</Text>
            </DropdownMenu.Label>
            <DropdownMenu.Item>
              <Flex align="center" gap="2">
                {user.avatarUrl ? (
                  <img
                    className="h-6 w-6 rounded-full object-cover"
                    alt={user.name ?? user.email}
                    src={user.avatarUrl}
                  />
                ) : (
                  <Box className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--accent-9)] to-[var(--accent-3)]" />
                )}
                <Box>
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">@{user.name}</Text>
                    <Text size="1" color="gray">{user.email}</Text>
                  </Flex>
                </Box>
              </Flex>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => router.push('/settings')}>
              <Flex gap="2" align="center">
                <GearIcon />
                <Text size="2">Settings</Text>
              </Flex>
            </DropdownMenu.Item>
            {user.plan === PLANS.FREE && (
              <DropdownMenu.Item onSelect={() => router.push('/settings/billing')}>
                <Flex gap="2" align="center">
                  <StarFilledIcon />
                  <Text size="2">Upgrade to Pro</Text>
                </Flex>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Separator />
            <DropdownMenu.Label>
              <Text size="1" color="gray">Language</Text>
            </DropdownMenu.Label>
            {langs.map(({ text, value }) => (
              <DropdownMenu.Item
                key={value}
                onSelect={() => changeLocale(value)}
              >
                <Flex gap="2" align="center">
                  <Languages className="h-4 w-4" />
                  <Text size="2">{text}</Text>
                  {locale === value && (
                    <Text size="1" color="gray" className="ml-auto">
                      Active
                    </Text>
                  )}
                </Flex>
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red" onSelect={signOut}>
              <Flex gap="2" align="center">
                <ExitIcon />
                <Text size="2">Sign out</Text>
              </Flex>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      <div className="mx-auto flex w-full max-w-screen-xl items-center gap-8 px-6 pt-8">
        <div
          className={cn(
            "flex h-12 items-center border-b-2 hover:text-[var(--accent-9)] transition-colors",
            isDashboardPath ? "border-[var(--accent-9)] text-[var(--accent-9)] font-medium" : "border-transparent text-gray-600",
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2",
            )}
          >
            <DashboardIcon className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
        <div
          className={cn(
            "flex h-12 items-center border-b-2 hover:text-[var(--accent-9)] transition-colors",
            isSettingsPath ? "border-[var(--accent-9)] text-[var(--accent-9)] font-medium" : "border-transparent text-gray-600",
          )}
        >
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2",
            )}
          >
            <GearIcon className="h-4 w-4" />
            Settings
          </Link>
        </div>
        <div
          className={cn(
            "flex h-12 items-center border-b-2 hover:text-[var(--accent-9)] transition-colors",
            isBillingPath ? "border-[var(--accent-9)] text-[var(--accent-9)] font-medium" : "border-transparent text-gray-600",
          )}
        >
          <Link
            href="/settings/billing"
            className={cn(
              "flex items-center gap-2",
            )}
          >
            <IdCardIcon className="h-4 w-4" />
            Billing
          </Link>
        </div>
      </div>
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
        onWorkspaceCreated={(workspace) => {
          setActiveWorkspaceId(workspace._id);
        }}
      />
    </nav>
  );
}