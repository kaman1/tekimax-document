'use client';

import { useState } from "react";
import * as Form from "@radix-ui/react-form";
import * as Select from "@radix-ui/react-select";
import * as Avatar from "@radix-ui/react-avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, Plus } from "lucide-react";
import { TextField, Box, Flex, Text, Button, Container, Card, Separator } from "@radix-ui/themes";

const folderTypes = [
  { value: "documents", label: "Documents" },
  { value: "images", label: "Images" },
  { value: "videos", label: "Videos" },
  { value: "projects", label: "Projects" },
  { value: "custom", label: "Custom Type" },
] as const;

const badgeColors = [
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
] as const;

const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(50, "Name too long"),
  type: z.string().min(1, "Folder type is required"),
  customType: z.string().optional(),
  color: z.enum(badgeColors.map(c => c.value) as [string, ...string[]]),
  assignedUsers: z.array(z.string()).min(1, "Assign at least one user"),
});

type CreateFolderForm = z.infer<typeof createFolderSchema>;

export function CreateFolderForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateFolderForm>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      assignedUsers: [],
    },
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCustomType, setShowCustomType] = useState(false);
  const selectedType = watch("type");

  const onSubmit = (data: CreateFolderForm) => {
    const finalData = {
      ...data,
      type: data.type === "custom" ? data.customType! : data.type,
    };
    console.log(finalData);
    // Handle form submission
  };

  return (
    <Container size="2">
      <Card size="2">
        <Form.Root
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Box p="4" className="space-y-6">
            <Box>
              <Text as="label" size="2" weight="medium">
                Folder Name
              </Text>
              <TextField.Root>
                <TextField.Slot
                  {...register("name")}
                  placeholder="Enter folder name"
                  size="2"
                />
              </TextField.Root>
              {errors.name && (
                <Text color="red" size="1">
                  {errors.name.message}
                </Text>
              )}
            </Box>

            <Separator size="4" />

            <Box>
              <Text as="label" size="2" weight="medium">
                Folder Type
              </Text>
              <Flex direction="column" gap="2">
                <Select.Root 
                  onValueChange={(value) => {
                    setValue("type", value);
                    setShowCustomType(value === "custom");
                  }}
                >
                  <Select.Trigger className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background data-[placeholder]:text-muted-foreground outline-none focus:ring-2 focus:ring-gray-8">
                    <Select.Value placeholder="Select folder type" />
                    <Select.Icon>
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Card size="1">
                      <Select.Content className="relative z-50 min-w-[200px] overflow-hidden rounded-md border bg-gray-1 text-gray-12 shadow-md animate-in fade-in-80">
                        <Select.ScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-gray-2">
                          <ChevronUpIcon />
                        </Select.ScrollUpButton>
                        <Select.Viewport className="p-1">
                          {folderTypes.map((type) => (
                            <Select.Item
                              key={type.value}
                              value={type.value}
                              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-4 focus:text-gray-12 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                              <Select.ItemText>{type.label}</Select.ItemText>
                              <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                                <CheckIcon className="h-4 w-4" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                        <Select.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-gray-2">
                          <ChevronDownIcon />
                        </Select.ScrollDownButton>
                      </Select.Content>
                    </Card>
                  </Select.Portal>
                </Select.Root>

                {showCustomType && (
                  <Flex gap="2">
                    <TextField.Root>
                      <TextField.Input
                        {...register("customType")}
                        placeholder="Enter custom type"
                        size="2"
                      />
                    </TextField.Root>
                    <Button 
                      size="2"
                      variant="surface" 
                      onClick={() => {
                        const customType = watch("customType");
                        if (customType) {
                          setValue("type", customType);
                          setShowCustomType(false);
                        }
                      }}
                    >
                      <Plus />
                    </Button>
                  </Flex>
                )}
              </Flex>
              {errors.type && (
                <Text color="red" size="1">
                  {errors.type.message}
                </Text>
              )}
            </Box>

            <Separator size="4" />

            <Box>
              <Text as="label" size="2" weight="medium">
                Badge Color
              </Text>
              <Card size="1" mt="2">
                <Flex gap="2" p="2">
                  {badgeColors.map((color) => (
                    <Button
                      key={color.value}
                      size="1"
                      variant="surface"
                      className={`h-8 w-8 rounded-full ${color.class} ${
                        watch("color") === color.value
                          ? "ring-2 ring-offset-2"
                          : ""
                      }`}
                      onClick={() => setValue("color", color.value)}
                    />
                  ))}
                </Flex>
              </Card>
              {errors.color && (
                <Text color="red" size="1">
                  {errors.color.message}
                </Text>
              )}
            </Box>

            <Separator size="4" />

            <Box>
              <Text as="label" size="2" weight="medium">
                Assign Users
              </Text>
              <Card size="1" mt="2">
                <Flex wrap="wrap" gap="2" p="2">
                  {["User 1", "User 2", "User 3"].map((user) => (
                    <Button
                      key={user}
                      size="2"
                      variant="surface"
                      onClick={() => {
                        const newUsers = selectedUsers.includes(user)
                          ? selectedUsers.filter((u) => u !== user)
                          : [...selectedUsers, user];
                        setSelectedUsers(newUsers);
                        setValue("assignedUsers", newUsers);
                      }}
                      className={selectedUsers.includes(user) ? "bg-gray-4" : ""}
                    >
                      <Avatar.Root className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gray-3">
                        <Avatar.Fallback className="text-sm">
                          {user[0]}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Text size="2">{user}</Text>
                    </Button>
                  ))}
                </Flex>
              </Card>
              {errors.assignedUsers && (
                <Text color="red" size="1">
                  {errors.assignedUsers.message}
                </Text>
              )}
            </Box>

            <Separator size="4" />

            <Flex justify="end">
              <Button type="submit" size="3" variant="solid">
                Create Folder
              </Button>
            </Flex>
          </Box>
        </Form.Root>
      </Card>
    </Container>
  );
}
