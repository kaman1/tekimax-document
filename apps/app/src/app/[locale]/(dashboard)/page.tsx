"use client";

import { Header } from "@/app/[locale]/(dashboard)/_components/header";
import { getScopedI18n } from "@/locales/server";
import { CreateFolderForm } from "@/components/forms/create-folder-form";
import * as Dialog from "@radix-ui/react-dialog";
import { FolderIcon, X, Layers } from "lucide-react";
import { Card, Box, Container, Flex, Text, Heading, Grid, Button, Table, Select } from '@radix-ui/themes';
import { FileIcon, PlusIcon } from '@radix-ui/react-icons';
import { useQuery } from "convex/react";
import { api } from "@v1/backend/convex/_generated/api";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.list);
  const user = useQuery(api.users.getUser);
  const { activeWorkspace, isLoading } = useWorkspace();

  useEffect(() => {
    // Only redirect if we have loaded the workspace data and there are no workspaces
    if (!isLoading && workspaces !== undefined && workspaces.length === 0) {
      router.push("/onboarding");
      return;
    }
  }, [workspaces, isLoading, router]);

  // Show loading state while checking workspace status
  if (isLoading || !user || workspaces === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text>Loading...</Text>
      </div>
    );
  }

  // If no workspaces, don't render dashboard content
  if (workspaces.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Flex align="center" gap="2">
          {activeWorkspace?.settings?.logoUrl ? (
            <img
              src={activeWorkspace.settings.logoUrl}
              alt={activeWorkspace.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <Layers className="w-6 h-6 text-gray-900" />
          )}
          <Heading as="h1" size="6" weight="medium">
            {activeWorkspace?.name || "Personal Workspace"}
          </Heading>
        </Flex>
        <p className="mt-2 text-gray-600">Manage your documents and folders</p>
      </div>

      <Grid columns={{ initial: '1', md: '6' }} gap="6">
        <Box className="col-span-4">
          <Card size="3" style={{ background: 'white' }}>
            <Box p="6">
              <Flex justify="between" align="center" mb="4">
                <Heading as="h2" size="5" weight="medium">
                  Folders
                </Heading>
                <Flex gap="3" align="center">
                  <Select.Root defaultValue="all">
                    <Select.Trigger placeholder="Filter by type" />
                    <Select.Content>
                      <Select.Group>
                        <Select.Label>Filter</Select.Label>
                        <Select.Item value="all">All Folders</Select.Item>
                        <Select.Item value="empty">Empty Folders</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>

                  <Dialog.Root>
                    <Dialog.Trigger asChild>
                      <Button size="2" variant="soft" highContrast>
                        <PlusIcon className="mr-1 h-3 w-3" />
                        New Folder
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                      <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
                        <CreateFolderForm />
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                </Flex>
              </Flex>

              <Card variant="surface" style={{ background: 'var(--gray-2)' }} className="p-8 text-center">
                <Flex direction="column" align="center" gap="4">
                  <Box className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--gray-4)]">
                    <FolderIcon className="h-8 w-8 text-[var(--gray-8)]" />
                  </Box>
                  <Box>
                    <Text as="p" size="2" weight="medium" mb="2">
                      No folders yet
                    </Text>
                    <Text as="p" size="2" color="gray">
                      Create your first folder to organize your documents
                    </Text>
                  </Box>
                </Flex>
              </Card>
            </Box>
          </Card>
        </Box>

        <Box className="col-span-2">
          <Card size="3" style={{ background: 'white' }}>
            <Box p="6">
              <Heading as="h2" size="5" mb="4" weight="medium">
                Recent Activity
              </Heading>

              <Card variant="surface" style={{ background: 'var(--gray-2)' }} className="p-8 text-center">
                <Flex direction="column" align="center" gap="4">
                  <Box className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--gray-4)]">
                    <FileIcon className="h-8 w-8 text-[var(--gray-8)]" />
                  </Box>
                  <Box>
                    <Text as="p" size="2" weight="medium" mb="2">
                      No recent activity
                    </Text>
                    <Text as="p" size="2" color="gray">
                      Your recent document and folder activities will appear here
                    </Text>
                  </Box>
                </Flex>
              </Card>
            </Box>
          </Card>
        </Box>
      </Grid>
    </div>
  );
}
