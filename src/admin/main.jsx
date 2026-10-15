import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { deleteProjectFile, getIdentity, loadRemoteProjects, saveProjectFile, uploadAssetFile } from './api.js';
import { clone, newProject, normalizeProject, prepareProject } from './defaults.js';
import './styles.css';

const fallbackModules = import.meta.glob('../content/projects/*.json', { eager: true, import: 'default' });
const demoMode = import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo');
const fallbackRecords = Object.entries(fallbackModules).map(([modulePath, data]) => {
  const filename = modulePath.split('/').pop();
  const path = `src/content/projects/${filename}`;
  return { key: path, path, sha: null, data: normalizeProject(data) };
}).sort((a, b) => a.data.order - b.data.order);

const tabs = [
  ['overview', '项目概览', '基础信息与侧栏文案'],
  ['media', '媒体资源', '封面、海报、视频与音乐'],
  ['abilities', '个人能力', '突出你解决问题的能力'],
  ['workflow', '完整流程', '按阶段说明作品如何完善'],
  ['archive', '成果与留痕', '画廊、工作证据与文档'],
];

const assetUrl = (path, type = 'portfolio') => path
  ? `/assets/${type === 'documents' ? 'documents' : 'portfolio'}/${path}`
  : '';

const pathValue = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
const setPathValue = (object, path, value) => {
  const keys = path.split('.');
  const next = clone(object);
  let target = next;
  keys.slice(0, -1).forEach((key) => {
    if (!target[key] || typeof target[key] !== 'object') target[key] = {};
    target = target[key];
  });
  target[keys.at(-1)] = value;
  return next;
};

const moveItem = (items, index, direction) => {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
};

function Field({ label, hint, value, onChange, multiline = false, type = 'text', placeholder = '' }) {
  const Input = multiline ? 'textarea' : 'input';
  return (
    <label className={`field ${multiline ? 'is-multiline' : ''}`}>
      <span>{label}</span>
      <Input type={multiline ? undefined : type} value={value ?? ''} placeholder={placeholder} onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function Section({ eyebrow, title, description, children, action }) {
  return (
    <section className="editor-section">
      <header>
        <div><small>{eyebrow}</small><h2>{title}</h2>{description && <p>{description}</p>}</div>
        {action}
      </header>
      {children}
    </section>
  );
}

function ItemButtons({ index, length, onMove, onRemove }) {
  return (
    <div className="item-buttons">
      <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label="上移">↑</button>
      <button type="button" disabled={index === length - 1} onClick={() => onMove(1)} aria-label="下移">↓</button>
      <button className="danger-quiet" type="button" onClick={onRemove} aria-label="删除">×</button>
    </div>
  );
}

function StringList({ title, hint, items, onChange, addLabel = '新增一项', multiline = false }) {
  return (
    <div className="list-editor">
      <div className="list-heading"><div><b>{title}</b>{hint && <small>{hint}</small>}</div><button type="button" onClick={() => onChange([...items, ''])}>＋ {addLabel}</button></div>
      {items.length === 0 && <p className="empty-line">暂时没有内容，点击右上角添加。</p>}
      {items.map((item, index) => (
        <div className="list-row" key={`${title}-${index}`}>
          {multiline ? <textarea value={item} onChange={(event) => onChange(items.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} /> : <input value={item} onChange={(event) => onChange(items.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} />}
          <ItemButtons index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
    </div>
  );
}

function MediaField({ label, value, onChange, accept, onUpload, hint, type = 'portfolio' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const path = await onUpload(file, type);
      onChange(path);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };
  const extension = value?.split('.').pop()?.toLowerCase();
  const isVideo = ['mp4', 'webm', 'mov'].includes(extension);
  const isAudio = ['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(extension);
  return (
    <div className="media-field">
      <div className="media-field-copy"><b>{label}</b>{hint && <small>{hint}</small>}</div>
      <div className="media-control">
        <input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder="文件路径或文件名" />
        <label className={uploading ? 'upload-button is-busy' : 'upload-button'}>{uploading ? '上传中…' : '上传文件'}<input type="file" accept={accept} onChange={upload} disabled={uploading} /></label>
      </div>
      {error && <p className="field-error">{error}</p>}
      {value && <div className="asset-preview">{isVideo ? <video src={assetUrl(value, type)} controls preload="metadata" /> : isAudio ? <audio src={assetUrl(value, type)} controls preload="metadata" /> : <img src={assetUrl(value, type)} alt="素材预览" />}</div>}
    </div>
  );
}

function OverviewEditor({ project, setField }) {
  return (
    <>
      <Section eyebrow="01 / PROJECT" title="项目基础信息" description="先把项目定位、职责和一句话主张说清楚，右侧会同步预览。">
        <div className="form-grid cols-4">
          <Field label="项目标识" value={project.id} onChange={(value) => setField('id', value)} hint="英文短名，例如 new-film" />
          <Field label="排序" type="number" value={project.order} onChange={(value) => setField('order', value)} />
          <Field label="编号" value={project.number} onChange={(value) => setField('number', value)} />
          <Field label="年份" value={project.year} onChange={(value) => setField('year', value)} />
        </div>
        <div className="form-grid cols-2">
          <Field label="项目标题" value={project.title} onChange={(value) => setField('title', value)} />
          <Field label="短标题" value={project.shortTitle} onChange={(value) => setField('shortTitle', value)} />
          <Field label="分类" value={project.category} onChange={(value) => setField('category', value)} />
          <Field label="我的职责" value={project.role} onChange={(value) => setField('role', value)} />
        </div>
        <Field label="一句话主张" value={project.tagline} onChange={(value) => setField('tagline', value)} />
        <Field label="项目介绍" multiline value={project.description} onChange={(value) => setField('description', value)} />
      </Section>
      <Section eyebrow="02 / SIDE RAIL" title="侧栏说明与项目解析" description="这些内容会出现在项目页右侧，帮助招聘者快速理解你的贡献。">
        <Field label="侧栏说明标题" value={project.notesTitle} onChange={(value) => setField('notesTitle', value)} placeholder="默认：简历中的项目说明" />
        <StringList title="简历中的项目说明" items={project.resumeNotes} onChange={(value) => setField('resumeNotes', value)} addLabel="新增说明" multiline />
        <Field label="项目解析与补充" multiline value={project.analysis} onChange={(value) => setField('analysis', value)} />
        <StringList title="项目数据标签" hint="建议保留 3–4 个简短数据" items={project.stats} onChange={(value) => setField('stats', value)} addLabel="新增数据" />
      </Section>
    </>
  );
}

function MediaEditor({ project, setField, onUpload }) {
  return (
    <>
      <Section eyebrow="01 / DISPLAY" title="首屏展示方式" description="决定项目卡片与详情页首屏使用静态海报还是动态片段。">
        <div className="segmented">
          <button className={project.heroMediaType === 'image' ? 'active' : ''} type="button" onClick={() => setField('heroMediaType', 'image')}>图片海报</button>
          <button className={project.heroMediaType === 'video' ? 'active' : ''} type="button" onClick={() => setField('heroMediaType', 'video')}>视频片段</button>
        </div>
        <div className="media-stack">
          <MediaField label="项目主海报" value={project.poster} onChange={(value) => setField('poster', value)} accept="image/*" onUpload={onUpload} hint="详情页首屏和视频 Poster" />
          <MediaField label="列表封面" value={project.cover} onChange={(value) => setField('cover', value)} accept="image/*" onUpload={onUpload} hint="首页项目卡片使用" />
        </div>
      </Section>
      <Section eyebrow="02 / FILM" title="完整视频与片花" description="正片和片花分开管理，避免展示时混用。">
        <div className="form-grid cols-2">
          <Field label="视频标题" value={project.video.label} onChange={(value) => setField('video.label', value)} />
          <Field label="视频时长" value={project.video.duration} onChange={(value) => setField('video.duration', value)} placeholder="例如 05:05" />
        </div>
        <div className="media-stack">
          <MediaField label="完整正片" value={project.video.full} onChange={(value) => setField('video.full', value)} accept="video/mp4,video/webm,video/quicktime" onUpload={onUpload} hint="单次后台上传暂限 25 MB；大文件可沿用已有路径" />
          <MediaField label="预览片段 / 片花" value={project.video.preview} onChange={(value) => setField('video.preview', value)} accept="video/mp4,video/webm,video/quicktime" onUpload={onUpload} />
          <MediaField label="可选背景音乐" value={project.backgroundMusic} onChange={(value) => setField('backgroundMusic', value)} accept="audio/*" onUpload={onUpload} hint="设置后将在完整成片区提供独立播放器，不会自动播放" />
        </div>
      </Section>
    </>
  );
}

function AbilitiesEditor({ project, setField }) {
  const update = (index, field, value) => setField('abilities', project.abilities.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  return (
    <Section eyebrow="CAPABILITY FIRST" title="个人能力" description="能力模块位于流程之前。每张卡片都要说明你擅长什么、如何工作、解决了什么问题。" action={<button className="section-add" type="button" onClick={() => setField('abilities', [...project.abilities, { title: '新增能力', copy: '' }])}>＋ 新增能力</button>}>
      <div className="card-editor-grid">
        {project.abilities.map((item, index) => (
          <article className="compact-card" key={`ability-${index}`}>
            <div className="card-index">{String(index + 1).padStart(2, '0')}<ItemButtons index={index} length={project.abilities.length} onMove={(direction) => setField('abilities', moveItem(project.abilities, index, direction))} onRemove={() => setField('abilities', project.abilities.filter((_, itemIndex) => itemIndex !== index))} /></div>
            <Field label="能力标题" value={item.title} onChange={(value) => update(index, 'title', value)} />
            <Field label="能力说明" multiline value={item.copy} onChange={(value) => update(index, 'copy', value)} />
          </article>
        ))}
      </div>
    </Section>
  );
}

function WorkflowEditor({ project, setField }) {
  const update = (index, field, value) => setField('process', project.process.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  return (
    <Section eyebrow="PROCESS" title="完整制作流程" description="按项目真实顺序组织：问题、方法、改进、阶段交付与证据必须对应。" action={<button className="section-add" type="button" onClick={() => setField('process', [...project.process, { number: String(project.process.length + 1).padStart(2, '0'), title: '新增阶段', summary: '', improvement: '', deliverables: [], evidence: [] }])}>＋ 新增流程</button>}>
      <div className="workflow-editor">
        {project.process.map((item, index) => (
          <details open={index === 0} key={`process-${index}`}>
            <summary><span>{item.number}</span><b>{item.title || '未命名阶段'}</b><em>{item.deliverables.length} 项交付 · {item.evidence.length} 份证据</em></summary>
            <div className="workflow-form">
              <div className="workflow-actions"><ItemButtons index={index} length={project.process.length} onMove={(direction) => setField('process', moveItem(project.process, index, direction))} onRemove={() => setField('process', project.process.filter((_, itemIndex) => itemIndex !== index))} /></div>
              <div className="form-grid cols-2"><Field label="步骤编号" value={item.number} onChange={(value) => update(index, 'number', value)} /><Field label="步骤标题" value={item.title} onChange={(value) => update(index, 'title', value)} /></div>
              <Field label="步骤摘要" multiline value={item.summary} onChange={(value) => update(index, 'summary', value)} />
              <Field label="这一步如何完善作品" multiline value={item.improvement} onChange={(value) => update(index, 'improvement', value)} />
              <StringList title="阶段交付" items={item.deliverables} onChange={(value) => update(index, 'deliverables', value)} addLabel="新增交付" />
              <StringList title="流程证据路径" hint="路径相对于 assets/portfolio" items={item.evidence} onChange={(value) => update(index, 'evidence', value)} addLabel="新增证据" />
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}

function ArchiveEditor({ project, setField, onUpload }) {
  const gallery = project.gallery;
  const archive = project.workArchive;
  const updateArchiveFile = (index, field, value) => setField('workArchive.files', archive.files.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const updateDownload = (index, field, value) => setField('downloads', project.downloads.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  return (
    <>
      <Section eyebrow="01 / GALLERY" title="成果画廊" description="管理详情页中的最终作品、设定图与延展成果。" action={<label className="section-add">＋ 上传图片<input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const path = await onUpload(file, 'portfolio'); setField('gallery', [...gallery, path]); event.target.value = ''; }} /></label>}>
        <StringList title="画廊图片路径" items={gallery} onChange={(value) => setField('gallery', value)} addLabel="新增路径" />
        <div className="thumbnail-grid">{gallery.map((image, index) => image && <figure key={`${image}-${index}`}><img src={assetUrl(image)} alt="画廊预览" /><figcaption>{String(index + 1).padStart(2, '0')}</figcaption></figure>)}</div>
      </Section>
      <Section eyebrow="02 / EVIDENCE" title="工作留痕专区" description="独立呈现脚本、拍摄、生成、剪辑和反馈记录，同时作为流程证据。" action={<button className="section-add" type="button" onClick={() => setField('workArchive.files', [...archive.files, { file: '', label: '' }])}>＋ 新增留痕</button>}>
        <Field label="专区标题" value={archive.title} onChange={(value) => setField('workArchive.title', value)} />
        <Field label="专区说明" multiline value={archive.description} onChange={(value) => setField('workArchive.description', value)} />
        <div className="archive-file-list">
          {archive.files.map((item, index) => (
            <article key={`archive-${index}`}>
              <div className="archive-thumb">{item.file ? <img src={assetUrl(item.file)} alt="留痕预览" /> : <span>NO IMAGE</span>}</div>
              <div><Field label="文件路径" value={item.file} onChange={(value) => updateArchiveFile(index, 'file', value)} /><Field label="图片说明" value={item.label} onChange={(value) => updateArchiveFile(index, 'label', value)} /></div>
              <ItemButtons index={index} length={archive.files.length} onMove={(direction) => setField('workArchive.files', moveItem(archive.files, index, direction))} onRemove={() => setField('workArchive.files', archive.files.filter((_, itemIndex) => itemIndex !== index))} />
            </article>
          ))}
        </div>
      </Section>
      <Section eyebrow="03 / DOCUMENTS" title="下载文档" description="上传脚本、分镜、策划案或项目 PDF，供详情页直接下载。" action={<button className="section-add" type="button" onClick={() => setField('downloads', [...project.downloads, { label: '新增文档', file: '' }])}>＋ 新增文档</button>}>
        <div className="download-editor">
          {project.downloads.map((item, index) => (
            <article key={`download-${index}`}>
              <Field label="文档名称" value={item.label} onChange={(value) => updateDownload(index, 'label', value)} />
              <MediaField label="文档文件" value={item.file} onChange={(value) => updateDownload(index, 'file', value)} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onUpload={onUpload} type="documents" />
              <ItemButtons index={index} length={project.downloads.length} onMove={(direction) => setField('downloads', moveItem(project.downloads, index, direction))} onRemove={() => setField('downloads', project.downloads.filter((_, itemIndex) => itemIndex !== index))} />
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

function LivePreview({ project }) {
  const visual = project.poster || project.cover;
  return (
    <aside className="live-preview">
      <div className="preview-label"><span>LIVE PREVIEW</span><i className={project.status === 'draft' ? 'draft' : ''}>{project.status === 'draft' ? '草稿' : '已发布'}</i></div>
      <article>
        <div className="preview-media">
          {project.heroMediaType === 'video' && project.video.preview
            ? <video src={assetUrl(project.video.preview)} poster={assetUrl(project.poster)} autoPlay muted loop playsInline />
            : visual ? <img src={assetUrl(visual)} alt="项目预览" /> : <div className="preview-placeholder">尚未设置主视觉</div>}
          <span />
          <p>{project.number || '00'} / {project.category || '未分类'} / {project.year}</p>
        </div>
        <div className="preview-copy"><h2>{project.title || '未命名项目'}</h2><h3>{project.tagline || '补充项目的一句话主张'}</h3><p>{project.description || '项目介绍会显示在这里。'}</p><b>{project.role || '补充职责'}</b></div>
      </article>
      <div className="preview-stats">{project.stats.slice(0, 4).map((stat, index) => <span key={`${stat}-${index}`}>{stat || '数据标签'}</span>)}</div>
      <div className="preview-help"><b>发布逻辑</b><p>“存为草稿”会保存到 GitHub，但不会出现在公开作品集；“发布到网站”会触发 Netlify 自动构建。</p></div>
    </aside>
  );
}

function LoginScreen({ identity }) {
  return (
    <main className="login-screen">
      <div className="login-grid" />
      <section><div className="login-mark">GJX<i /></div><p>PORTFOLIO OPERATING SYSTEM</p><h1>作品后台，<br />为创作流程而设计。</h1><blockquote>项目、媒体、能力、流程与工作留痕被重新组织成清晰的编辑路径。</blockquote><button type="button" onClick={() => identity?.open('login')}>使用管理员账号登录 <span>→</span></button><small>仅受邀请的账号可进入</small></section>
    </main>
  );
}

function AdminApp() {
  const [identity, setIdentity] = useState(null);
  const [user, setUser] = useState(demoMode ? { email: '本地预览模式' } : null);
  const [records, setRecords] = useState(fallbackRecords);
  const [selectedKey, setSelectedKey] = useState(fallbackRecords[0]?.key || '');
  const [activeTab, setActiveTab] = useState('overview');
  const [query, setQuery] = useState('');
  const [connection, setConnection] = useState(demoMode ? 'fallback' : 'loading');
  const [message, setMessage] = useState(demoMode ? '本地预览 · 使用内置作品数据，不会写入 GitHub' : '正在连接作品数据库…');
  const [saving, setSaving] = useState(false);
  const [dirtyKeys, setDirtyKeys] = useState(() => new Set());

  const selected = records.find((record) => record.key === selectedKey) || records[0];
  const project = selected?.data;

  const loadRemote = async (activeUser) => {
    if (!activeUser) return;
    setConnection('loading');
    setMessage('正在从 GitHub 读取最新作品数据…');
    try {
      const remote = (await loadRemoteProjects(activeUser)).map((record) => ({ ...record, key: record.path, data: normalizeProject(record.data) }));
      setRecords(remote);
      setSelectedKey((current) => remote.some((record) => record.key === current) ? current : remote[0]?.key || '');
      setConnection('online');
      setMessage(`已连接 GitHub · ${remote.length} 个项目`);
    } catch (error) {
      setRecords(fallbackRecords);
      setSelectedKey(fallbackRecords[0]?.key || '');
      setConnection('fallback');
      setMessage(`网络读取失败，已切换到只读兜底数据：${error.message}`);
    }
  };

  useEffect(() => {
    if (demoMode) return undefined;
    const service = getIdentity();
    if (!service) {
      setConnection('fallback');
      setMessage('登录组件加载失败，请刷新页面。');
      return undefined;
    }
    service.init();
    setIdentity(service);
    const initialUser = service.currentUser();
    setUser(initialUser);
    if (initialUser) loadRemote(initialUser);
    else setConnection('signed-out');
    const onLogin = (nextUser) => { setUser(nextUser); service.close(); loadRemote(nextUser); };
    const onLogout = () => { setUser(null); setConnection('signed-out'); };
    service.on('login', onLogin);
    service.on('logout', onLogout);
    return () => { service.off('login', onLogin); service.off('logout', onLogout); };
  }, []);

  const visibleRecords = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const sorted = [...records].sort((a, b) => a.data.order - b.data.order);
    if (!keyword) return sorted;
    return sorted.filter((record) => `${record.data.title} ${record.data.category} ${record.data.role}`.toLowerCase().includes(keyword));
  }, [records, query]);

  const updateProject = (nextData) => {
    if (!selected) return;
    setRecords((current) => current.map((record) => record.key === selected.key ? { ...record, data: nextData } : record));
    setDirtyKeys((current) => new Set(current).add(selected.key));
    localStorage.setItem(`gjx-admin-draft:${selected.key}`, JSON.stringify(nextData));
  };

  const setField = (path, value) => updateProject(setPathValue(project, path, value));

  const selectProject = (key) => {
    setSelectedKey(key);
    setActiveTab('overview');
  };

  const addProject = () => {
    const order = Math.max(0, ...records.map((record) => Number(record.data.order || 0))) + 1;
    const data = newProject(order);
    const id = `new-project-${Date.now()}`;
    data.id = id;
    const path = `src/content/projects/${String(order).padStart(2, '0')}-${id}.json`;
    const record = { key: path, path, sha: null, data };
    setRecords((current) => [...current, record]);
    setSelectedKey(record.key);
    setActiveTab('overview');
    setDirtyKeys((current) => new Set(current).add(record.key));
    setMessage('已创建本地草稿，填写后保存到 GitHub。');
  };

  const persist = async (status) => {
    if (!selected || !user) return;
    if (connection !== 'online') {
      setMessage('当前是兜底模式，恢复网络连接后才能写入 GitHub。');
      return;
    }
    if (!project.id.trim() || !project.title.trim()) {
      setMessage('保存前请填写项目标识和项目标题。');
      return;
    }
    setSaving(true);
    const data = prepareProject(project, status);
    const action = status === 'draft' ? '保存草稿' : '发布作品';
    setMessage(`${action}中…`);
    try {
      const targetPath = selected.sha
        ? selected.path
        : `src/content/projects/${String(data.order).padStart(2, '0')}-${data.id}.json`;
      const saved = await saveProjectFile(user, { ...selected, path: targetPath, data }, `${action}：${data.title}`);
      const savedKey = saved.path;
      setRecords((current) => current.map((record) => record.key === selected.key ? { ...saved, key: savedKey, data: normalizeProject(data) } : record));
      setSelectedKey(savedKey);
      setDirtyKeys((current) => { const next = new Set(current); next.delete(selected.key); next.delete(savedKey); return next; });
      localStorage.removeItem(`gjx-admin-draft:${selected.key}`);
      setMessage(status === 'draft' ? '草稿已保存到 GitHub，不会出现在公开网站。' : '已发布，Netlify 正在自动更新公开网站。');
    } catch (error) {
      setMessage(`保存失败：${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async () => {
    if (!selected) return;
    if (!window.confirm(`确定删除“${project.title}”吗？该操作会从 GitHub 删除项目文件。`)) return;
    setSaving(true);
    try {
      if (selected.sha && connection === 'online') await deleteProjectFile(user, selected);
      const remaining = records.filter((record) => record.key !== selected.key);
      setRecords(remaining);
      setSelectedKey(remaining[0]?.key || '');
      localStorage.removeItem(`gjx-admin-draft:${selected.key}`);
      setMessage('项目已删除，公开网站将在自动构建后更新。');
    } catch (error) {
      setMessage(`删除失败：${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file, destination = 'portfolio') => {
    if (connection !== 'online') throw new Error('兜底模式下不能上传，请先恢复连接。');
    const path = await uploadAssetFile(user, file, project.id, destination);
    setMessage(`素材已上传：${path}。请继续保存项目数据。`);
    return path;
  };

  const restoreLocal = () => {
    const stored = localStorage.getItem(`gjx-admin-draft:${selected.key}`);
    if (!stored) { setMessage('当前项目没有浏览器本地草稿。'); return; }
    try { updateProject(normalizeProject(JSON.parse(stored))); setMessage('已恢复浏览器本地草稿。'); }
    catch { setMessage('本地草稿已损坏，无法恢复。'); }
  };

  if (!user) return <LoginScreen identity={identity} />;
  if (!project) return <div className="loading-screen">没有可编辑项目。<button type="button" onClick={addProject}>新建第一个项目</button></div>;

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="admin-brand"><b>GJX</b><i /><span>PORTFOLIO STUDIO</span></div>
        <div className={`connection ${connection}`}><i />{message}</div>
        <div className="header-actions"><a href={`/?project=${project.id}`} target="_blank" rel="noreferrer">查看公开页面 ↗</a><button type="button" onClick={() => identity?.logout()}>退出</button></div>
      </header>
      <aside className="project-sidebar">
        <div className="sidebar-head"><div><small>CONTENT</small><h1>作品项目</h1></div><button type="button" onClick={addProject} aria-label="新建项目">＋</button></div>
        <label className="project-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目或分类" /></label>
        <div className="project-count"><span>{visibleRecords.length} 个项目</span><b>{records.filter((record) => record.data.status === 'draft').length} 个草稿</b></div>
        <nav>{visibleRecords.map((record) => <button className={record.key === selected.key ? 'active' : ''} type="button" onClick={() => selectProject(record.key)} key={record.key}><span>{record.data.number}</span><div><b>{record.data.shortTitle || record.data.title}</b><small>{record.data.category}</small></div><i className={record.data.status === 'draft' ? 'draft' : ''}>{record.data.status === 'draft' ? '草稿' : '发布'}</i>{dirtyKeys.has(record.key) && <em>●</em>}</button>)}</nav>
        <footer><button type="button" onClick={() => loadRemote(user)}>↻ 重新同步 GitHub</button><p>{user.email}</p></footer>
      </aside>
      <main className="admin-main">
        <div className="editor-head">
          <div><p>{project.number} / {project.category}</p><h1>{project.title}</h1></div>
          <div className="editor-actions"><button className="quiet" type="button" onClick={restoreLocal}>恢复本地草稿</button><button className="quiet" type="button" onClick={() => persist('draft')} disabled={saving}>存为草稿</button><button className="publish" type="button" onClick={() => persist('published')} disabled={saving}>{saving ? '处理中…' : '发布到网站 →'}</button></div>
        </div>
        <div className="workspace">
          <div className="editor-column">
            <nav className="editor-tabs">{tabs.map(([id, label, note]) => <button className={activeTab === id ? 'active' : ''} type="button" onClick={() => setActiveTab(id)} key={id}><b>{label}</b><small>{note}</small></button>)}</nav>
            <div className="editor-content">
              {activeTab === 'overview' && <OverviewEditor project={project} setField={setField} />}
              {activeTab === 'media' && <MediaEditor project={project} setField={setField} onUpload={upload} />}
              {activeTab === 'abilities' && <AbilitiesEditor project={project} setField={setField} />}
              {activeTab === 'workflow' && <WorkflowEditor project={project} setField={setField} />}
              {activeTab === 'archive' && <ArchiveEditor project={project} setField={setField} onUpload={upload} />}
              <div className="editor-danger"><div><b>删除这个项目</b><p>删除后 GitHub 会保留提交历史，但项目将从下一次部署中移除。</p></div><button type="button" onClick={removeProject}>删除项目</button></div>
            </div>
          </div>
          <LivePreview project={project} />
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('admin-root')).render(<AdminApp />);
