import { Resend } from "resend";

const FROM_EMAIL = "Positioning Radar <noreply@positionti.fi>";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return null;
  }
  return new Resend(apiKey);
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://positionti.fi";
}

interface SendResultsEmailParams {
  to: string;
  analysisId: string;
  locale?: string;
}

export async function sendResultsEmail({
  to,
  analysisId,
  locale = "en",
}: SendResultsEmailParams): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const baseUrl = getBaseUrl();
  const resultsUrl = `${baseUrl}/${locale}/results/${analysisId}`;

  const isFinish = locale === "fi";

  const subject = isFinish
    ? "Positiointianalyysisi on valmis"
    : "Your positioning analysis is ready";

  const html = isFinish
    ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #18181b; font-size: 24px;">Positiointianalyysisi on valmis! 🎯</h1>
        <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
          Analysoimme verkkosivustosi positioinnin 6 avainelementin kautta. Katso tuloksesi:
        </p>
        <a href="${resultsUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          Katso tulokset →
        </a>
        <p style="color: #a1a1aa; font-size: 13px; margin-top: 32px;">
          Positioning Radar by <a href="https://meom.fi" style="color: #52525b;">MEOM</a>
        </p>
      </div>
    `
    : `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #18181b; font-size: 24px;">Your positioning analysis is ready! 🎯</h1>
        <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
          We've analyzed your website's positioning across 6 key elements. View your results:
        </p>
        <a href="${resultsUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          View results →
        </a>
        <p style="color: #a1a1aa; font-size: 13px; margin-top: 32px;">
          Positioning Radar by <a href="https://meom.fi" style="color: #52525b;">MEOM</a>
        </p>
      </div>
    `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });
  } catch (err) {
    console.error("Failed to send results email:", err);
  }
}

interface SendLeadConfirmationEmailParams {
  to: string;
  locale?: string;
}

export async function sendLeadConfirmationEmail({
  to,
  locale = "en",
}: SendLeadConfirmationEmailParams): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const isFinnish = locale === "fi";

  const subject = isFinnish
    ? "Kiitos — lähetämme tuloksesi pian"
    : "Thanks — we'll send your results soon";

  const html = isFinnish
    ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #18181b; font-size: 24px;">Kiitos! 🎯</h1>
        <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
          Analysoimme parhaillaan verkkosivustoasi. Lähetämme tuloksesi heti kun ne ovat valmiit.
        </p>
        <p style="color: #a1a1aa; font-size: 13px; margin-top: 32px;">
          Positioning Radar by <a href="https://meom.fi" style="color: #52525b;">MEOM</a>
        </p>
      </div>
    `
    : `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #18181b; font-size: 24px;">Thanks! 🎯</h1>
        <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
          We're analyzing your website right now. We'll send you the results as soon as they're ready.
        </p>
        <p style="color: #a1a1aa; font-size: 13px; margin-top: 32px;">
          Positioning Radar by <a href="https://meom.fi" style="color: #52525b;">MEOM</a>
        </p>
      </div>
    `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
  }
}
