import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';
import { contactSchema, sendContactEmail, EmailError } from '$lib/email';

export const actions: Actions = {
	contact: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			name: formData.get('name'),
			email: formData.get('email'),
			message: formData.get('message')
		};

		try {
			const validatedData = contactSchema.parse(data);
			const result = await sendContactEmail(validatedData);
			return result;
		} catch (error) {
			console.error('Error processing form:', error);

			if (error instanceof z.ZodError) {
				return fail(400, {
					error: true,
					message: 'Invalid form data',
					issues: error.flatten().fieldErrors
				});
			}

			if (error instanceof EmailError) {
				let message = 'Failed to send email. Please try again or contact me directly.';
				
				switch (error.code) {
					case 'CONFIG_ERROR':
						message = 'Email service is temporarily unavailable. Please contact me directly.';
						break;
					case 'EAUTH':
						message = 'Email service authentication failed. Please contact me directly.';
						break;
					case 'ENOTFOUND':
					case 'ECONNECTION':
					case 'ETIMEDOUT':
						message = 'Email service is currently unavailable. Please try again later or contact me directly.';
						break;
				}

				return fail(500, {
					error: true,
					message
				});
			}

			return fail(500, {
				error: true,
				message: 'Failed to send email. Please try again or contact me directly.'
			});
		}
	}
};