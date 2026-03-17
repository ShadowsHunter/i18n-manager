// Project data types
export interface Project {
  id: string;
  name: string;
  description: string;
  languageCount: number;
  lastUpdated: string;
  status: 'active' | 'archived';
}

// Initial mock data
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'My App',
    description: 'Mobile application for e-commerce platform',
    languageCount: 12,
    lastUpdated: '2 days ago',
    status: 'active',
  },
  {
    id: '2',
    name: 'Dashboard',
    description: 'Internal dashboard for analytics and reporting',
    languageCount: 8,
    lastUpdated: '1 week ago',
    status: 'active',
  },
];
