import { Dialog, Flex, Text, Button, Box, TextField } from "@radix-ui/themes";
import { api } from "@v1/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useWorkspace } from "@/contexts/workspace-context";
import { toast } from "sonner";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteWorkspaceModal({
  isOpen,
  setOpen,
  onWorkspaceDeleted,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onWorkspaceDeleted?: () => void;
}) {
  const { activeWorkspace, setActiveWorkspaceId } = useWorkspace();
  const deleteWorkspace = useMutation(api.workspaces.remove);
  const [confirmationText, setConfirmationText] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (!activeWorkspace || activeWorkspace.type === 'personal') return;
    if (confirmationText !== activeWorkspace.name) {
      toast.error("Please type the workspace name correctly to confirm deletion");
      return;
    }

    try {
      await deleteWorkspace({ id: activeWorkspace._id });
      setActiveWorkspaceId(null); // Reset to personal workspace
      setOpen(false);
      setConfirmationText("");
      toast.success("Workspace deleted successfully");
      onWorkspaceDeleted?.();
      router.push("/");
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error("Failed to delete workspace");
    }
  };

  const closeModal = () => {
    setConfirmationText("");
    setOpen(false);
  };

  if (!activeWorkspace) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={closeModal}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Delete Workspace</Dialog.Title>
        {activeWorkspace.type === 'personal' ? (
          <>
            <Box mb="4">
              <Flex gap="2" align="center" mb="2">
                <InfoCircledIcon className="text-[var(--accent-9)]" />
                <Text weight="medium">Personal Workspace Cannot Be Deleted</Text>
              </Flex>
              <Text color="gray" size="2">
                Your personal workspace is tied to your account and cannot be deleted. 
                It will be automatically removed if you delete your account.
              </Text>
            </Box>
            <Flex gap="3" mt="4" justify="end">
              <Button
                variant="soft"
                onClick={closeModal}
              >
                Close
              </Button>
            </Flex>
          </>
        ) : (
          <>
            <Dialog.Description size="2" mb="4">
              This action cannot be undone. This will permanently delete the workspace "{activeWorkspace.name}" and remove all associated data.
            </Dialog.Description>
            
            <Box mb="4">
              <Text as="p" size="2" mb="2" color="gray">
                Please type <Text weight="bold">{activeWorkspace.name}</Text> to confirm deletion:
              </Text>
              <TextField.Input
                placeholder="Type workspace name"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
              />
            </Box>

            <Flex gap="3" mt="4" justify="end">
              <Button
                variant="soft"
                color="gray"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="red"
                onClick={handleDelete}
                disabled={confirmationText !== activeWorkspace.name}
              >
                Delete Workspace
              </Button>
            </Flex>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
