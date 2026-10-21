export interface Skill {
  name: string;
  level: number;
}

export interface SkillGroup {
  category: string;
  icon: string;
  accent: string;
  skills: Skill[];
}

export interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: 'Frontend',
    icon: 'bi-window-desktop',
    accent: '#ff2d95',
    skills: [
      { name: 'HTML', level: 95 },
      { name: 'CSS', level: 92 },
      { name: 'JavaScript', level: 90 },
      { name: 'Bootstrap', level: 88 },
      { name: 'Angular', level: 86 }
    ]
  },
  {
    category: 'Backend',
    icon: 'bi-hdd-stack',
    accent: '#00e5ff',
    skills: [
      { name: 'Java', level: 90 },
      { name: 'Spring Boot', level: 87 }
    ]
  },
  {
    category: 'Databases',
    icon: 'bi-database',
    accent: '#b8ff3c',
    skills: [
      { name: 'SQLite', level: 84 },
      { name: 'PostgreSQL', level: 86 },
      { name: 'Oracle', level: 80 }
    ]
  },
  {
    category: 'Mobile',
    icon: 'bi-phone',
    accent: '#ffb800',
    skills: [
      { name: 'Android', level: 82 },
      { name: 'Flutter', level: 78 }
    ]
  }
];

export const PROJECTS: Project[] = [
  {
    title: 'Nebula Commerce',
    description: 'A high-velocity storefront with real-time inventory, animated product galleries, and a blazing checkout flow.',
    image: 'https://via.placeholder.com/800x520/12081f/ff2d95?text=Nebula+Commerce',
    tags: ['Angular', 'Spring Boot', 'PostgreSQL']
  },
  {
    title: 'Pulse Analytics',
    description: 'An operations dashboard that turns raw telemetry into vivid, actionable insights with live streaming charts.',
    image: 'https://via.placeholder.com/800x520/12081f/00e5ff?text=Pulse+Analytics',
    tags: ['Angular', 'Java', 'Oracle']
  },
  {
    title: 'Lumen Learn',
    description: 'A mobile-first learning platform with offline lessons, progress tracking, and playful micro-interactions.',
    image: 'https://via.placeholder.com/800x520/12081f/b8ff3c?text=Lumen+Learn',
    tags: ['Flutter', 'Spring Boot', 'SQLite']
  },
  {
    title: 'Forge Field',
    description: 'A field-service companion app that syncs work orders, photos, and GPS notes even when the network drops.',
    image: 'https://via.placeholder.com/800x520/12081f/ffb800?text=Forge+Field',
    tags: ['Android', 'Java', 'SQLite']
  }
];
