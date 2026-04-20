import { Resend } from "resend";
import { BRAND } from "@/lib/constants";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "Miraa <onboarding@miraahealth.com>";

interface WelcomeEmailParams {
  to: string;
  name: string;
}

interface ContactEmailParams {
  name: string;
  email: string;
  clinic?: string;
  topic?: string;
  message: string;
  source?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
            <td style="background:linear-gradient(135deg,#1F1A14 0%,#3A2E22 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
                Miraa
              </h1>
              <p style="margin:8px 0 0;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#C8DCEA;">
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
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1F1A14;">
                      What happens next:
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 12px 4px 0;vertical-align:top;font-size:14px;color:#2F5A7A;font-weight:700;">1.</td>
                        <td style="padding:4px 0;font-size:14px;line-height:1.5;color:#43474f;">We'll send you product updates as we get closer to launch.</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 12px 4px 0;vertical-align:top;font-size:14px;color:#2F5A7A;font-weight:700;">2.</td>
                        <td style="padding:4px 0;font-size:14px;line-height:1.5;color:#43474f;">When Miraa launches, waitlist members will hear first.</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 12px 4px 0;vertical-align:top;font-size:14px;color:#2F5A7A;font-weight:700;">3.</td>
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
                  <td style="background:linear-gradient(135deg,#1F1A14,#3A2E22);border-radius:50px;text-align:center;">
                    <a href="https://miraahealth.com/product" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
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
                <a href="https://miraahealth.com" style="color:#2F5A7A;text-decoration:none;">miraahealth.com</a>.
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
      const e = error as Record<string, unknown>;
      console.error(`[email] status=${e.statusCode}`);
      console.error(`[email] name=${e.name}`);
      console.error(`[email] msg=${e.message}`);
      return { success: false, error: error.message };
    }

    console.log(`[email] Welcome email sent to ${to}`);
    return { success: true };
  } catch (err) {
    console.error(`[email] Failed to send welcome email: ${err instanceof Error ? err.message : String(err)}`);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function buildContactHtml({
  name,
  email,
  clinic,
  topic,
  message,
  source,
}: ContactEmailParams): string {
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Miraa Contact Form Submission</title>
</head>
<body style="margin:0;padding:24px;background-color:#fcf9f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1c19;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#1F1A14 0%,#3A2E22 100%);padding:28px 32px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C8DCEA;">
                New contact enquiry
              </p>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">
                ${BRAND.name} website form
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#747780;width:160px;">Name</td>
                  <td style="padding:8px 0;font-size:14px;color:#1c1c19;font-weight:600;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#747780;">Email</td>
                  <td style="padding:8px 0;font-size:14px;color:#1c1c19;font-weight:600;">${escapeHtml(email)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#747780;">Clinic / Practice</td>
                  <td style="padding:8px 0;font-size:14px;color:#1c1c19;font-weight:600;">${escapeHtml(clinic || "Not provided")}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#747780;">Topic</td>
                  <td style="padding:8px 0;font-size:14px;color:#1c1c19;font-weight:600;">${escapeHtml(topic || "General enquiry")}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#747780;">Source</td>
                  <td style="padding:8px 0;font-size:14px;color:#1c1c19;font-weight:600;">${escapeHtml(source || "website")}</td>
                </tr>
              </table>

              <div style="background-color:#f6f3ee;border-radius:12px;padding:24px;">
                <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1F1A14;">Message</p>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#43474f;">${safeMessage}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendContactEmail({
  name,
  email,
  clinic,
  topic,
  message,
  source,
}: ContactEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping contact email notification for",
      email
    );
    return { success: false, error: "Email service not configured." };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: BRAND.supportEmail,
      replyTo: email,
      subject: topic
        ? `New Miraa contact form enquiry: ${topic}`
        : "New Miraa contact form enquiry",
      html: buildContactHtml({
        name,
        email,
        clinic,
        topic,
        message,
        source,
      }),
    });

    if (error) {
      console.error(`[email] Resend contact error: ${error.name} - ${error.message}`);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error(`[email] Failed to send contact email: ${err instanceof Error ? err.message : String(err)}`);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
