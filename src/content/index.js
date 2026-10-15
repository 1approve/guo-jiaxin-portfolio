const modules = import.meta.glob('./projects/*.json', { eager: true, import: 'default' });

export const allProjects = Object.values(modules).sort((a, b) => a.order - b.order);

export const projects = allProjects.filter((project) => project.status !== 'draft');

export const projectById = Object.fromEntries(projects.map((project) => [project.id, project]));

export const portfolioAsset = (path) => `./assets/portfolio/${path}`;

export const documentAsset = (path) => `./assets/documents/${path}`;

