
export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  dates: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  dates: string;
  details: string;
}

export interface CustomItem {
  id: string;
  title: string;      // e.g. Project Name, Language Name
  subtitle: string;   // e.g. Role, Proficiency
  date: string;       // e.g. 2023
  description: string;// e.g. Details
}

export interface CustomSection {
  id: string;
  name: string; // The internal type/name
  title: string; // The display title (editable)
  items: CustomItem[];
  isCustom: boolean;
}

export interface CVData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    jobTitle: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  customSections: CustomSection[];
  sectionOrder: string[];
  template: string; // 'standard' | 'modern' | 'executive' | 'minimal'
}

export const INITIAL_CV_DATA: CVData = {
  personal: {
    fullName: "Alex Jordan",
    email: "alex.jordan@example.com",
    phone: "+1 (555) 012-3456",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexjordan",
    website: "alexjordan.dev",
    jobTitle: "Senior Frontend Engineer",
  },
  summary: "Passionate and results-driven Frontend Engineer with over 6 years of experience building scalable web applications. Expert in React, TypeScript, and modern UI/UX principles. Proven track record of optimizing performance and leading cross-functional teams to deliver high-quality software solutions.",
  skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "GraphQL", "UI/UX Design", "AWS", "Performance Optimization"],
  experience: [
    {
      id: "1",
      role: "Senior Frontend Developer",
      company: "TechFlow Solutions",
      location: "San Francisco, CA",
      dates: "2021 - Present",
      description: "• Led the migration of a legacy monolith to a micro-frontend architecture using React and Module Federation.\n• Improved application load time by 40% through code splitting and lazy loading strategies.\n• Mentored a team of 5 junior developers, establishing code quality standards and CI/CD pipelines."
    },
    {
      id: "2",
      role: "Frontend Developer",
      company: "Creative Pulse",
      location: "Austin, TX",
      dates: "2018 - 2021",
      description: "• Developed responsive and accessible user interfaces for over 20 client projects using React and Redux.\n• Collaborated closely with designers to implement pixel-perfect components from Figma prototypes.\n• Integrated RESTful APIs and implemented real-time data visualization features."
    }
  ],
  education: [
    {
      id: "1",
      school: "University of Technology",
      degree: "B.S. Computer Science",
      dates: "2014 - 2018",
      details: "Graduated with Honors (3.9 GPA). Minor in Graphic Design."
    }
  ],
  customSections: [],
  sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills'],
  template: 'standard'
};
