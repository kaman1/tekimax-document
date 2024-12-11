import { Dialog, Flex, Text, Button, Box } from "@radix-ui/themes";
import { api } from "@v1/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useWorkspace } from "@/contexts/workspace-context";
import { toast } from "sonner";
import { InfoCircledIcon } from "@radix-ui/react-icons";

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

  const handleDelete = async () => {
    if (!activeWorkspace || activeWorkspace.type === 'personal') return;

    try {
      await deleteWorkspace({ id: activeWorkspace._id });
      setActiveWorkspaceId(null); // Reset to personal workspace
      onWorkspaceDeleted?.();
      setOpen(false);
      toast.success("Workspace deleted successfully");
    } catch (error) {
      toast.error("Failed to delete workspace");
      console.error("Error deleting workspace:", error);
    }
  };

  if (!activeWorkspace) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
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
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </Flex>
          </>
        ) : (
          <>
            <Dialog.Description size="2" mb="4">
              Are you sure you want to delete the workspace "{activeWorkspace.name}"? This action cannot be undone.
            </Dialog.Description>
            <Flex gap="3" mt="4" justify="end">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="red"
                onClick={handleDelete}
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
