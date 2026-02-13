// @ts-nocheck
// VLY Integrations Configuration
// See /integrations.md for usage documentation

// This file wraps the @vly-ai/integrations package
// If the package is not available, we provide a mock implementation to prevent build errors

let vly: any;

try {
  // Try to import the real package
  // @ts-ignore
  const integration = require("@vly-ai/integrations");
  vly = integration.vly;
} catch (e) {
  // Mock implementation if package is missing
  console.warn("vly-integrations package not found, using mock implementation");
  vly = {
    ai: {
      completion: async () => ({
        success: false,
        error: "AI integration not available",
      }),
    },
    email: {
      send: async () => ({
        success: false,
        error: "Email integration not available",
      }),
    },
  };
}

export { vly };