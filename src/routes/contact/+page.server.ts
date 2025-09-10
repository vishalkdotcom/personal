import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import type { Actions } from './$types';

const contactSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	message: z.string().min(1, 'Message is required')
});

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			name: formData.get('name'),
			email: formData.get('email'),
			message: formData.get('message')
		};

		try {
			const validatedData = contactSchema.parse(data);

			const transporter = nodemailer.createTransporter({
				host: 'smtp.zoho.com',
				port: 465,
				secure: true,
				auth: {
					user: process.env.ZOHO_EMAIL,
					pass: process.env.ZOHO_PASSWORD
				}
			});

			const mailOptions = {
				from: process.env.ZOHO_EMAIL,
				to: process.env.ZOHO_EMAIL,
				subject: `New Contact Form Submission from ${validatedData.name}`,
				text: `
					Name: ${validatedData.name}
					Email: ${validatedData.email}
					Message: ${validatedData.message}
				`,
				replyTo: validatedData.email
			};

			await transporter.sendMail(mailOptions);

			return {
				success: true,
				message: 'Message sent successfully!'
			};
		} catch (error) {
			console.error('Error processing form:', error);

			if (error instanceof z.ZodError) {
				return fail(400, {
					error: true,
					message: 'Invalid form data',
					issues: error.flatten().fieldErrors
				});
			}

			return fail(500, {
				error: true,
				message: 'Failed to send email. Please try again or contact me directly.'
			});
		}
	}
};