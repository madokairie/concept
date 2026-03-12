import { Project, ChatMessage, MaterialFile } from './types';

const PROJECTS_KEY = 'concept_projects';
const MESSAGES_KEY = 'concept_messages';
const MATERIALS_KEY = 'concept_materials';
const STYLE_KEY = 'concept_default_style';

// Projects
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getProject(id: string): Project | undefined {
  return getProjects().find(p => p.id === id);
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    projects.push(project);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  // Also delete messages
  const allMessages = getAllMessages();
  delete allMessages[id];
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
}

// Messages (per project)
function getAllMessages(): Record<string, ChatMessage[]> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(MESSAGES_KEY);
  return data ? JSON.parse(data) : {};
}

export function getMessages(projectId: string): ChatMessage[] {
  return getAllMessages()[projectId] || [];
}

export function saveMessage(projectId: string, message: ChatMessage): void {
  const all = getAllMessages();
  if (!all[projectId]) all[projectId] = [];
  all[projectId].push(message);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
}

// Materials
export function getMaterials(): MaterialFile[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(MATERIALS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMaterial(material: MaterialFile): void {
  const materials = getMaterials();
  materials.push(material);
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
}

export function deleteMaterial(id: string): void {
  const materials = getMaterials().filter(m => m.id !== id);
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
}

export function updateMaterial(id: string, updates: Partial<MaterialFile>): void {
  const materials = getMaterials();
  const index = materials.findIndex(m => m.id === id);
  if (index >= 0) {
    materials[index] = { ...materials[index], ...updates };
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
  }
}

// Duplicate project
export function duplicateProject(sourceId: string, newName: string): Project | null {
  const source = getProject(sourceId);
  if (!source) return null;

  const newProject: Project = {
    ...source,
    id: crypto.randomUUID(),
    name: newName,
    status: 'designing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    results: undefined,
  };
  saveProject(newProject);
  return newProject;
}

// Update phase data
export function updatePhaseData(projectId: string, phaseKey: string, dataKey: string, value: string): void {
  const project = getProject(projectId);
  if (!project) return;
  const phase = project.phases[phaseKey as keyof typeof project.phases];
  if (!phase) return;
  if (value === '') {
    delete phase.data[dataKey];
  } else {
    phase.data[dataKey] = value;
  }
  saveProject(project);
}

// Save launch results
export function saveResults(projectId: string, results: { listCount: number; applicationCount: number; revenue: number }): void {
  const project = getProject(projectId);
  if (!project) return;
  project.results = {
    ...results,
    cvr: results.listCount > 0 ? (results.applicationCount / results.listCount) * 100 : 0,
    recordedAt: new Date().toISOString(),
  };
  project.status = 'result_recorded';
  saveProject(project);
}

// Update project status
export function updateProjectStatus(projectId: string, status: Project['status']): void {
  const project = getProject(projectId);
  if (!project) return;
  project.status = status;
  saveProject(project);
}

// Default style
export function getDefaultStyle(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STYLE_KEY) || '';
}

export function saveDefaultStyle(style: string): void {
  localStorage.setItem(STYLE_KEY, style);
}
