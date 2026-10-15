import { useEffect, useMemo, useState } from 'react';
import { documentAsset, portfolioAsset, projectById, projects } from './content/index.js';

const arrow = <span aria-hidden="true">↗</span>;
const homeSections = [
  ['profile', '个人简介'],
  ['method', '工作方法'],
  ['projects', '项目档案'],
  ['archive', '工作留痕'],
  ['contact', '联系'],
];

const jumpTo = (target) => {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  if (target === 'top') window.scrollTo(0, 0);
  else document.getElementById(target)?.scrollIntoView();
  window.requestAnimationFrame(() => { root.style.scrollBehavior = previous; });
};

const traceLabel = (index) => {
  const labels = ['提示词与项目沟通', '角色与场景素材整理', 'Premiere 剪辑时间线', '角色设定与三视图', '生成反馈与版本确认', '剪辑与镜头组织'];
  return labels[index % labels.length];
};

function useLocationProject() {
  const getId = () => new URLSearchParams(window.location.search).get('project');
  const [projectId, setProjectId] = useState(getId);

  useEffect(() => {
    const update = () => setProjectId(getId());
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  const openProject = (id, replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.set('project', id);
    url.hash = '';
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
    setProjectId(id);
    window.setTimeout(() => jumpTo('top'), 60);
  };

  const openHome = (section = 'top') => {
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    url.hash = section === 'top' ? '' : section;
    window.history.pushState({}, '', url);
    setProjectId(null);
    window.setTimeout(() => jumpTo(section), 60);
  };

  return { projectId, openProject, openHome };
}

function Header({ projectId, onOpenProject, onHome }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return projects.filter((project) => JSON.stringify(project).toLowerCase().includes(value)).slice(0, 5);
  }, [query]);

  const goTo = (section) => {
    setMenuOpen(false);
    if (projectId) onHome(section);
    else document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const submit = (event) => {
    event.preventDefault();
    if (results[0]) {
      onOpenProject(results[0].id);
      setStatus(`已打开：${results[0].shortTitle}`);
      setQuery('');
      return;
    }
    const keyword = query.trim();
    if (!keyword) setStatus('输入项目、流程或能力关键词');
    else setStatus('暂无匹配，试试“一灯”“导演”或“摄影”');
  };

  return (
    <header className="site-header">
      <div className="header-main page-shell">
        <button className="brand" type="button" onClick={() => onHome('top')} aria-label="返回作品集首页">
          <b>GJX</b><i /><span>AIGC VIDEO CREATOR</span>
        </button>
        <nav className={menuOpen ? 'is-open' : ''} aria-label="主要导航">
          {homeSections.map(([id, label]) => <button type="button" onClick={() => goTo(id)} key={id}>{label}</button>)}
        </nav>
        <a className="header-contact" href="mailto:13648187093@163.com">LET'S TALK {arrow}</a>
        <button className="menu-toggle" type="button" aria-label="打开导航" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><i /><i /></button>
      </div>
      <form className="fixed-search" role="search" onSubmit={submit}>
        <div className="page-shell search-inner">
          <label htmlFor="portfolio-search">SEARCH / 全站检索</label>
          <input id="portfolio-search" value={query} onChange={(event) => { setQuery(event.target.value); setStatus(''); }} placeholder="搜索项目、能力、流程或素材…" autoComplete="off" />
          <button type="submit">定位 <span>→</span></button>
          <small aria-live="polite">{status}</small>
          {query && results.length > 0 && (
            <div className="search-results">
              {results.map((result) => (
                <button type="button" key={result.id} onClick={() => { onOpenProject(result.id); setQuery(''); }}>
                  <span>{result.number}</span><b>{result.shortTitle}</b><em>{result.category}</em>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </header>
  );
}

function ProjectVisual({ project, mode = 'cover', controls = false }) {
  const video = project.video?.[mode === 'full' ? 'full' : 'preview'];
  const preferImage = mode === 'cover' && project.heroMediaType === 'image';
  if (video && !preferImage) {
    return (
      <video key={`${project.id}-${mode}`} src={portfolioAsset(video)} poster={portfolioAsset(project.poster)} controls={controls} autoPlay={!controls} muted={!controls} loop={!controls} playsInline preload={controls ? 'metadata' : 'none'} />
    );
  }
  return <img src={portfolioAsset(project.poster)} alt={`${project.title}主视觉`} />;
}

function SectionTitle({ index, kicker, children, light = false }) {
  return <header className={`section-title ${light ? 'is-light' : ''}`}><p><span>{index}</span>{kicker}</p><h2>{children}</h2></header>;
}

function Home({ onOpenProject }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [methodStep, setMethodStep] = useState(0);
  const lantern = projectById.lantern;
  const words = ['导演情绪', '生成世界', '剪辑节奏'];

  useEffect(() => {
    const timer = window.setInterval(() => setWordIndex((value) => (value + 1) % words.length), 2300);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main>
      <section id="top" className="home-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="page-shell hero-layout">
          <div className="hero-copy">
            <p className="overline">AIGC VIDEO CREATOR / AVAILABLE FOR INTERNSHIP</p>
            <h1>我用影像</h1>
            <div className="kinetic-words">{words.map((word, index) => <span className={index === wordIndex ? 'active' : ''} key={word}>{word}</span>)}</div>
            <h2>让画面成立。</h2>
            <div className="hero-cta"><button type="button" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>查看完整项目 <span>→</span></button><p>从脚本、视觉设定与镜头生成，到真人拍摄、剪辑合成和最终交付。</p></div>
          </div>
          <button className="hero-feature" type="button" onClick={() => onOpenProject('lantern')}>
            <ProjectVisual project={lantern} /><span className="media-shade" /><span className="hero-feature-meta"><i>CORE CASE / 01</i><b>一灯渡众生</b><small>54 SHOTS · {lantern.video.duration} FULL FILM</small></span><span className="round-arrow">↗</span>
          </button>
        </div>
        <p className="scroll-cue">SCROLL TO EXPLORE <span>↓</span></p>
      </section>

      <div className="dual-ticker" aria-hidden="true"><div><span>DIRECT / GENERATE / EDIT / DELIVER / DIRECT / GENERATE / EDIT / DELIVER /</span></div><div><span>构思 / 生成 / 剪辑 / 交付 / 构思 / 生成 / 剪辑 / 交付 /</span></div></div>

      <section id="profile" className="section-pad profile-section"><div className="page-shell">
        <SectionTitle index="01" kicker="PROFILE">不只生成画面，<br />也建立画面的规则。</SectionTitle>
        <div className="profile-panel">
          <figure><img src="./assets/guo-jiaxin.jpg" alt="郭佳鑫个人肖像" /><figcaption><span>GUO JIAXIN</span><span>CHENGDU / CHINA</span></figcaption></figure>
          <article><p>我是郭佳鑫，目标岗位为 <strong>AIGC 视频创作实习生</strong>。我关注的不是单次生成，而是如何把脚本、角色、场景、镜头、声音和剪辑组织成可以复核、可以完善、可以交付的完整流程。</p><dl><div><dt>POSITION</dt><dd>AIGC 视频创作</dd></div><div><dt>EDUCATION</dt><dd>本科 / 视觉设计方向</dd></div><div><dt>FOCUS</dt><dd>导演 · 生成 · 剪辑</dd></div></dl><div className="profile-numbers"><span><b>03</b><small>完整影像项目</small></span><span><b>54</b><small>AIGC 镜头设计</small></span><span><b>{String(projects.length).padStart(2, '0')}</b><small>当前项目档案</small></span></div><a href={documentAsset('guo-jiaxin-resume.pdf')} target="_blank" rel="noreferrer">查看完整简历 {arrow}</a></article>
        </div>
      </div></section>

      <section id="method" className="section-pad method-section"><div className="page-shell">
        <SectionTitle index="02" kicker="CONTROLLED WORKFLOW" light>把“生成”，变成<br />可控的工作流程。</SectionTitle>
        <div className="method-layout">
          <div className="method-map"><svg viewBox="0 0 900 520" aria-hidden="true"><path d="M120 320 C220 80 380 110 445 255 S700 450 790 145"/><path d="M120 320 C300 430 520 455 790 145"/></svg>{lantern.process.map((step, index) => <button className={`method-node node-${index + 1} ${methodStep === index ? 'active' : ''}`} type="button" onClick={() => setMethodStep(index)} key={step.number}><span>{step.number}</span><b>{step.title}</b><small>{step.summary}</small></button>)}</div>
          <article className="method-detail"><p>STEP {lantern.process[methodStep].number} / CLICKABLE PROCESS</p><h3>{lantern.process[methodStep].title}</h3><strong>如何完善</strong><blockquote>{lantern.process[methodStep].improvement}</blockquote><div className="method-evidence">{lantern.process[methodStep].evidence.slice(0, 3).map((image) => <img src={portfolioAsset(image)} alt="对应流程的工作证据" key={image} />)}</div><button type="button" onClick={() => onOpenProject('lantern')}>进入项目查看完整流程 {arrow}</button></article>
        </div>
      </div></section>

      <section id="projects" className="section-pad projects-section"><div className="page-shell">
        <SectionTitle index="03" kicker="SELECTED CASES" light>每个项目，<br />都是一条完整证据链。</SectionTitle>
        <div className="project-grid">{projects.map((project, index) => <button className={`project-card project-card-${index + 1}`} type="button" onClick={() => onOpenProject(project.id)} key={project.id}><span className="card-image"><img src={portfolioAsset(project.cover)} alt={`${project.title}项目封面`} loading="lazy" /><i /></span><span className="card-copy"><small>{project.number} / {project.category}</small><b>{project.title}</b><em>{project.role}</em><span>{project.tagline}</span></span><span className="card-arrow">↗</span></button>)}</div>
      </div></section>

      <section id="archive" className="section-pad archive-section"><div className="page-shell">
        <SectionTitle index="04" kicker="WORKING ARCHIVE">作品之外，<br />保留每一次判断。</SectionTitle>
        <div className="archive-intro"><p>{lantern.traceFiles.length} 份提示词、角色设定、生成反馈、剪辑时间线和声音记录，不再藏在文件夹里。它们被放回对应流程，用来说明作品如何一步步被完善。</p><button type="button" onClick={() => onOpenProject('lantern')}>打开完整留痕专区 {arrow}</button></div>
        <div className="archive-strip">{lantern.traceFiles.slice(0, 10).map((file, index) => <figure key={file}><img src={portfolioAsset(`traces/${file}`)} alt={traceLabel(index)} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')}</span>{traceLabel(index)}</figcaption></figure>)}</div>
      </div></section>

      <section id="contact" className="contact-section"><img src={portfolioAsset('tea-01.webp')} alt="" /><div className="contact-shade" /><div className="page-shell contact-inner"><p>05 / CONTACT</p><h2>下一次，<br />一起让画面成立。</h2><a href="mailto:13648187093@163.com"><span>13648187093@163.com</span>{arrow}</a><footer><span>GUO JIAXIN © 2026</span><span>AIGC VIDEO / VISUAL DESIGN / EDITING</span></footer></div></section>
    </main>
  );
}

function AbilityGrid({ project }) {
  return <div className="ability-grid">{project.abilities.map((ability, index) => <article key={ability.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{ability.title}</h3><p>{ability.copy}</p></article>)}</div>;
}

function Lightbox({ image, onClose }) {
  useEffect(() => {
    const key = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);
  if (!image) return null;
  return <div className="lightbox" role="dialog" aria-modal="true"><button type="button" className="lightbox-shade" onClick={onClose} aria-label="关闭大图" /><button type="button" className="lightbox-close" onClick={onClose}>关闭 ×</button><img src={image} alt="作品素材大图" /></div>;
}

function ProjectCase({ project, onOpenProject, onHome }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [archiveTab, setArchiveTab] = useState('trace');
  useEffect(() => { setStepIndex(0); setArchiveTab('trace'); }, [project.id]);
  const step = project.process[stepIndex];
  const nextProject = projects[(projects.findIndex((item) => item.id === project.id) + 1) % projects.length];
  const frames = project.frameCount ? Array.from({ length: project.frameCount }, (_, index) => `lantern-frames/shot-${String(index + 1).padStart(2, '0')}.jpg`) : [];
  const hasArchive = Boolean(project.traceFiles || project.frameCount || project.workArchive);
  const openImage = (path) => setLightbox(portfolioAsset(path));

  return (
    <main className={`case-page case-${project.id}`}>
      <section id="case-top" className="case-hero"><div className="case-hero-media">{project.heroMediaType === 'video' && project.video?.preview ? <video src={portfolioAsset(project.video.preview)} poster={portfolioAsset(project.poster)} autoPlay muted loop playsInline /> : <img src={portfolioAsset(project.poster)} alt={`${project.title}项目主海报`} />}<span /></div><div className="page-shell case-hero-copy"><button type="button" onClick={() => onHome('projects')}>← 返回项目档案</button><p>{project.number} / {project.category} / {project.year}</p><h1>{project.title}</h1><h2>{project.tagline}</h2><div><span>{project.role}</span>{project.stats.map((stat) => <b key={stat}>{stat}</b>)}</div></div></section>

      <div className="page-shell case-shell">
        <div className="case-main">
          <section id="overview" className="case-section case-overview"><p className="case-kicker">01 / PROJECT OVERVIEW</p><h2>{project.description}</h2><div className="project-facts">{project.stats.map((stat, index) => <span key={stat}><small>{String(index + 1).padStart(2, '0')}</small><b>{stat}</b></span>)}</div></section>

          <section id="abilities" className="case-section"><p className="case-kicker">02 / PERSONAL CAPABILITY</p><header className="case-heading"><h2>在流程之前，先说明<br />我为项目带来了什么。</h2><p>个人能力不是工具清单，而是面对问题时采用的判断与方法。</p></header><AbilityGrid project={project} /></section>

          {project.video && <section id="film" className="case-section film-section"><p className="case-kicker">03 / {project.video.label.toUpperCase()}</p><header className="case-heading"><h2>{project.video.label}</h2><p>时长 {project.video.duration}。这里播放的是完整作品，浏览器可直接查看。</p></header><div className="full-film"><ProjectVisual project={project} mode="full" controls /><span>FULL FILM / {project.video.duration}</span></div>{project.backgroundMusic && <div className="project-audio"><span>BACKGROUND MUSIC</span><audio src={portfolioAsset(project.backgroundMusic)} controls preload="metadata" /></div>}{project.id === 'slow-life' && <details className="trailer-panel"><summary>补充查看 00:28 片花（非正片）</summary><video key="slow-life-trailer" src={portfolioAsset(project.video.preview)} controls playsInline preload="metadata" poster={portfolioAsset(project.poster)} /></details>}</section>}

          <section id="workflow" className="case-section workflow-section"><p className="case-kicker">{project.video ? '04' : '03'} / COMPLETE WORKFLOW</p><header className="case-heading"><h2>从问题到交付，<br />完整说明如何完善。</h2><p>点击每一步，查看具体改进、交付物与对应证据。</p></header><div className="workflow-tabs">{project.process.map((item, index) => <button type="button" className={index === stepIndex ? 'active' : ''} onClick={() => setStepIndex(index)} key={item.number}><span>{item.number}</span><b>{item.title}</b></button>)}</div><article className="workflow-detail"><div className="workflow-copy"><p>STEP {step.number}</p><h3>{step.title}</h3><strong>{step.summary}</strong><h4>这一步如何完善作品</h4><blockquote>{step.improvement}</blockquote><h4>阶段交付</h4><ul>{step.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="workflow-media">{step.evidence.map((image, index) => <button type="button" onClick={() => openImage(image)} key={`${image}-${index}`}><img src={portfolioAsset(image)} alt={`${step.title}流程证据 ${index + 1}`} loading="lazy" /><span>证据 {String(index + 1).padStart(2, '0')} ↗</span></button>)}</div></article></section>

          <section id="gallery" className="case-section gallery-section"><p className="case-kicker">{project.video ? '05' : '04'} / RESULT GALLERY</p><header className="case-heading"><h2>最终作品与延展成果</h2><p>点击任意图片查看完整尺寸。</p></header><div className={`result-gallery count-${project.gallery.length}`}>{project.gallery.map((image, index) => <button type="button" onClick={() => openImage(image)} key={`${image}-${index}`}><img src={portfolioAsset(image)} alt={`${project.title}成果 ${index + 1}`} loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div></section>

          {hasArchive && <section id="evidence" className="case-section evidence-section">
            <p className="case-kicker">06 / WORKING ARCHIVE</p>
            <header className="case-heading"><h2>{project.workArchive?.title || '工作留痕与逐镜档案'}</h2><p>{project.workArchive?.description || '不是装饰图集，而是从设定、生成到剪辑的过程证据。'}</p></header>
            {project.traceFiles ? <>
              <div className="archive-tabs"><button type="button" className={archiveTab === 'trace' ? 'active' : ''} onClick={() => setArchiveTab('trace')}>{project.traceFiles.length} 份项目留痕</button><button type="button" className={archiveTab === 'frames' ? 'active' : ''} onClick={() => setArchiveTab('frames')}>54 张逐镜画面</button></div>
              {archiveTab === 'trace' ? <div className="evidence-grid">{project.traceFiles.map((file, index) => <button type="button" onClick={() => openImage(`traces/${file}`)} key={file}><img src={portfolioAsset(`traces/${file}`)} alt={traceLabel(index)} loading="lazy" /><span>{String(index + 1).padStart(2, '0')} / {traceLabel(index)}</span></button>)}</div> : <div className="frame-grid">{frames.map((frame, index) => <button type="button" onClick={() => openImage(frame)} key={frame}><img src={portfolioAsset(frame)} alt={`第 ${index + 1} 镜画面`} loading="lazy" /><span>SHOT {String(index + 1).padStart(2, '0')}</span></button>)}</div>}
            </> : <div className="evidence-grid">{project.workArchive.files.map((item, index) => <button type="button" onClick={() => openImage(item.file)} key={item.file}><img src={portfolioAsset(item.file)} alt={item.label} loading="lazy" /><span>{String(index + 1).padStart(2, '0')} / {item.label}</span></button>)}</div>}
          </section>}

          {project.downloads?.length > 0 && <section id="documents" className="case-section documents-section"><p className="case-kicker">DOCUMENTS / SOURCE FILES</p><h2>可下载项目文档</h2><div>{project.downloads.map((download) => <a href={documentAsset(download.file)} target="_blank" rel="noreferrer" key={download.file}><span>{download.label}</span>{arrow}</a>)}</div></section>}

          <section className="next-case"><p>NEXT PROJECT</p><button type="button" onClick={() => onOpenProject(nextProject.id)}><span>{nextProject.number} / {nextProject.category}</span><b>{nextProject.title}</b>{arrow}</button></section>
        </div>

        <aside className="case-rail"><div className="rail-inner"><p>PROJECT INDEX / {project.number}</p><nav aria-label="项目页分区"><a href="#overview">项目介绍</a><a href="#abilities">个人能力</a>{project.video && <a href="#film">完整成片</a>}<a href="#workflow">完整流程</a><a href="#gallery">成果展示</a>{hasArchive && <a href="#evidence">工作留痕</a>}{project.downloads?.length > 0 && <a href="#documents">项目文档</a>}</nav><section><h3>{project.notesTitle || '简历中的项目说明'}</h3><ol>{project.resumeNotes.map((note) => <li key={note}>{note}</li>)}</ol></section><section className="rail-analysis"><h3>项目解析与补充</h3><p>{project.analysis}</p></section><section><h3>职责</h3><p>{project.role}</p></section></div></aside>
      </div>
      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
    </main>
  );
}

export default function App() {
  const { projectId, openProject, openHome } = useLocationProject();
  const project = projectById[projectId];
  useEffect(() => { document.title = project ? `${project.shortTitle}｜郭佳鑫作品集` : '郭佳鑫｜AIGC 视频创作实习生'; }, [project]);
  return <><a className="skip-link" href="#overview">跳到主要内容</a><Header projectId={project?.id} onOpenProject={openProject} onHome={openHome} />{project ? <ProjectCase project={project} onOpenProject={openProject} onHome={openHome} /> : <Home onOpenProject={openProject} />}</>;
}
