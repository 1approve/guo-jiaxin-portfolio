import { useEffect, useState } from 'react';

const projects = [
  {
    number: '01',
    category: 'AIGC 微短剧',
    title: '《一灯渡众生》',
    role: '导演 · 生成统筹 · 剪辑后期',
    description: '将传统文化题材拆解为 54 个可执行镜头，以参考图、首尾帧和提示词约束角色、服饰、空间与核心道具，完成约 3 分 20 秒成片。',
    image: './assets/project-lantern.svg',
    stats: ['54 SHOTS', '03:20 FILM'],
  },
  {
    number: '02',
    category: '文创产品与数字体验',
    title: '《一叶生长》',
    role: '品牌概念 · 视觉统筹 · 跨媒介体验',
    description: '将茶叶、叶脉与雅安地域文化转化为统一品牌表达，覆盖茶罐、明信片、雨伞、展板及扫码数字内容体验。',
    image: './assets/project-tea.svg',
    stats: ['CULTURE', 'SYSTEM'],
  },
  {
    number: '03',
    category: '剧情短片',
    title: '《慢度朝夕》',
    role: '导演 · 编剧 · 摄影 · 后期',
    description: '围绕人物关系与校园空间组织景别、机位、表演状态和现场调度，完成约 5 分钟校园剧情短片。',
    image: './assets/project-campus.svg',
    stats: ['05:00 FILM', 'LIVE ACTION'],
  },
  {
    number: '04',
    category: '视觉系统',
    title: '成都城市文化视觉转译',
    role: '文化调研 · 图形设计 · 系列海报',
    description: '从五处成都文化地标提炼识别元素，建立统一构图、字体、色彩和版式规范，形成系列海报方案。',
    image: './assets/project-chengdu.svg',
    stats: ['05 POSTERS', 'ACP'],
  },
];

const strengths = [
  ['01', '导演与分镜', '把文本拆成行动、情绪、景别和镜头衔接，形成可执行的画面方案。'],
  ['02', '生成连续性', '通过参考图、首尾帧、固定人物关系和空间参照，逐镜控制跳变与漂移。'],
  ['03', '剪辑与交付', '从素材管理、镜头衔接到节奏、字幕、声音和成片校对，推进完整交付。'],
  ['04', '视觉系统', '用统一色彩、图形和版式语言连接影像、海报、产品与数字体验。'],
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-lock', menuOpen);
    return () => document.body.classList.remove('menu-lock');
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main">跳到主要内容</a>

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="brand" href="#top" onClick={closeMenu} aria-label="返回首页">
          <span>GJX</span><i aria-hidden="true" />
        </a>
        <nav className={menuOpen ? 'is-open' : ''} aria-label="主要导航">
          <a href="#profile" onClick={closeMenu}>经历</a>
          <a href="#projects" onClick={closeMenu}>项目</a>
          <a href="#strengths" onClick={closeMenu}>优势</a>
          <a href="#contact" onClick={closeMenu}>联系</a>
        </nav>
        <a className="header-contact" href="mailto:13648187093@163.com">LET'S TALK <Arrow /></a>
        <button
          className={`menu-button ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? '关闭导航' : '打开导航'}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <i /><i />
        </button>
      </header>

      <main id="main">
        <section id="top" className="hero">
          <video className="hero-video" autoPlay muted loop playsInline poster="./assets/project-lantern.svg">
            <source src="./assets/hero-loop.mp4" type="video/mp4" />
          </video>
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orbit" aria-hidden="true"><i /><i /><i /></div>

          <div className="hero-content page-shell">
            <p className="kicker" data-reveal><span>AVAILABLE FOR INTERNSHIP</span> / 2026</p>
            <h1 data-reveal>
              <span>AIGC</span>
              <span>视频创作</span>
              <em>实习生</em>
            </h1>
            <div className="hero-bottom" data-reveal>
              <p>从脚本、视觉设定与镜头生成，到真人拍摄、剪辑合成和最终交付。</p>
              <a className="circle-link" href="#projects" aria-label="查看精选项目"><span>VIEW<br />WORK</span><Arrow /></a>
            </div>
          </div>

          <div className="hero-side" aria-hidden="true">
            <span>DIRECT</span><span>GENERATE</span><span>EDIT</span>
          </div>
          <p className="hero-scroll">SCROLL TO EXPLORE <span>↓</span></p>
        </section>

        <section id="profile" className="profile section-space">
          <div className="page-shell">
            <header className="section-header" data-reveal>
              <p className="section-label">01 / PROFILE</p>
              <h2>不只生成画面，<br />也负责让画面成立。</h2>
            </header>

            <div className="profile-layout">
              <div className="portrait-card" data-reveal>
                <img src="./assets/guo-jiaxin.jpg" alt="郭佳鑫肖像" />
                <span className="portrait-code">GJX / PORTFOLIO</span>
                <span className="portrait-role">AIGC VIDEO CREATOR</span>
              </div>

              <div className="profile-copy" data-reveal>
                <p className="profile-intro">郭佳鑫，数字媒体艺术本科在读。关注 AIGC 影像从创意拆解、视觉设定到成片交付的完整链路，也具备真人短片拍摄和校园宣传视频制作经验。</p>

                <dl className="profile-meta">
                  <div><dt>EDUCATION</dt><dd>成都美术学院<br />数字媒体艺术 · 本科</dd></div>
                  <div><dt>FOCUS</dt><dd>AIGC 视频创作<br />导演与剪辑后期</dd></div>
                  <div><dt>CONTACT</dt><dd><a href="mailto:13648187093@163.com">13648187093@163.com</a><br />成都</dd></div>
                </dl>

                <div className="profile-stats" aria-label="项目数据">
                  <div><strong>54</strong><span>镜头叙事拆解</span></div>
                  <div><strong>03:20</strong><span>AIGC 成片</span></div>
                  <div><strong>80</strong><span>镜头拉片分析</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="projects section-space">
          <div className="page-shell">
            <header className="section-header project-heading" data-reveal>
              <p className="section-label">02 / SELECTED PROJECTS</p>
              <h2>精选项目</h2>
              <p>每个项目都从一个明确的问题开始：如何控制风格、连续性、节奏与传播表达。</p>
            </header>

            <div className="project-list">
              {projects.map((project) => (
                <article className="project-card" key={project.number} data-reveal>
                  <div className="project-image">
                    <img src={project.image} alt={`${project.title}项目概念视觉`} />
                    <span>PROJECT VISUAL CONCEPT</span>
                  </div>
                  <div className="project-info">
                    <div className="project-topline"><span>{project.number}</span><span>{project.category}</span></div>
                    <h3>{project.title}</h3>
                    <p className="project-role">{project.role}</p>
                    <p>{project.description}</p>
                    <div className="project-stats">{project.stats.map((stat) => <span key={stat}>{stat}</span>)}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="strengths" className="strengths section-space">
          <div className="page-shell">
            <header className="section-header" data-reveal>
              <p className="section-label">03 / STRENGTHS</p>
              <h2>一套可推进、<br />可复用的创作方法。</h2>
            </header>
            <div className="strength-grid">
              {strengths.map(([number, title, copy]) => (
                <article key={number} data-reveal>
                  <span>{number}</span>
                  <div className="strength-icon" aria-hidden="true"><i /><i /></div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
            <div className="tool-line" data-reveal>
              <span>TOOLS</span>
              <p>ChatGPT · Codex · 即梦 · Workbody Cloud · Photoshop · Illustrator · 剪映</p>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="contact-grid" aria-hidden="true" />
          <div className="contact-glow" aria-hidden="true" />
          <div className="page-shell contact-content">
            <p className="section-label" data-reveal>04 / CONTACT</p>
            <p className="contact-eyebrow" data-reveal>AIGC VIDEO CREATION INTERNSHIP</p>
            <h2 data-reveal>让下一个故事<br />从一帧开始。</h2>
            <a className="contact-email" href="mailto:13648187093@163.com" data-reveal>
              <span>13648187093@163.com</span><Arrow />
            </a>
            <div className="contact-footer">
              <span>GUO JIAXIN © {new Date().getFullYear()}</span>
              <span>CHENGDU / CHINA</span>
              <a href="#top">BACK TO TOP ↑</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
