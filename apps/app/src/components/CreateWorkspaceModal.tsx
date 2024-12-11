import {
  Dialog,
  Flex,
  Text,
  Button,
  Box,
} from "@radix-ui/themes";
import { useState, useCallback } from 'react';
import { useMutation } from "convex/react";
import { useWorkspace } from "@/contexts/workspace-context";
import { ImageIcon, UploadIcon, TrashIcon } from '@radix-ui/react-icons';
import type { UploadFileResponse } from "@xixixao/uploadstuff/react";
import { styled } from '@stitches/react';
import { AnimatedGridPattern } from "./magicui/animated-grid-pattern";
import * as Form from "@radix-ui/react-form";
import { toast } from "sonner";
import { api } from "@v1/backend/convex/_generated/api";
import { cn } from "@v1/ui/utils";
import { Input } from "@v1/ui/input";
import { UploadInput } from "@v1/ui/upload-input";

const StyledUploadArea = styled('div', {
  border: '2px dashed var(--gray-6)',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: 'var(--gray-8)',
    backgroundColor: 'var(--gray-2)',
  },
});

export function CreateWorkspaceModal({
  isOpen,
  setOpen,
  onWorkspaceCreated,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onWorkspaceCreated?: (workspace: any) => void;
}) {
  const [name, setName] = useState("");
  const [logoId, setLogoId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const createWorkspace = useMutation(api.workspaces.create);
  const generateUploadUrl = useMutation(api.workspaces.generateUploadUrl);
  const { setActiveWorkspaceId } = useWorkspace();

  const handleLogoUpload = async (uploaded: UploadFileResponse[]) => {
    if (!uploaded[0]?.response) {
      toast.error("Failed to upload logo");
      return;
    }
    
    try {
      setIsUploadingLogo(true);
      const storageId = (uploaded[0].response as { storageId: Id<"_storage"> }).storageId;
      console.log('Upload response:', { storageId, uploaded }); // Debug log
      
      // Set the preview immediately for better UX
      const fileUrl = URL.createObjectURL(uploaded[0].response.file);
      setLogoPreview(fileUrl);
      
      // Set the actual logo ID after successful upload
      setLogoId(storageId);
      
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error handling logo upload:", error);
      toast.error("Failed to process logo upload");
      setLogoId(null);
      setLogoPreview(null);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoId(null);
    setLogoPreview(null);
    toast.success("Logo removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error("Please enter a workspace name");
      return;
    }

    try {
      setIsCreating(true);
      const workspace = await createWorkspace({ 
        name,
        type: "custom",
        settings: logoId ? {
          logoId
        } : undefined,
      });
      
      setActiveWorkspaceId(workspace._id);
      onWorkspaceCreated?.(workspace);
      setOpen(false);
      toast.success("Workspace created successfully!");
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Content className="max-w-md">
        <div className="relative">
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
          <Dialog.Title>
            <Text size="5" weight="bold">Create New Workspace</Text>
          </Dialog.Title>

          <Form.Root className="mt-6" onSubmit={handleSubmit}>
            <Flex gap="6" align="start">


              {/* Workspace Name */}
              <div className="flex-grow space-y-1">
                <Text size="2" weight="medium">Workspace Name</Text>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter workspace name"
                  required
                  className="w-full"
                />
                <Text size="1" color="gray">
                  This will be the name of your workspace
                </Text>
              </div>
            </Flex>

            {/* Submit Button */}
            <Flex gap="3" mt="6" justify="end">
              <Button 
                variant="surface" 
                color="gray" 
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isCreating || isUploadingLogo}
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </div>
                ) : (
                  'Create Workspace'
                )}
              </Button>
            </Flex>
          </Form.Root>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
