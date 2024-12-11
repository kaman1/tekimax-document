import { GoogleSignin } from "@/components/google-signin";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { Logo } from "@v1/ui/logo";
import { cn } from "@v1/ui/utils";
import Image from "next/image";
import { Box, Text, Heading } from '@radix-ui/themes';

export const metadata = {
  title: "Login",
};

export default function Page() {
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

      {/* Center login card for small screens */}
      <div className="lg:hidden w-full h-full flex items-center justify-center p-6 relative z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md relative">
          <div className="space-y-8">
            <div>
              <Heading 
                as="h1" 
                size="7" 
                weight="bold" 
                mb="2"
                className="text-primary"
              >
                <Image
                  src="https://industrious-narwhal-216.convex.cloud/api/storage/b81dbd4b-cf62-4422-8381-cf8ee09adcf8"
                  alt="logo"
                  className="w-100 mb-6"
                  width={200}
                  height={200}
                />
              </Heading>
              <Text as="p" size="3" className="text-primary/60 max-w-[300px]">
                Seamlessly organize, collaborate, and manage your documents in one place
              </Text>
            </div>
            <div>
              <GoogleSignin />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image with animated grid */}
      <div className="hidden lg:block w-[90%] h-screen relative bg-gradient-to-br from-amber-50 to-amber-50 dark:from-amber-50 dark:to-amber-50 overflow-hidden">
        {/* Login card */}
        <div className="absolute top-1/2 left-16 -translate-y-1/2 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-md relative">
            <div className="space-y-8">
              <div>
                <Heading 
                  as="h1" 
                  size="7" 
                  weight="bold" 
                  mb="2"
                  className="text-primary"
                >
                  <Image
                    src="https://industrious-narwhal-216.convex.cloud/api/storage/b81dbd4b-cf62-4422-8381-cf8ee09adcf8"
                    alt="logo"
                    className="w-100 mb-6"
                    width={200}
                    height={200}
                  />
                </Heading>
                <Text as="p" size="3" className="text-primary/60 max-w-[300px]">
                  Seamlessly organize, collaborate, and manage your documents in one place
                </Text>
              </div>
              <div>
                <GoogleSignin />
              </div>
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

      {/* Background elements */}
      <div className="base-grid fixed h-screen w-screen opacity-40" />
      <div className="fixed bottom-0 h-screen w-screen bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
    </div>
  );
}
