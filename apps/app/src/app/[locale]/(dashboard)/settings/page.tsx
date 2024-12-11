"use client";

import { UnsubscribeWarningModal } from "@/components/UnsubscribeWarningModal";
import { DeleteWorkspaceModal } from "@/components/DeleteWorkspaceModal";
import { useScopedI18n } from "@/locales/client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { api } from "@v1/backend/convex/_generated/api";
import type { Id } from "@v1/backend/convex/_generated/dataModel";
import * as validators from "@v1/backend/convex/utils/validators";
import { Button, Box, Container, Flex, Text, Heading, Grid, Avatar, Badge, Separator, Card, Table, Tooltip, TextField } from '@radix-ui/themes';
import { UploadIcon, TrashIcon, ResetIcon, CheckIcon, ExternalLinkIcon, PersonIcon, GearIcon, ImageIcon, Pencil1Icon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { Input } from "@v1/ui/input";
import { UploadInput } from "@v1/ui/upload-input";
import { useDoubleCheck } from "@v1/ui/utils";
import type { UploadFileResponse } from "@xixixao/uploadstuff/react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v1/ui/select";
import { Label } from "@radix-ui/react-form";


export default function DashboardSettings() {
  const t = useScopedI18n("settings");
  const user = useQuery(api.users.getUser);
  const { signOut } = useAuthActions();
  const updateUserImage = useMutation(api.users.updateUserImage);
  const updateUsername = useMutation(api.users.updateUsername);
  const removeUserImage = useMutation(api.users.removeUserImage);
  const generateUploadUrl = useMutation(api.workspaces.generateUploadUrl);
  const deleteCurrentUserAccount = useMutation(
    api.users.deleteCurrentUserAccount,
  );
  const { doubleCheck, getButtonProps } = useDoubleCheck();
  const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
  const [isDeleteWorkspaceModalOpen, setIsDeleteWorkspaceModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceLogo, setWorkspaceLogo] = useState("");
  const { activeWorkspace, members } = useWorkspace();
  const workspaces = useQuery(api.workspaces.list);
  const updateWorkspace = useMutation(api.workspaces.update);
  const removeWorkspace = useMutation(api.workspaces.remove);
  const createWorkspaceType = useMutation(api.workspaceTypes.create);
  const workspaceTypes = useQuery(api.workspaceTypes.list);

  const router = useRouter();

  const handleUpdateUserImage = (uploaded: UploadFileResponse[]) => {
    return updateUserImage({
      imageId: (uploaded[0]?.response as { storageId: Id<"_storage"> })
        .storageId,
    });
  };

  const handleUpdateWorkspaceLogo = async (uploaded: UploadFileResponse[]) => {
    if (!uploaded[0]?.response || !activeWorkspace?._id) return;
    
    try {
      const storageId = (uploaded[0].response as { storageId: Id<"_storage"> }).storageId;
      await updateWorkspace({
        id: activeWorkspace._id,
        settings: {
          ...activeWorkspace.settings,
          logoId: storageId
        }
      });
      toast.success('Workspace logo updated');
    } catch (error) {
      console.error("Error updating workspace logo:", error);
      toast.error('Failed to update workspace logo');
    }
  };

  const handleRemoveWorkspaceLogo = async () => {
    if (!activeWorkspace?._id) return;
    
    try {
      await updateWorkspace({
        id: activeWorkspace._id,
        settings: {
          ...activeWorkspace.settings,
          logoId: undefined,
          logoUrl: undefined
        }
      });
      toast.success('Workspace logo removed');
    } catch (error) {
      console.error("Error removing workspace logo:", error);
      toast.error('Failed to remove workspace logo');
    }
  };

  const handleUpdateWorkspaceName = async () => {
    if (!workspaceName || !activeWorkspace || workspaceName === activeWorkspace.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateWorkspace({
        id: activeWorkspace._id,
        name: workspaceName,
      });
      setIsEditingName(false);
      toast.success("Workspace name updated successfully");
    } catch (error) {
      console.error("Error updating workspace name:", error);
      toast.error("Failed to update workspace name");
    }
  };





  const handleDeleteAccount = async () => {
    console.log(user?.subscription);
    if (
      user?.subscription?.status &&
      ["active", "incomplete"].includes(user.subscription.status) &&
      !user.subscription.cancelAtPeriodEnd
    ) {
      setIsUnsubscribeModalOpen(true);
    } else {
      await deleteCurrentUserAccount({});
      router.push("/login?accountDeleted=true");
    }
  };



  const unsubscribeHref = `https://sandbox.polar.sh/purchases/subscriptions/${user?.subscription?.polarId}`;

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const usernameForm = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      username: user?.username ?? "",
    },
    onSubmit: async ({ value }) => {
      if (!value.username.trim()) {
        toast.error('Username cannot be empty');
        return;
      }
      
      setIsUpdatingUsername(true);
      try {
        await updateUsername({
          username: value.username.trim(),
        });
        toast.success('Username updated successfully');
        setIsEditingUsername(false);
      } catch (error) {
        console.error("Error updating username:", error);
        toast.error('Failed to update username. Please try again.');
      } finally {
        setIsUpdatingUsername(false);
      }
    },
  });



  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <Heading as="h1" size="6" mb="2" weight="medium">Settings</Heading>
        <Text as="p" size="2" color="gray">
          Manage your account settings and preferences
        </Text>
      </div>

      <Card size="3" style={{ background: 'white', width: '100%' }}>
        <Box p="6">
          <Heading as="h2" size="5" mb="4" weight="medium">
            Profile Settings
          </Heading>
          <Text as="p" size="2" color="gray" mb="6">
            Update your profile information and manage your account
          </Text>

          <Card variant="surface" style={{ background: 'var(--gray-2)' }} className="p-8">
            <Flex direction="column" gap="6">
              {/* Avatar Section */}
              <Flex align="center" gap="4">
                <Box className="relative">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      className="h-20 w-20 rounded-full object-cover"
                      alt={user.username ?? user.email}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                  )}
                  <label
                    htmlFor="avatar_field"
                    className="group absolute inset-0 flex cursor-pointer items-center justify-center rounded-full transition hover:bg-primary/40"
                  >
                    <UploadIcon className="hidden h-6 w-6 text-secondary group-hover:block" />
                  </label>
                  <UploadInput
                    id="avatar_field"
                    type="file"
                    accept="image/*"
                    className="peer sr-only"
                    required
                    tabIndex={user ? -1 : 0}
                    generateUploadUrl={generateUploadUrl}
                    onUploadComplete={handleUpdateUserImage}
                  />
                </Box>
                {user.avatarUrl && (
                  <Button
                    type="button"
                    size="2"
                    variant="soft"
                    highContrast
                    onClick={() => {
                      removeUserImage({});
                    }}
                  >
                    <ResetIcon className="h-4 w-4 mr-2" />
                    {t("avatar.resetButton")}
                  </Button>
                )}
              </Flex>

              {/* Username Section */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  usernameForm.handleSubmit();
                }}
              >
                <Box className="space-y-4">
                  <Box>
                    <Text as="p" size="2" weight="medium" mb="2">
                      Username
                    </Text>
                    <Text as="p" size="2" color="gray" mb="4">
                      This is your username. It will be displayed on your profile.
                    </Text>
                  </Box>
                  <Flex gap="4" align="end">
                    <Box grow="1">
                      <usernameForm.Field
                        name="username"
                        validators={{
                          onSubmit: validators.username,
                        }}
                        children={(field) => (
                          <Input
                            placeholder="Username"
                            autoComplete="off"
                            required
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={isUpdatingUsername}
                            className={`w-full bg-transparent ${
                              field.state.meta?.errors?.length > 0 &&
                              "border-destructive focus-visible:ring-destructive"
                            }`}
                          />
                        )}
                      />
                      {usernameForm.state.fieldMeta.username?.errors.length > 0 && (
                        <Text as="p" size="1" color="red" mt="1">
                          {usernameForm.state.fieldMeta.username?.errors.join(" ")}
                        </Text>
                      )}
                    </Box>
                    <Button 
                      type="submit"
                      disabled={isUpdatingUsername}
                      loading={isUpdatingUsername}
                      className="bg-amber-800 hover:bg-amber-700 text-white font-medium"
                    >
                      {isUpdatingUsername ? 'Updating...' : 'Update Username'}
                    </Button>
                  </Flex>
                </Box>
              </form>
            </Flex>
          </Card>

      
        </Box>
      </Card>

      {/* Workspace Settings Section */}
      <Card size="3" style={{ background: 'white' }}>
        <Box p="6">
          <Heading as="h2" size="5" mb="4" weight="medium">
            Workspace Settings
          </Heading>
          <Text as="p" size="2" color="gray" mb="6">
            Manage your workspace settings and team members
          </Text>

          <Card variant="surface" style={{ background: 'var(--gray-2)' }} className="p-8">
            <Flex direction="column" gap="6">
              {/* Workspace Info */}
              <Flex direction="column" gap="4">
                <Box>
                  <Flex align="center" gap="4" justify="between">
                    <Flex align="center" gap="4">
                      {/* Workspace Logo */}
                      <Box className="relative">
                        <UploadInput
                          generateUploadUrl={generateUploadUrl}
                          onUploadComplete={handleUpdateWorkspaceLogo}
                          maxFiles={1}
                          accept="image/*"
                          label={
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-input hover:bg-accent/10 transition-colors cursor-pointer">
                              {activeWorkspace?.settings?.logoUrl ? (
                                <img
                                  src={activeWorkspace.settings.logoUrl}
                                  alt={activeWorkspace?.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent-9)] to-[var(--accent-3)]">
                                  <ImageIcon className="h-5 w-5 text-white" />
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                <UploadIcon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          }
                        />
                        {activeWorkspace?.settings?.logoUrl && (
                          <Button
                            type="button"
                            size="1"
                            variant="soft"
                            className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={handleRemoveWorkspaceLogo}
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        )}
                      </Box>

                      {/* Workspace Name and Users Count */}
                      <Flex direction="column" gap="1">
                        {isEditingName ? (
                          <Box>
                            <input
                              value={workspaceName}
                              onChange={(e) => setWorkspaceName(e.target.value)}
                              placeholder="Workspace name"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateWorkspaceName();
                                }
                                if (e.key === 'Escape') {
                                  setIsEditingName(false);
                                  setWorkspaceName(activeWorkspace?.name || "");
                                }
                              }}
                              onBlur={() => {
                                if (workspaceName !== activeWorkspace?.name) {
                                  handleUpdateWorkspaceName();
                                } else {
                                  setIsEditingName(false);
                                }
                              }}
                              autoFocus
                            />
                          </Box>
                        ) : (
                          <Text size="3" weight="medium" className="cursor-pointer" onClick={() => {
                            setIsEditingName(true);
                            setWorkspaceName(activeWorkspace?.name || "");
                          }}>
                            {activeWorkspace?.name || "Personal Workspace"}
                          </Text>
                        )}
                        <Flex gap="2" align="center">
                          <Badge color="green" className="rounded-md">
                            <Text size="1" weight="medium">
                              {activeWorkspace?.type || 'personal'}
                            </Text>
                          </Badge>
                        </Flex>
                      </Flex>
                    </Flex>

                    {/* Edit/Delete Buttons */}
                    <Flex gap="2" className="ml-auto">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (isEditingName && workspaceName !== activeWorkspace?.name) {
                            handleUpdateWorkspaceName();
                          }
                          setIsEditingName(!isEditingName);
                          setWorkspaceName(activeWorkspace?.name || "");
                        }}
                      >
                        {isEditingName ? (
                          <>
                            <CheckIcon className="mr-2 h-4 w-4" />
                            Save
                          </>
                        ) : (
                          <>
                            <Pencil1Icon className="mr-2 h-4 w-4" />
                            Edit
                          </>
                        )}
                      </Button>
                
                    </Flex>
                  </Flex>
                </Box>
                
             
              </Flex>

              <Separator my="3" size="4" />

              {/* Delete Workspace Section - Only show for non-personal workspaces */}
              {workspaces && 
               workspaces.length > 0 && 
               (activeWorkspace?.type || 'personal').toLowerCase() !== 'personal' && (
                <>
                  <Flex justify="between" align="center">
                    <Flex direction="column" gap="1">
                      <Text weight="bold" color="red">Delete Workspace</Text>
                      <Text color="gray" size="2">
                        Permanently delete this workspace and all its data
                      </Text>
                    </Flex>
                    <Button 
                      color="red" 
                      variant="soft"
                      onClick={() => setIsDeleteWorkspaceModalOpen(true)}
                    >
                      <TrashIcon />
                      Delete Workspace
                    </Button>
                  </Flex>
                  <Separator my="3" size="4" />
                </>
              )}

              {/* Members Section */}
              <Box>
                <Flex justify="between" align="center" mb="4">
                  <Box>
                    <Text as="p" size="2" weight="medium">
                      Workspace Members
                    </Text>
                    <Text as="p" size="2" color="gray">
                      People with access to this workspace
                    </Text>
                  </Box>
                  <Button variant="surface" className="gap-1">
                    <PersonIcon />
                    Invite Member
                  </Button>
                </Flex>

                {/* Members Table */}
                <Table.Root variant="surface">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell align="center">Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>
                        <Flex align="center" gap="3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              className="h-8 w-8 rounded-full object-cover"
                              alt={user.username ?? user.email}
                            />
                          ) : (
                            <Box className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent-9)] to-[var(--accent-3)] flex items-center justify-center">
                              <PersonIcon className="h-4 w-4 text-white" />
                            </Box>
                          )}
                          <Text size="2" weight="medium">
                            {user.username || 'Unnamed'}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" color="gray">
                          {user.email}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color="green" size="1">
                          Owner
                        </Badge>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <Button variant="ghost" color="gray" size="1">
                          <GearIcon />
                        </Button>
                      </Table.Cell>
                    </Table.Row>

                    {/* Empty State Row */}
                    <Table.Row>
                      <Table.Cell colSpan={4}>
                        <Flex align="center" justify="center" py="4">
                          <Text size="2" color="gray" align="center">
                            No other members yet
                          </Text>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Box>

             
            </Flex>
          </Card>
        </Box>
      </Card>

      {/* Delete Account Section */}
      <Card size="3" style={{ background: 'white' }}>
        <Box p="6">
          <Heading as="h2" size="5" mb="4" weight="medium" className="text-red-600">
            Delete Account
          </Heading>
          <Text as="p" size="2" color="gray" mb="6">
            Permanently delete your account and all associated data
          </Text>

          {/* Danger Zone */}
          <Card variant="surface" style={{ background: 'var(--red-2)' }} className="p-8">
            <Flex justify="between" align="center">
              <Box>
                <Text as="p" size="2" weight="medium" mb="1">
                  Delete Account
                </Text>
                {user?.subscription?.status && ["active", "incomplete"].includes(user.subscription.status) && !user.subscription.cancelAtPeriodEnd ? (
                  <Flex direction="column" gap="2">
                    <Text as="p" size="2" color="gray" className="mr-12 mb-2">
                      You have an active subscription. To delete your account, you need to unsubscribe first.
                    </Text>
                    <Flex gap="2" align="center">
                      <Box className="inline-flex items-center rounded-full bg-[var(--accent-3)] px-3 py-1">
                        <Text size="1" weight="medium">Active Subscription</Text>
                      </Box>
                      <Button
                        size="2"
                        variant="solid"
                        highContrast
                        color="gray"
                        onClick={() => window.open(unsubscribeHref, '_blank')}
                      >
                        <Flex align="center" gap="1">
                          Manage Subscription
                          <ExternalLinkIcon />
                        </Flex>
                      </Button>
                    </Flex>
                  </Flex>
                ) : (
                  <Text as="p" size="2" color="gray">
                    {t("deleteAccount.description")}
                  </Text>
                )}
              </Box>
              <Button
                size="2"
                color="red"
                variant="solid"
                highContrast
                {...getButtonProps({
                  onClick: doubleCheck ? handleDeleteAccount : undefined,
                })}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                {doubleCheck
                  ? t("deleteAccount.confirmButton")
                  : t("deleteAccount.deleteButton")}
              </Button>
            </Flex>
          </Card>
        </Box>
      </Card>

     
 

      <UnsubscribeWarningModal
        isOpen={isUnsubscribeModalOpen}
        onClose={() => setIsUnsubscribeModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
      <DeleteWorkspaceModal
        isOpen={isDeleteWorkspaceModalOpen}
        setOpen={setIsDeleteWorkspaceModalOpen}
        onWorkspaceDeleted={() => {
          router.push('/');
        }}
      />
    </div>
  );
}