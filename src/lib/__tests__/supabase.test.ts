import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock createClient from supabase
const mockClient = { from: vi.fn() };
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockClient),
}));

describe("createServerClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module to clear the singleton
    vi.resetModules();
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");

    const { createServerClient } = await import("@/lib/supabase");
    expect(() => createServerClient()).toThrow(
      "Supabase environment variables not set"
    );
  });

  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const { createServerClient } = await import("@/lib/supabase");
    expect(() => createServerClient()).toThrow(
      "Supabase environment variables not set"
    );
  });

  it("creates client with correct env vars", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");

    const { createClient } = await import("@supabase/supabase-js");
    const { createServerClient } = await import("@/lib/supabase");

    createServerClient();

    expect(createClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-service-key"
    );
  });

  it("returns singleton on subsequent calls", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");

    const { createClient } = await import("@supabase/supabase-js");
    const { createServerClient } = await import("@/lib/supabase");

    const client1 = createServerClient();
    const client2 = createServerClient();

    expect(client1).toBe(client2);
    expect(createClient).toHaveBeenCalledTimes(1);
  });
});
