export type ProjectInfo = {
  title: string;
  description: string;
  link?: string;
  images: string[];
};

type RawProjectInfo = {
  title: string;
  description: string;
  link?: string;
  images: {
    prefix: string;
    count: number;
  };
};

const rawProjectData: RawProjectInfo[] = [
  {
    title: "Auto-Bot",
    description:
      "Auto-Bot is an AI-powered vehicle maintenance assistant designed to simplify car care. It uses advanced algorithms and expert insights to diagnose issues, provide repair guidance, and enhance overall automotive experience.",
    link: "https://auto-bot.ai/",
    images: {
      prefix: "autobot",
      count: 8,
    },
  },
  {
    title: "JLGS — Construction and Landscaping Services",
    description:
      "Sleek and responsive landing page for JLGS, designed to showcase the their diverse services in Construction, Landscaping, Site Maintenance, and Project Management. The project aim was to enhance JLGS's online presence with clear sections for easy navigation.",
    link: "https://jlgs.ca/",
    images: {
      prefix: "jlgs",
      count: 2,
    },
  },
  {
    title: "Advance Assist",
    description:
      "A cutting-edge AI-powered vehicle diagnostic tool, currently in prototype testing. The project seeks to enhance customer support and drive ecommerce conversions through features like natural language input, predicted diagnoses, and a mechanic locator.",
    images: {
      prefix: "advance-assist",
      count: 12,
    },
  },
  {
    title: "Store Dashboard",
    description:
      "An web application providing insightful store-level performance data and sales forecast. The project aimed to predict yearly sales for individual stores and provide clear comparison of actual vs predicted net sales, enabling stakeholders to analyze performance, identify outliers, and derive actionable insights.",
    images: {
      prefix: "aai-store-dashboard",
      count: 3,
    },
  },
  {
    title: "Measurement Framework",
    description:
      "An interactive web solution designed to empower stakeholders in monitoring key metrics and business performance. The project aimed to facilitate trend analysis and data visualization across various time intervals.",
    images: {
      prefix: "aai-mfdb",
      count: 1,
    },
  },
  {
    title: "Model Deployment Framework",
    description:
      "A responsive platform for hosting machine learning models, designed to facilitate testing and deployment from any device. The project aimed to streamline the process of testing and deploying various machine learning models with an intuitive interface.",
    images: {
      prefix: "aai-mdf",
      count: 5,
    },
  },
];

const rawConceptData: RawProjectInfo[] = [
  {
    title: "DLS",
    description:
      "A labor staffing dashboard designed to effectively plan the work and labor requirements.",
    images: {
      prefix: "concept-dls",
      count: 4,
    },
  },
  {
    title: "Auto Assist",
    description:
      "A vehicle maintenance assistant designed to simplify vehicle issues diagnosis.",
    images: {
      prefix: "concept-auto-assist",
      count: 5,
    },
  },
  {
    title: "FYTV - Find YouTube Videos",
    description: "Lookup YouTube videos using caption search.",
    images: {
      prefix: "concept-fytv",
      count: 1,
    },
  },
  {
    title: "Zajj.music",
    description: "Landing page for a music band.",
    images: {
      prefix: "concept-zajj-music",
      count: 2,
    },
  },
];

export const projects = createProjects(rawProjectData);
export const concepts = createProjects(rawConceptData);

function createProjects(data: RawProjectInfo[]): ProjectInfo[] {
  return data.map(({ title, description, images: { prefix, count } }) => ({
    title,
    description,
    images: createImagePath(prefix, count),
  }));
}

function createImagePath(prefix: string, count: number): string[] {
  return Array.from({ length: count }).map(
    (_, index) => `/images/projects/${prefix}-${index + 1}.png`
  );
}
