import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();
vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

import { sendResultsEmail, sendLeadConfirmationEmail } from "@/lib/email";

describe("email module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ data: { id: "email-123" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test_123");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://positionti.fi");
  });

  it("sends results email with link to analysis", async () => {
    await sendResultsEmail({
      to: "user@example.com",
      analysisId: "abc-123",
      locale: "en",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["user@example.com"],
        subject: expect.stringContaining("positioning"),
      })
    );

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("abc-123");
    expect(callArgs.html).toContain("positionti.fi");
  });

  it("sends Finnish email when locale is fi", async () => {
    await sendResultsEmail({
      to: "user@example.com",
      analysisId: "abc-123",
      locale: "fi",
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.subject.toLowerCase()).toContain("positiointi");
  });

  it("sends confirmation email without analysis link", async () => {
    await sendLeadConfirmationEmail({
      to: "user@example.com",
      locale: "en",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["user@example.com"],
      })
    );
  });

  it("does not throw when RESEND_API_KEY is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    await expect(
      sendResultsEmail({
        to: "user@example.com",
        analysisId: "abc-123",
        locale: "en",
      })
    ).resolves.not.toThrow();
  });
});
