import nodemailer from 'nodemailer';
import { z } from 'zod';

export const contactSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	message: z.string().min(1, 'Message is required')
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
	constructor(public code: string, message: string, public originalError?: any) {
		super(message);
		this.name = 'EmailError';
	}
}

export function createTransporter(config: EmailConfig) {
	return nodemailer.createTransporter({
		host: config.host,
		port: config.port,
		secure: config.secure,
		auth: {
			user: config.user,
			pass: config.password
		}
	});
}

export function createContactEmailOptions(contactData: ContactData, fromEmail: string, toEmail: string) {
	return {
		from: fromEmail,
		to: toEmail,
		subject: `New Contact Form Submission from ${contactData.name}`,
		text: `Name: ${contactData.name}
Email: ${contactData.email}
Message: ${contactData.message}

Sent from: vishalk.com contact form`,
		replyTo: contactData.email
	};
}

export async function sendContactEmail(contactData: ContactData): Promise<{ success: true; message: string }> {
	const config: EmailConfig = {
		host: 'smtp.zoho.com',
		port: 465,
		secure: true,
		user: process.env.ZOHO_EMAIL!,
		password: process.env.ZOHO_PASSWORD!
	};

	// Validate environment variables
	if (!config.user || !config.password) {
		throw new EmailError('CONFIG_ERROR', 'Email configuration is missing');
	}

	try {
		const transporter = createTransporter(config);
		const mailOptions = createContactEmailOptions(contactData, config.user, config.user);
		
		await transporter.sendMail(mailOptions);
		
		return {
			success: true,
			message: 'Message sent successfully!'
		};
	} catch (error: any) {
		console.error('Email sending error:', error);
		
		// Handle specific nodemailer errors
		if (error.code === 'EAUTH') {
			throw new EmailError('EAUTH', 'Email authentication failed');
		} else if (error.code === 'ENOTFOUND') {
			throw new EmailError('ENOTFOUND', 'Email server not found');
		} else if (error.code === 'ECONNECTION') {
			throw new EmailError('ECONNECTION', 'Failed to connect to email server');
		} else if (error.code === 'ETIMEDOUT') {
			throw new EmailError('ETIMEDOUT', 'Email server connection timeout');
		} else {
			throw new EmailError('UNKNOWN', 'Failed to send email', error);
		}
	}
}