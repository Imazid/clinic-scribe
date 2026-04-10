import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "Miraa <hello@clinicscribe.ai>";

interface WelcomeEmailParams {
  to: string;
  name: string;
}

function buildWelcomeHtml(name: string): string {
  const greeting = name ? `Hi ${name},` : "Hi there,";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to the Miraa Waitlist</title>
</head>
<body style="margin:0;padding:0;background-color:#fcf9f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1c19;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fcf9f4;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#001736 0%,#002B5B 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
                Miraa
              </h1>
              <p style="margin:8px 0 0;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#a1efff;">
                Medical Insights, Record, Automation and Assistance
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1c1c19;">
                ${greeting}
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#43474f;">
                Thank you for joining the Miraa waitlist. You're now in line for early access to Medical Insights, Record, Automation and Assistance, the clinical workflow copilot that prepares the visit, captures the consult, verifies the note, and closes the loop after care.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:#f6f3ee;border-radius:12px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#001736;">
                      What happens next:
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 12px 4px 0;vertical-align:top;font-size:14px;color:#006876;font-weight:700;">1.</td>
                        <td style="padding:4px 0;font-size:14px;line-height:1.5;color:#43474f;">We'll send you product updates as we get closer to launch.</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 12px 4px 0;vertical-align:top;font-size:14px;color:#006876;font-weight:700;">2.</td>
                        <td style="padding:4px 0;font-size:14px;line-height:1.5;color:#43474f;">When Miraa launches, waitlist members will hear first.</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 12px 4px 0;vertical-align:top;font-size:14px;color:#006876;font-weight:700;">3.</td>
                        <td style="padding:4px 0;font-size:14px;line-height:1.5;color:#43474f;">Every plan will include a 14-day free trial once sign-up opens.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#43474f;">
                In the meantime, you can explore how the workflow works:
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#001736,#002B5B);border-radius:50px;text-align:center;">
                    <a href="https://clinicscribe.ai/product" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      See How It Works &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;font-size:14px;line-height:1.6;color:#43474f;">
                We're building Miraa for clinicians who want to spend more time with patients and less time on paperwork. We'll only email you when there's something worth sharing.
              </p>

              <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#1c1c19;">
                — The Miraa Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f0ede8;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#747780;">
                Miraa &middot; Sydney, Australia
              </p>
              <p style="margin:0;font-size:12px;color:#747780;">
                You received this because you joined the waitlist at
                <a href="https://clinicscribe.ai" style="color:#006876;text-decoration:none;">clinicscribe.ai</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail({
  to,
  name,
}: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping welcome email to",
      to
    );
    return { success: false, error: "Email service not configured." };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "Welcome to the Miraa waitlist",
      html: buildWelcomeHtml(name),
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send welcome email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
