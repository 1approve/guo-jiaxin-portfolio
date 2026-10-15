const array = (value) => Array.isArray(value) ? value : [];

export const normalizeProject = (source = {}) => ({
  id: source.id || '',
  order: Number(source.order || 1),
  number: source.number || String(source.order || 1).padStart(2, '0'),
  status: source.status || 'published',
  category: source.category || '',
  title: source.title || '',
  shortTitle: source.shortTitle || '',
  year: source.year || String(new Date().getFullYear()),
  role: source.role || '',
  tagline: source.tagline || '',
  description: source.description || '',
  poster: source.poster || '',
  cover: source.cover || '',
  heroMediaType: source.heroMediaType || (source.video?.preview ? 'video' : 'image'),
  backgroundMusic: source.backgroundMusic || '',
  video: {
    full: source.video?.full || '',
    preview: source.video?.preview || '',
    duration: source.video?.duration || '',
    label: source.video?.label || '完整作品',
  },
  stats: array(source.stats),
  notesTitle: source.notesTitle || '',
  resumeNotes: array(source.resumeNotes),
  analysis: source.analysis || '',
  abilities: array(source.abilities).map((item) => ({ title: item.title || '', copy: item.copy || '' })),
  process: array(source.process).map((item, index) => ({
    number: item.number || String(index + 1).padStart(2, '0'),
    title: item.title || '',
    summary: item.summary || '',
    improvement: item.improvement || '',
    deliverables: array(item.deliverables),
    evidence: array(item.evidence),
  })),
  gallery: array(source.gallery),
  workArchive: source.workArchive ? {
    title: source.workArchive.title || '',
    description: source.workArchive.description || '',
    files: array(source.workArchive.files).map((item) => ({ file: item.file || '', label: item.label || '' })),
  } : { title: '', description: '', files: [] },
  traceFiles: array(source.traceFiles),
  frameCount: Number(source.frameCount || 0),
  downloads: array(source.downloads).map((item) => ({ label: item.label || '', file: item.file || '' })),
});

export const newProject = (order) => normalizeProject({
  order,
  number: String(order).padStart(2, '0'),
  status: 'draft',
  category: 'AIGC 视频项目',
  title: '未命名项目',
  shortTitle: '未命名项目',
  year: String(new Date().getFullYear()),
  role: '导演 / 生成 / 后期',
  tagline: '用一句话说明这个项目最重要的价值。',
  description: '补充项目背景、目标、你的职责和最终成果。',
  stats: ['项目数据'],
  resumeNotes: ['补充简历中的项目说明。'],
  analysis: '补充你对项目价值、难点与方法的解析。',
  abilities: [{ title: '核心能力', copy: '说明你在项目中解决了什么问题。' }],
  process: [{
    number: '01',
    title: '项目启动',
    summary: '说明这一阶段要解决的问题。',
    improvement: '说明如何通过这一阶段让作品变得更完整。',
    deliverables: ['阶段交付物'],
    evidence: [],
  }],
  gallery: [],
  downloads: [],
});

export const clone = (value) => JSON.parse(JSON.stringify(value));

export const prepareProject = (source, status) => {
  const project = clone({ ...source, status });
  const hasVideo = project.video && Object.values(project.video).some((value) => String(value || '').trim());
  const hasArchive = project.workArchive && (
    project.workArchive.title?.trim()
    || project.workArchive.description?.trim()
    || project.workArchive.files?.length
  );
  if (!hasVideo) delete project.video;
  if (!hasArchive) delete project.workArchive;
  if (!project.backgroundMusic?.trim()) delete project.backgroundMusic;
  if (!project.notesTitle?.trim()) delete project.notesTitle;
  if (!project.traceFiles?.length) delete project.traceFiles;
  if (!project.frameCount) delete project.frameCount;
  return project;
};
