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
  const [workspaceType, setWorkspaceType] = useState<string>("team");
  const [customType, setCustomType] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const createWorkspace = useMutation(api.workspaces.create);
  const generateUploadUrl = useMutation(api.workspaces.generateUploadUrl);
  const { setActiveWorkspaceId } = useWorkspace();

  const handleUpdateWorkspaceLogo = async (uploaded: UploadFileResponse[]) => {
    if (!uploaded[0]?.response) return;
    
    try {
      const workspace = await createWorkspace({ 
        name,
        logoId: (uploaded[0].response as { storageId: Id<"_storage"> }).storageId,
        type: workspaceType as "team" | "marketing" | "custom",
        ...(workspaceType === 'custom' ? { customType } : {}),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error("Please enter a workspace name");
      return;
    }

    if (workspaceType === 'custom' && !customType) {
      toast.error("Please enter a custom type");
      return;
    }

    try {
      const workspace = await createWorkspace({ 
        name,
        type: workspaceType as "team" | "marketing" | "custom",
        ...(workspaceType === 'custom' ? { customType } : {}),
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
      <Dialog.Content style={{ maxWidth: 450 }}>
        <div className="relative overflow-hidden rounded-t-lg -mx-5 -mt-5 p-5 mb-5">
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
          <Dialog.Title className="text-2xl font-semibold relative z-10">
            Create New Workspace
          </Dialog.Title>
          <Dialog.Description size="2" color="gray" className="relative z-10">
            Create a new workspace to organize your projects and collaborate with others.
          </Dialog.Description>
        </div>

        <Form.Root 
          onSubmit={handleSubmit}
          // Prevent the browser confirmation dialog
          data-no-unload-prompt="true"
        >
          <Flex direction="column" gap="4">
            <Box>
              <Form.Field className="grid" name="workspace-name">
                <div className="flex items-baseline justify-between">
                  <Form.Label className="text-[15px] font-medium leading-[35px]">
                    Workspace Name
                  </Form.Label>
                  <Form.Message className="text-[13px] opacity-80" match="valueMissing">
                    Please enter a workspace name
                  </Form.Message>
                </div>
                <Form.Control asChild>
                  <Input
                    id="workspace-name"
                    placeholder="Enter workspace name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Control>
              </Form.Field>
            </Box>

            <Box>
              <Form.Field className="grid" name="workspace-type">
                <div className="flex items-baseline justify-between">
                  <Form.Label className="text-[15px] font-medium leading-[35px]">
                    Workspace Type
                  </Form.Label>
                </div>
                <Flex direction="column" gap="2">
                  <Select.Root value={workspaceType} onValueChange={setWorkspaceType}>
                    <Select.Trigger id="workspace-type" />
                    <Select.Content position="popper">
                      <Select.Group>
                        <Select.Label>Select Type</Select.Label>
                        <Select.Item value="team">Team Workspace</Select.Item>
                        <Select.Item value="marketing">Marketing Workspace</Select.Item>
                        <Select.Item value="custom">Create Custom Type...</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                  {workspaceType === 'custom' && (
                    <Form.Field className="grid" name="custom-type">
                      <Form.Control asChild>
                        <Input
                          placeholder="Enter custom type"
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          required={workspaceType === 'custom'}
                        />
                      </Form.Control>
                    </Form.Field>
                  )}
                </Flex>
              </Form.Field>
            </Box>

            <Flex direction="column" gap="2">
              <Text weight="medium" size="2">Workspace Logo</Text>
              <UploadInput
                generateUploadUrl={generateUploadUrl}
                onUploadComplete={handleUpdateWorkspaceLogo}
                maxFiles={1}
                label="Upload Logo"
              />
              <Text size="1" color="gray">
                Recommended: Square image, max 5MB
              </Text>
            </Flex>

          </Flex>

          <Flex gap="3" mt="6" justify="end">
            <Form.Submit asChild>
              <Button 
                type="submit"
                disabled={!name}
                variant="solid"
              >
                Create Workspace
              </Button>
            </Form.Submit>
          </Flex>
        </Form.Root>

        <Dialog.Close>
          <Button
            variant="ghost"
            size="1"
            color="gray"
            style={{ position: 'absolute', right: 16, top: 16 }}
          >
            <Cross2Icon />
          </Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}
