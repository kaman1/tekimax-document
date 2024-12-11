import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v1/ui/select";
import { toast } from "sonner";
import { AnimatedGridPattern } from "./magicui/animated-grid-pattern";
import { Flex, Text, Heading, Card } from "@radix-ui/themes";
import { cn } from "@v1/ui/utils";
import { api } from "@v1/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useWorkspace } from "@/contexts/workspace-context";

export type UserRole = "read" | "write" | "owner";

export interface InvitedUser {
  name: string;
  email: string;
  role: UserRole;
  status: "pending" | "accepted";
}

interface InviteUserModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onUserInvited: (user: InvitedUser) => void;
}

export function InviteUserModal({ isOpen, setOpen, onUserInvited }: InviteUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("read");
  const [isInviting, setIsInviting] = useState(false);
  const createInvite = useMutation(api.invites.create);
  const { activeWorkspace } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !role || !activeWorkspace?._id) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsInviting(true);
      
      const result = await createInvite({
        name,
        email,
        role,
        workspaceId: activeWorkspace._id,
      });

      // Create new invited user from result
      const newUser: InvitedUser = {
        name: result.name,
        email: result.email,
        role: result.role,
        status: result.status,
      };
      
      onUserInvited(newUser);
      setOpen(false);
      toast.success("Invitation sent successfully");
      
      // Reset form
      setName("");
      setEmail("");
      setRole("read");
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlay-show" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-content-show overflow-hidden">
          <form onSubmit={handleSubmit}>
            <Card>
              <Flex direction="column">
                {/* Header with Grid Pattern */}
                <div className="relative h-[140px]">
                  <AnimatedGridPattern
                    className={cn(
                      "absolute inset-0 h-full opacity-10",
                      "[--grid-pattern-color:var(--accent-6)] [--grid-pattern-color-fade:var(--accent-6-fade)]"
                    )}
                  />
                  <div className="relative z-10 flex flex-col justify-center h-full px-8">
                    <Text size="1" mb="1" weight={"bold"} className="text-[#B4925E] font-medium uppercase tracking-wide">
                    Invite Team Member
                    </Text>
                    <Text as="p" size="2" color="gray">
                      Collaborate with your team members in this workspace
                    </Text>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="px-8 py-6 space-y-6">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium block mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="text-sm font-medium block mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="text-sm font-medium block mb-2">
                      Role
                    </label>
                    <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                      <SelectTrigger className="w-full overflow-hidden">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">
                          <div className="py-3">
                            <div className="font-medium text-base">Viewer</div>
                            <div className="text-sm text-gray-500 mt-1">Can view and comment</div>
                          </div>
                        </SelectItem>
                        <SelectItem value="write">
                          <div className="py-3">
                            <div className="font-medium text-base">Editor</div>
                            <div className="text-sm text-gray-500 mt-1">Can edit and share</div>
                          </div>
                        </SelectItem>
                        <SelectItem value="owner">
                          <div className="py-3">
                            <div className="font-medium text-base">Admin</div>
                            <div className="text-sm text-gray-500 mt-1">Full access</div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-[#111111]">
                  <Flex gap="4" justify="end">
                    <Dialog.Close asChild>
                      <Button 
                        size={"sm"}
                        variant="outline" 
                        disabled={isInviting}
                        className="min-w-[100px] mr-5  border-[#B4925E] text-[#B4925E] hover:bg-[#B4925E]/10"
                      >
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button 
                      type="submit" 
                      size={"sm"}
                      disabled={isInviting}
                      className="min-w-[100px] bg-gradient-to-r from-[#B4925E] to-[#8B7355] hover:from-[#8B7355] hover:to-[#B4925E] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInviting ? "Inviting..." : "Send Invite"}
                    </Button>
                  </Flex>
                </div>
              </Flex>
            </Card>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
