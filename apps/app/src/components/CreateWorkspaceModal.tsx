import {
  Dialog,
  Flex,
  Text,
  Button,
  Box,
  Select,
} from "@radix-ui/themes";
import { useState, useCallback } from 'react';
import { useMutation } from "convex/react";
import { useWorkspace } from "@/contexts/workspace-context";
import { ImageIcon, UploadIcon, Cross2Icon } from '@radix-ui/react-icons';
import type { UploadFileResponse } from "@xixixao/uploadstuff/react";
import { styled } from '@stitches/react';
import { AnimatedGridPattern } from "./magicui/animated-grid-pattern";
import * as Form from "@radix-ui/react-form";
import { useImageUpload } from "@/hooks/use-image-upload";
import { CircleUserRound } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { api } from "@v1/backend/convex/_generated/api";
import { cn } from "@v1/ui/utils";
import { Input } from "@v1/ui/input";
import { UploadInput } from "@v1/ui/upload-input";
import { Avatar } from "@v1/ui/avatar";

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
  const createWorkspace = useMutation(api.workspaces.create);
  const generateUploadUrl = useMutation(api.workspaces.generateUploadUrl);
  const { setActiveWorkspaceId } = useWorkspace();

  const handleLogoUpload = async (uploaded: UploadFileResponse[]) => {
    if (!uploaded[0]?.response) {
      toast.error("Failed to upload logo");
      return;
    }
    
    try {
      const storageId = (uploaded[0].response as { storageId: string }).storageId;
      // Get the URL from the upload response
      const logoUrl = uploaded[0].url;
      console.log('Upload response:', { storageId, logoUrl }); // Debug log
      
      if (!logoUrl) {
        throw new Error('No URL in upload response');
      }

      // Set both the ID and preview URL
      setLogoId(storageId);
      setLogoPreview(logoUrl);
      
      // Show success message
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error handling logo upload:", error);
      toast.error("Failed to process logo upload");
      // Reset the state on error
      setLogoId(null);
      setLogoPreview(null);
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
      // Create workspace with logo if available
      const workspace = await createWorkspace({ 
        name,
        type: "custom",
        settings: logoId ? {
          logoId,
          logoUrl: logoPreview || undefined,
        } : undefined,
      });
      
      setActiveWorkspaceId(workspace._id);
      onWorkspaceCreated?.(workspace);
      setOpen(false);
      toast.success("Workspace created successfully!");
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Content className="max-w-2xl">
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
              {/* Logo Upload */}
              <div className="flex-shrink-0">
                <Text size="2" weight="medium" mb="2">Workspace Logo</Text>
                {logoPreview ? (
                  <div className="relative">
                    <Avatar
                      size="6"
                      src={logoPreview}
                      fallback={<ImageIcon className="h-8 w-8 text-gray-600" />}
                      className="border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="soft"
                      color="red"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 shadow-sm hover:bg-red-600 hover:text-white transition-colors"
                      onClick={handleRemoveLogo}
                    >
                      <Cross2Icon className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Avatar
                      size="6"
                      fallback={
                        <div className="h-full w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                          <ImageIcon className="h-8 w-8 text-gray-600" />
                        </div>
                      }
                      className="border-2 border-gray-200"
                    >
                      <UploadInput
                        generateUploadUrl={generateUploadUrl}
                        onUploadComplete={handleLogoUpload}
                        maxFiles={1}
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Avatar>
                    <Text size="1" color="gray" align="center" mt="1">
                      Click to upload
                    </Text>
                  </div>
                )}
              </div>

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
                variant="soft" 
                color="gray" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Workspace
              </Button>
            </Flex>
          </Form.Root>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
