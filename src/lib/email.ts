import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

export type ContactData = z.infer<typeof contactSchema>;

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

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
    text: `Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Message: ${sanitizedData.message}

Sent from: vishalk.com contact form`,
    reply: sanitizedData.email,
    replyTo: sanitizedData.email,
  };
}

export async function sendContactEmail(
  contactData: ContactData,
): Promise<{ success: true; message: string }> {
  const config: EmailConfig = {
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    user: process.env.ZOHO_EMAIL!,
    password: process.env.ZOHO_PASSWORD!,
  };

  // Validate environment variables
  if (!config.user || !config.password) {
    throw new EmailError("CONFIG_ERROR", "Email configuration is missing");
  }

  try {
    const mailOptions = createContactEmailOptions(
      contactData,
      config.user,
      config.user,
    );

    if (process.env.NODE_ENV === "development") {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
      });
      await transporter.sendMail(mailOptions);
    } else {
      const { WorkerMailer } = await import("worker-mailer");
      const mailer = await WorkerMailer.connect({
        credentials: {
          username: config.user,
          password: config.password,
        },
        authType: "plain",
        host: config.host,
        port: config.port,
        secure: config.secure,
      });
      await mailer.send(mailOptions);
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

    // Handle specific nodemailer errors
    if (error.code === "EAUTH") {
      throw new EmailError("EAUTH", "Email authentication failed");
    } else if (error.code === "ENOTFOUND") {
      throw new EmailError("ENOTFOUND", "Email server not found");
    } else if (error.code === "ECONNECTION") {
      throw new EmailError("ECONNECTION", "Failed to connect to email server");
    } else if (error.code === "ETIMEDOUT") {
      throw new EmailError("ETIMEDOUT", "Email server connection timeout");
    } else {
      throw new EmailError("UNKNOWN", "Failed to send email", error);
    }
  }
}
