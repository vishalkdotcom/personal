import type { LayoutLoad } from './$types';

export const load: LayoutLoad = () => {
	const siteConfig = {
		name: "Vishal Kumar — Frontend Engineer | React.js Enthusiast",
		description: "Explore the portfolio and achievements of Vishal Kumar, a skilled web developer with expertise in React.js. Discover innovative projects and a decade of experience in crafting responsive web solutions.",
		url: "https://vishalk.com",
		title: "Vishal Kumar — Frontend Engineer | React.js Enthusiast",
		keywords: [
			"Web Developer",
			"React.js", 
			"Next.js",
			"TypeScript",
			"JavaScript",
			"Tailwind CSS",
			"Frontend Engineer",
			"AI Integration",
			"Project Portfolio",
			"Responsive Web Solutions",
			"Technical Expertise",
			"User Experience Design",
			"Innovative Web Development",
			"Coding Enthusiast",
			"Punjab India Developer",
		],
		ogImage: `https://vishalk.com/og.png`,
	};

	return {
		siteConfig
	};
};