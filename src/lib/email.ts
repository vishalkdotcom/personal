import { z } from "zod";
import { Resend } from "resend";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

export type ContactData = z.infer<typeof contactSchema>;

export class EmailError extends Error {
  constructor(
    public code: string,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public originalError?: any,
  ) {
    super(message);
    this.name = "EmailError";
  }
}

function sanitizeText(text: string): string {
  // Basic sanitization to prevent injection attacks
  return text.replace(/[<>\"'&]/g, (match) => {
    switch (match) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#x27;";
      case "&":
        return "&amp;";
      default:
        return match;
    }
  });
}

export function createContactEmailOptions(
  contactData: ContactData,
  fromEmail: string,
  toEmail: string,
) {
  // Sanitize contact data before using in email
  const sanitizedData = {
    name: sanitizeText(contactData.name.trim()),
    email: contactData.email.trim(), // Email is already validated by Zod
    message: sanitizeText(contactData.message.trim()),
  };

  return {
    from: fromEmail,
    to: toEmail,
    subject: `New Contact Form Submission from ${sanitizedData.name}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${sanitizedData.name}</p>
      <p><strong>Email:</strong> ${sanitizedData.email}</p>
      <p><strong>Message:</strong></p>
      <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>Sent from: vishalk.com contact form</em></p>
    `,
    text: `Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Message: ${sanitizedData.message}

Sent from: vishalk.com contact form`,
    reply_to: sanitizedData.email,
  };
}

export async function sendContactEmail(
  contactData: ContactData,
): Promise<{ success: true; message: string }> {
  // Validate environment variables
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "hello@vishalk.com";
  const toEmail = process.env.TO_EMAIL || "hello@vishalk.com";

  if (!resendApiKey) {
    throw new EmailError("CONFIG_ERROR", "Email configuration is missing");
  }

  try {
    const resend = new Resend(resendApiKey);
    
    const mailOptions = createContactEmailOptions(
      contactData,
      fromEmail,
      toEmail,
    );

    const result = await resend.emails.send(mailOptions);

    if (result.error) {
      throw new EmailError("RESEND_ERROR", result.error.message, result.error);
    }

    return {
      success: true,
      message: "Message sent successfully!",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Log error without exposing sensitive information
    console.error("Email sending error:", {
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    // Handle specific Resend errors
    if (error.code === "CONFIG_ERROR") {
      throw error; // Re-throw config errors as-is
    } else if (error.message?.includes("API key")) {
      throw new EmailError("RESEND_AUTH", "Email authentication failed");
    } else if (error.message?.includes("rate limit")) {
      throw new EmailError("RATE_LIMIT", "Too many emails sent. Please try again later.");
    } else if (error.message?.includes("domain")) {
      throw new EmailError("DOMAIN_ERROR", "Email domain configuration error");
    } else {
      throw new EmailError("UNKNOWN", "Failed to send email", error);
    }
  }
}
