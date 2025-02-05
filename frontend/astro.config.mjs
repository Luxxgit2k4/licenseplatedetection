// @ts-check
import { defineConfig } from "astro/config";
import basicSsl from '@vitejs/plugin-basic-ssl';

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), basicSsl()],
    server: {
      https: {
        insecureHTTPParser: true
      }
    }
  },
});
