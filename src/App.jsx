import { useEffect, useState } from 'react';

const asset = (name) => `./assets/portfolio/${name}`;

const projects = [
  {
    number: '01', category: 'AIGC 微短剧', title: '《一灯渡众生》', role: '导演 · 生成统筹 · 剪辑后期',
    description: '将传统文化题材拆解为 54 个可执行镜头，以参考图、首尾帧和提示词约束角色、服饰、空间与核心道具，完成 3 分 23 秒 AIGC 成片。',
    video: asset('lantern-preview.mp4'), poster: asset('lantern-poster.webp'), stats: ['54 SHOTS', '03:23 FILM'],
    details: ['盛唐长安东方绘本视觉规范', '镜号化生成与连续性控制', '字幕、声音与成片校对'],
    gallery: [asset('process-scenes.webp'), asset('process-monk.webp'), asset('process-girl.webp'), asset('process-mother.webp')],
  },
  {
    number: '02', category: '文创产品与数字体验', title: '《一叶生长》', role: '品牌概念 · 视觉统筹 · 跨媒介体验',
    description: '从雅安茶文化提炼“一叶、一液、一业、一夜”的品牌表达，覆盖茶罐、明信片、雨伞、香器、礼盒及沉浸式 VR 数字体验。',
    video: asset('tea-vr-preview.mp4'), poster: asset('tea-01.webp'), stats: ['06 DELIVERABLES', 'VR EXPERIENCE'],
    details: ['叶脉与自然要素主视觉', '实体文创与移动内容联动', '产品、展板与数字体验整合'],
    gallery: [asset('tea-01.webp'), asset('tea-02.webp'), asset('tea-03.webp'), asset('tea-04.webp'), asset('tea-05.webp'), asset('tea-06.webp')],
  },
  {
    number: '03', category: '真人剧情短片', title: '《慢度朝夕》', role: '导演 · 编剧 · 摄影 · 后期',
    description: '以冷暖色调和节奏变化呈现人物从高压内耗到重新参与生活的转折，完成剧本修改、分镜协调、现场拍摄与 5 分 12 秒成片交付。',
    video: asset('slow-life-preview.mp4'), poster: asset('slow-life-poster.webp'), stats: ['05:12 FILM', 'LIVE ACTION'],
    details: ['人物情绪与镜头节奏设计', '校园空间中的现场调度', '素材筛选、字幕与声音处理'],
    gallery: [asset('slow-life-poster.webp'), asset('photo-01.webp'), asset('photo-04.webp')],
  },
  {
    number: '04', category: '城市文化视觉系统', title: '成都文化视觉转译', role: '文化调研 · 图形设计 · 系列海报',
    description: '从五处成都文化地标提炼建筑、文物与地域符号，统一构图、字体、色彩和版式规范，形成具有系列感与辨识度的海报方案。',
    poster: asset('chengdu-wuhou.webp'), stats: ['05 POSTERS', 'ACP ENTRY'],
    details: ['五处文化地标信息梳理', '历史元素的现代图形转译', '统一系统下保留场所差异'],
    gallery: [asset('chengdu-panda.webp'), asset('chengdu-kuanzhai.webp'), asset('chengdu-dufu.webp'), asset('chengdu-wuhou.webp'), asset('chengdu-jinsha.webp')],
  },
];

const strengths = [
  ['01', '导演与分镜', '把文本拆成行动、情绪、景别和镜头衔接，形成可执行的画面方案。'],
  ['02', '生成连续性', '通过参考图、首尾帧、固定人物关系和空间参照，逐镜控制跳变与漂移。'],
  ['03', '剪辑与交付', '从素材管理、镜头衔接到节奏、字幕、声音和成片校对，推进完整交付。'],
  ['04', '视觉系统', '用统一色彩、图形和版式语言连接影像、海报、产品与数字体验。'],
];

const photographs = [
  [asset('photo-01.webp'), '街巷与时间'], [asset('photo-02.webp'), '光线与日常物件'],
  [asset('photo-03.webp'), '人物与空间关系'], [asset('photo-04.webp'), '城市中的停顿'],
];

function Arrow() { return <span aria-hidden="true">↗</span>; }

function Intro({ leaving, onEnter, onFinished }) {
  return (
    <section className={`intro-screen ${leaving ? 'is-leaving' : ''}`} onAnimationEnd={leaving ? onFinished : undefined}>
      <video autoPlay muted loop playsInline poster={asset('lantern-poster.webp')}><source src={asset('lantern-preview.mp4')} type="video/mp4" /></video>
      <div className="intro-shade" aria-hidden="true" /><div className="intro-grid" aria-hidden="true" />
      <div className="intro-top"><span>GJX / PORTFOLIO</span><span>2026</span></div>
      <div className="intro-copy"><p>AIGC VIDEO CREATOR · DIRECT / GENERATE / EDIT</p><h1>从一帧<br />进入一部作品</h1><button type="button" onClick={onEnter}><span>ENTER PORTFOLIO</span><Arrow /></button></div>
      <div className="intro-bottom"><span>真实项目素材 / 响应式展示</span><span>点击进入 ↓</span></div>
    </section>
  );
}

function ProjectMedia({ project, controls = false }) {
  if (project.video) {
    return <video autoPlay={!controls} muted={!controls} loop={!controls} controls={controls} playsInline preload="metadata" poster={project.poster}><source src={project.video} type="video/mp4" /></video>;
  }
  return <img src={project.poster} alt={`${project.title}项目视觉`} />;
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handleKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
      <button className="modal-backdrop" type="button" onClick={onClose} aria-label="关闭项目详情" />
      <article className="modal-panel">
        <button className="modal-close" type="button" onClick={onClose} aria-label="关闭项目详情">×</button>
        <div className="modal-heading"><p>{project.number} / {project.category}</p><h2 id="project-modal-title">{project.title}</h2><span>{project.role}</span></div>
        <div className="modal-media"><ProjectMedia project={project} controls /></div>
        <div className="modal-summary"><p>{project.description}</p><ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></div>
        <div className={`modal-gallery ${project.gallery.length > 4 ? 'is-dense' : ''}`}>{project.gallery.map((image, index) => <img src={image} alt={`${project.title}项目素材 ${index + 1}`} key={image} loading="lazy" />)}</div>
      </article>
    </div>
  );
}

function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll(); window.addEventListener('scroll', handleScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: 0.1 });
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    return () => { window.removeEventListener('scroll', handleScroll); observer.disconnect(); };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-lock', menuOpen || Boolean(activeProject));
    return () => document.body.classList.remove('menu-lock');
  }, [menuOpen, activeProject]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main">跳到主要内容</a>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="brand" href="#top" onClick={closeMenu} aria-label="返回首页"><span>GJX</span><i aria-hidden="true" /></a>
        <nav className={menuOpen ? 'is-open' : ''} aria-label="主要导航"><a href="#profile" onClick={closeMenu}>经历</a><a href="#projects" onClick={closeMenu}>项目</a><a href="#strengths" onClick={closeMenu}>优势</a><a href="#contact" onClick={closeMenu}>联系</a></nav>
        <a className="header-contact" href="mailto:13648187093@163.com">LET'S TALK <Arrow /></a>
        <button className={`menu-button ${menuOpen ? 'is-open' : ''}`} type="button" aria-expanded={menuOpen} aria-label={menuOpen ? '关闭导航' : '打开导航'} onClick={() => setMenuOpen((value) => !value)}><i /><i /></button>
      </header>

      <main id="main">
        <section id="top" className="hero">
          <video className="hero-video" autoPlay muted loop playsInline poster={asset('lantern-poster.webp')}><source src={asset('lantern-preview.mp4')} type="video/mp4" /></video>
          <div className="hero-shade" aria-hidden="true" /><div className="hero-grid" aria-hidden="true" /><div className="hero-orbit" aria-hidden="true"><i /><i /><i /></div>
          <div className="hero-content page-shell"><p className="kicker" data-reveal><span>AVAILABLE FOR INTERNSHIP</span> / 2026</p><h1 data-reveal><span>AIGC</span><span>视频创作</span><em>实习生</em></h1><div className="hero-bottom" data-reveal><p>从脚本、视觉设定与镜头生成，到真人拍摄、剪辑合成和最终交付。</p><a className="circle-link" href="#projects" aria-label="查看精选项目"><span>VIEW<br />WORK</span><Arrow /></a></div></div>
          <div className="hero-side" aria-hidden="true"><span>DIRECT</span><span>GENERATE</span><span>EDIT</span></div><p className="hero-scroll">SCROLL TO EXPLORE <span>↓</span></p>
        </section>

        <section id="profile" className="profile section-space"><div className="page-shell">
          <header className="section-header" data-reveal><p className="section-label">01 / PROFILE</p><h2>不只生成画面，<br />也负责让画面成立。</h2></header>
          <div className="profile-layout"><div className="portrait-card" data-reveal><img src="./assets/guo-jiaxin.jpg" alt="郭佳鑫肖像" /><span className="portrait-code">GJX / PORTFOLIO</span><span className="portrait-role">AIGC VIDEO CREATOR</span></div>
          <div className="profile-copy" data-reveal><p className="profile-intro">郭佳鑫，成都美术学院数字媒体艺术本科在读，综合排名年级第四。关注 AIGC 影像从创意拆解、视觉设定到成片交付的完整链路，也具备真人短片拍摄、校园宣发与文旅视觉设计经验。</p>
          <dl className="profile-meta"><div><dt>EDUCATION</dt><dd>成都美术学院<br />数字媒体艺术 · 本科</dd></div><div><dt>FOCUS</dt><dd>AIGC 视频创作<br />导演与剪辑后期</dd></div><div><dt>CONTACT</dt><dd><a href="mailto:13648187093@163.com">13648187093@163.com</a><br />成都</dd></div></dl>
          <div className="profile-stats" aria-label="项目数据"><div><strong>54</strong><span>镜头叙事拆解</span></div><div><strong>03:23</strong><span>AIGC 成片</span></div><div><strong>80</strong><span>镜头拉片分析</span></div></div></div></div>
        </div></section>

        <section id="projects" className="projects section-space"><div className="page-shell">
          <header className="section-header project-heading" data-reveal><p className="section-label">02 / SELECTED PROJECTS</p><h2>精选项目</h2><p>这里展示真实成片与设计素材。点击卡片可查看项目说明、视频预览和过程图。</p></header>
          <div className="project-list">{projects.map((project) => <article className="project-card" key={project.number} data-reveal>
            <button className="project-image" type="button" onClick={() => setActiveProject(project)} aria-label={`查看${project.title}项目详情`}><ProjectMedia project={project} /><span>VIEW CASE <Arrow /></span></button>
            <div className="project-info"><div className="project-topline"><span>{project.number}</span><span>{project.category}</span></div><h3>{project.title}</h3><p className="project-role">{project.role}</p><p>{project.description}</p><div className="project-stats">{project.stats.map((stat) => <span key={stat}>{stat}</span>)}</div><button className="case-button" type="button" onClick={() => setActiveProject(project)}>展开案例 <Arrow /></button></div>
          </article>)}</div>
        </div></section>

        <section className="photography section-space" aria-labelledby="photo-title"><div className="page-shell">
          <header className="section-header project-heading" data-reveal><p className="section-label">03 / VISUAL OBSERVATION</p><h2 id="photo-title">影像观察</h2><p>通过街巷、人物、光线与日常物件，训练对构图、节奏和真实情绪的判断。</p></header>
          <div className="photo-grid">{photographs.map(([image, caption], index) => <figure key={image} data-reveal><img src={image} alt={caption} loading="lazy" /><figcaption><span>0{index + 1}</span>{caption}</figcaption></figure>)}</div>
        </div></section>

        <section id="strengths" className="strengths section-space"><div className="page-shell">
          <header className="section-header" data-reveal><p className="section-label">04 / STRENGTHS</p><h2>一套可推进、<br />可复用的创作方法。</h2></header>
          <div className="strength-grid">{strengths.map(([number, title, copy]) => <article key={number} data-reveal><span>{number}</span><div className="strength-icon" aria-hidden="true"><i /><i /></div><h3>{title}</h3><p>{copy}</p></article>)}</div>
          <div className="tool-line" data-reveal><span>TOOLS</span><p>ChatGPT · Codex · 即梦 · Workbody Cloud · Photoshop · Illustrator · 剪映</p></div>
        </div></section>

        <section id="contact" className="contact"><div className="contact-grid" aria-hidden="true" /><div className="contact-glow" aria-hidden="true" /><div className="page-shell contact-content">
          <p className="section-label" data-reveal>05 / CONTACT</p><p className="contact-eyebrow" data-reveal>AIGC VIDEO CREATION INTERNSHIP</p><h2 data-reveal>让下一个故事<br />从一帧开始。</h2><a className="contact-email" href="mailto:13648187093@163.com" data-reveal><span>13648187093@163.com</span><Arrow /></a><div className="contact-footer"><span>GUO JIAXIN © {new Date().getFullYear()}</span><span>CHENGDU / CHINA</span><a href="#top">BACK TO TOP ↑</a></div>
        </div></section>
      </main>
      {activeProject && <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />}
    </>
  );
}

function App() {
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => { document.body.classList.toggle('intro-lock', !entered); return () => document.body.classList.remove('intro-lock'); }, [entered]);
  if (!entered) return <Intro leaving={leaving} onEnter={() => setLeaving(true)} onFinished={() => setEntered(true)} />;
  return <Portfolio />;
}

export default App;
