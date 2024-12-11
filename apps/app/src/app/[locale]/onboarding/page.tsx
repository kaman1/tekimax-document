"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { api } from "@v1/backend/convex/_generated/api";
import * as validators from "@v1/backend/convex/utils/validators";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { Text } from "@radix-ui/themes";
import { cn } from "@v1/ui/utils";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useQuery(api.users.getUser);
  const workspaces = useQuery(api.workspaces.list);
  const updateUsername = useMutation(api.users.updateUsername);
  const createWorkspace = useMutation(api.workspaces.create);
  const { pending } = useFormStatus();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (user && user.username) {
      setStep(2);
      if (workspaces && workspaces.length > 0) {
        router.push("/");
      }
    }
  }, [user, workspaces, router]);

  // Form for username
  const usernameForm = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      username: user?.username || "",
    },
    onSubmit: async ({ value }) => {
      try {
        await updateUsername({
          username: value.username,
        });
        toast.success('Username set successfully');
        setStep(2);
      } catch (error) {
        console.error("Error updating username:", error);
        toast.error('Failed to set username');
      }
    },
  });

  // Form for workspace
  const workspaceForm = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      name: "",
      type: "workspace" as const,
    },
    onSubmit: async ({ value }) => {
      try {
        await createWorkspace({
          name: value.name,
          type: value.type,
        });
        toast.success('Workspace created successfully');
        router.push("/");
      } catch (error) {
        console.error("Error creating workspace:", error);
        toast.error('Failed to create workspace');
      }
    },
  });

  if (!user) return null;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-2">
              <span className="mb-2 select-none text-6xl">👋</span>
              <h3 className="text-center text-2xl font-medium text-primary">
                Welcome!
              </h3>
              <p className="text-center text-base font-normal text-primary/60">
                Let's get started by choosing a username.
              </p>
            </div>
            <form
              className="flex w-full flex-col items-start gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                usernameForm.handleSubmit();
              }}
            >
              <div className="flex w-full flex-col gap-1.5">
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
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
                      className={`bg-transparent ${
                        field.state.meta?.errors?.length > 0 &&
                        "border-destructive focus-visible:ring-destructive"
                      }`}
                    />
                  )}
                />
              </div>
              <Button
                type="submit"
                className="mt-4 w-full bg-amber-800 hover:bg-amber-700 text-white font-medium"
                disabled={pending}
                loading={pending}
              >
                Continue
              </Button>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-2">
              <span className="mb-2 select-none text-6xl">🚀</span>
              <h3 className="text-center text-2xl font-medium text-primary">
                Create Your Workspace
              </h3>
              <p className="text-center text-base font-normal text-primary/60">
                Set up your first workspace to get started.
              </p>
            </div>
            <form
              className="flex w-full flex-col items-start gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                workspaceForm.handleSubmit();
              }}
            >
              <div className="flex w-full flex-col gap-1.5">
                <label htmlFor="name" className="sr-only">
                  Workspace Name
                </label>
                <workspaceForm.Field
                  name="name"
                  children={(field) => (
                    <Input
                      placeholder="Workspace Name"
                      autoComplete="off"
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-transparent"
                    />
                  )}
                />
              </div>
              <Button
                type="submit"
                className="mt-4 w-full bg-amber-800 hover:bg-amber-700 text-white font-medium"
                disabled={pending}
                loading={pending}
              >
                Create Workspace
              </Button>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex">
      {/* Top right logo */}
      <div className="absolute top-6 right-0 md:top-8 z-10 w-full lg:w-[90%] flex justify-end pr-8">
        <div className="flex items-center justify-center">
          <Image
            src="https://industrious-narwhal-216.convex.cloud/api/storage/8defaf0e-e576-4f1b-8f3e-6c86cd0777e7"
            alt="Icon"
            width={360}
            height={360}
            className="w-[40px] md:w-[60px] h-auto"
          />
        </div>
      </div>

      {/* Center card for small screens */}
      <div className="lg:hidden w-full h-full flex items-center justify-center p-6 relative z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md relative">
          {renderStep()}
        </div>
      </div>

      {/* Right side with background and form */}
      <div className="hidden lg:block w-[90%] h-screen relative bg-gradient-to-br from-amber-50 to-amber-50 dark:from-amber-50 dark:to-amber-50 overflow-hidden">
        {/* Form card */}
        <div className="absolute top-1/2 left-16 -translate-y-1/2 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-md relative">
            {renderStep()}
          </div>
        </div>

        <Image
          src="https://industrious-narwhal-216.convex.cloud/api/storage/f4c858a5-a814-4040-85a6-110e81048952"
          alt="Login hero image"
          fill
          className="object-cover mix-blend-overlay opacity-100"
          priority
        />
        <AnimatedGridPattern
          numSquares={35}
          maxOpacity={0.05}
          duration={4}
          repeatDelay={0}
          className={cn(
            "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-20%] h-[140%]"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/10 to-amber-50/10" />
        
        {/* Quote section */}
        <div className="absolute bottom-8 left-8 max-w-md z-20">
          <Text as="p" size="5" weight="medium" className="text-amber-900/80 italic">
            "TEKIMAX Docs empowers seamless collaboration with our stakeholders and partners."
          </Text>
          <Text as="p" size="2" className="text-amber-800/70 mt-2">
            — Christian K., Founder at TEKIMAX
          </Text>
        </div>
      </div>
    </div>
  );
}