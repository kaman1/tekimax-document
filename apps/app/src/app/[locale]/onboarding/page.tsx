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
import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { Text } from "@radix-ui/themes";
import { cn } from "@v1/ui/utils";


export default function OnboardingUsername() {
  const user = useQuery(api.users.getUser);
  const updateUsername = useMutation(api.users.updateUsername);
  const router = useRouter();

  const { pending } = useFormStatus();

  const form = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      username: "",
    },
    onSubmit: async ({ value }) => {
      await updateUsername({
        username: value.username,
      });
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    if (user?.username && user?.subscription) {
      router.push("/");
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const showSubscriptionPending = !!user.username;

  if (showSubscriptionPending) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-center text-base font-normal text-primary/60">
          Processing your subscription. This may take a moment...
        </p>
      </div>
    );
  }

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
                form.handleSubmit();
              }}
            >
              <div className="flex w-full flex-col gap-1.5">
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <form.Field
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
                {form.state.errors.username?.map((error) => (
                  <p
                    key={error}
                    className="text-sm font-normal text-destructive"
                  >
                    {error}
                  </p>
                ))}
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
        </div>
      </div>

      {/* Right side with background and form */}
      <div className="hidden lg:block w-[90%] h-screen relative bg-gradient-to-br from-amber-50 to-amber-50 dark:from-amber-50 dark:to-amber-50 overflow-hidden">
        {/* Form card */}
        <div className="absolute top-1/2 left-16 -translate-y-1/2 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-md relative">
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
                  form.handleSubmit();
                }}
              >
                <div className="flex w-full flex-col gap-1.5">
                  <label htmlFor="username" className="sr-only">
                    Username
                  </label>
                  <form.Field
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
                  {form.state.errors.username?.map((error) => (
                    <p
                      key={error}
                      className="text-sm font-normal text-destructive"
                    >
                      {error}
                    </p>
                  ))}
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
          </div>
        </div>

        <Image
          src="https://industrious-narwhal-216.convex.cloud/api/storage/7e398218-e50f-4ce7-ba8d-a0c4fc473def"
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