/** Privacy policy copy — trust-page body for `/privacy` (SPA + crawler HTML). */

import { CONTACT_EMAIL } from "../contact/content";

export const PRIVACY_TITLE = "Privacy";

export const PRIVACY_LEAD =
  "This privacy notice covers vishalk.com, the personal portfolio of Vishal Kumar. The site is a brochure for hiring conversations, not a consumer app with accounts.";

export const PRIVACY_SECTIONS: readonly { heading: string; body: string }[] = [
  {
    heading: "Who I am",
    body: `I am Vishal Kumar, a senior frontend engineer based in Punjab, India, working remotely. The controller for personal data sent through this site is me, reachable at ${CONTACT_EMAIL}. There is no separate company entity behind the form.`,
  },
  {
    heading: "What I collect",
    body: "The contact form asks for your name, email address, and message so I can reply about roles, collaborations, or questions. I do not create accounts, run a newsletter, or store payment details. Server logs from Cloudflare (IP address, user agent, timestamp, requested path) exist for security and debugging and are retained only as long as the host keeps standard edge logs.",
  },
  {
    heading: "How messages are delivered",
    body: `Form submissions POST to /api/contact on Cloudflare Pages. The function validates the payload and emails me through Resend. Resend processes the contents in order to deliver that email. I read replies in my inbox and do not sell, rent, or broker this information. If you email ${CONTACT_EMAIL} directly, that mail is handled like any other professional correspondence.`,
  },
  {
    heading: "Analytics and cookies",
    body: "If Google Analytics 4 is enabled on a given deploy, GA4 may set cookies or use similar storage to measure aggregate visits. I use that only to understand whether the portfolio is useful, not to build advertising profiles. The theme preference (light, dark, or system) is stored in localStorage on your device and never sent to the contact API. The site does not use advertising pixels.",
  },
  {
    heading: "What I do not do",
    body: "I do not sell personal data. I do not use contact-form contents to train public AI models. I do not run remarketing. Work Case pages describe professional work; they are not a job-application tracker and they do not collect candidate files.",
  },
  {
    heading: "How long I keep it",
    body: `Email stays in my inbox until the conversation is finished or I no longer need it for a hiring process, then I delete or archive it like other work mail. You can ask me to delete a message you sent: email ${CONTACT_EMAIL} with enough detail to find it. I will confirm when it is gone from my mailbox, subject to ordinary backup windows.`,
  },
  {
    heading: "Your choices",
    body: "You can write to me without the form. You can refuse analytics with a tracker blocker. You can request access to or deletion of personal data I hold from a message you sent. This notice is for a personal site; it is not legal advice. If I materially change how contact data is handled, I will update this page.",
  },
];
