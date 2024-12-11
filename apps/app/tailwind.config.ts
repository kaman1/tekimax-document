import baseConfig from "@v1/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle, #E5D9B6 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-size': '20px 20px',
      },
    },
  },
} satisfies Config;
