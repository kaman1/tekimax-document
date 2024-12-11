import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v1/ui/select";
import { toast } from "sonner";
import { AnimatedGridPattern } from "./magicui/animated-grid-pattern";
import { Flex, Text, Heading, Card } from "@radix-ui/themes";
import { cn } from "@v1/ui/utils";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !role) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsInviting(true);
      
      // Create new invited user
      const newUser: InvitedUser = {
        name,
        email,
        role,
        status: "pending"
      };
      
      onUserInvited(newUser);
      setOpen(false);
      toast.success("User invited successfully");
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Content className="max-w-md">
        <div className="relative overflow-hidden">
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

          <Dialog.Title className="mb-2">
            <Heading as="h2" size="5" weight="medium">
              Invite Team Member
            </Heading>
            <Text as="p" size="2" color="gray" className="mt-1">
              Add new members to collaborate in your workspace
            </Text>
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="mt-6">
            <Card variant="surface" style={{ background: 'var(--gray-2)' }} className="p-6">
              <Flex direction="column" gap="6">
                <div>
                  <Text as="label" size="2" weight="medium" className="text-gray-700 block mb-2">
                    Name
                  </Text>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter member's name"
                    required
                    className="w-full bg-white border-gray-200 focus:border-[#D8D0BF] focus:ring-[#D8D0BF]"
                  />
                </div>

                <div>
                  <Text as="label" size="2" weight="medium" className="text-gray-700 block mb-2">
                    Email
                  </Text>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter member's email"
                    required
                    className="w-full bg-white border-gray-200 focus:border-[#D8D0BF] focus:ring-[#D8D0BF]"
                  />
                </div>

                <div>
                  <Text as="label" size="2" weight="medium" className="text-gray-700 block mb-2">
                    Role
                  </Text>
                  <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                    <SelectTrigger className="w-full bg-white border-gray-200 focus:border-[#D8D0BF] focus:ring-[#D8D0BF]">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Viewer</SelectItem>
                      <SelectItem value="write">Editor</SelectItem>
                      <SelectItem value="owner">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Flex>
            </Card>

            <Flex gap="3" mt="6" justify="end">
              <Button
                variant="soft"
                onClick={() => setOpen(false)}
                className="text-[#D8D0BF] hover:bg-[#D8D0BF]/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInviting}
                className="bg-[#D8D0BF] text-white hover:bg-[#C4BCAC] transition-colors"
              >
                {isInviting ? "Inviting..." : "Send Invitation"}
              </Button>
            </Flex>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
