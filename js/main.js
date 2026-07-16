/* ============================================================
   摄影作品集模板 v3 — 幻灯片 + 图片链接
   日常不需要改这个文件,内容都在 data/config.json 里配置。

   images 列表支持两种写法(可混用):
     "emitt-1.jpg"
     { "file": "emitt-2.jpg", "link": "https://...", "linkText": "查看原笔记 →" }
   带 link 的图片会在图片下方显示可点击的链接文字,
   点击图片本身仍然是翻页。
   ============================================================ */

(async function () {
  const content = document.getElementById("content");

  let cfg;
  try {
    const res = await fetch("data/config.json?v=" + Date.now());
    if (!res.ok) throw new Error(res.status);
    cfg = await res.json();
  } catch (e) {
    content.innerHTML =
      '<p style="color:#c00;padding:64px 56px">无法读取 data/config.json,请检查 JSON 格式是否正确。</p>';
    return;
  }

  /* ---------- 应用布局参数 ---------- */
  const L = cfg.layout || {};
  const root = document.documentElement.style;
  if (L.accentColor)   root.setProperty("--accent", L.accentColor);
  if (L.sidebarWidth)  root.setProperty("--sidebar-width", L.sidebarWidth + "px");
  if (L.imageMaxWidth) root.setProperty("--image-max-width", L.imageMaxWidth + "px");
  if (L.fontScale)     root.setProperty("--font-scale", L.fontScale);

  /* ---------- 站点名称 ---------- */
  document.title = cfg.site.title || "Portfolio";
  document.getElementById("siteName").textContent = cfg.site.nameZh || "";
  document.getElementById("siteNameEn").textContent = cfg.site.nameEn || "";
  document.getElementById("mobileName").textContent = cfg.site.nameZh || "";

  /* ---------- 收集项目 ---------- */
  const pages = [];
  (cfg.groups || []).forEach((g) =>
    (g.projects || []).forEach((p) => pages.push(p))
  );

  /* ---------- 左侧导航 ---------- */
  const navGroups = document.getElementById("navGroups");
  (cfg.groups || []).forEach((g) => {
    const div = document.createElement("div");
    div.className = "nav-group";
    if (g.name) {
      const title = document.createElement("div");
      title.className = "nav-group-title";
      title.textContent = g.name;
      div.appendChild(title);
    }
    (g.projects || []).forEach((p) => {
      const a = document.createElement("a");
      a.className = "nav-link";
      a.href = "#" + p.id;
      a.dataset.id = p.id;
      a.textContent = p.title;
      div.appendChild(a);
    });
    navGroups.appendChild(div);
  });

  if (cfg.about) {
    const div = document.createElement("div");
    div.className = "nav-group";
    const title = document.createElement("div");
    title.className = "nav-group-title";
    title.textContent = "Info";
    const a = document.createElement("a");
    a.className = "nav-link";
    a.href = "#about";
    a.dataset.id = "about";
    a.textContent = (cfg.about && cfg.about.title) || "About";
    div.appendChild(title);
    div.appendChild(a);
    navGroups.appendChild(div);
  }

  /* ---------- 页码指示器 ---------- */
  const counter = document.createElement("div");
  counter.className = "slide-counter";
  document.body.appendChild(counter);

  /* ---------- 生成项目幻灯片 ---------- */
  content.innerHTML = "";
  const state = {}; // id -> { index, total, slides }

  pages.forEach((p) => {
    const sec = document.createElement("section");
    sec.className = "project slideshow";
    sec.id = "page-" + p.id;

    const slides = [];

    if (p.description && p.description.trim()) {
      const s = document.createElement("div");
      s.className = "slide";
      const box = document.createElement("div");
      box.className = "slide-text";
      const h = document.createElement("h1");
      h.textContent = p.title;
      const d = document.createElement("p");
      d.textContent = p.description;
      box.appendChild(h);
      box.appendChild(d);
      s.appendChild(box);
      slides.push(s);
    }

    (p.images || []).forEach((item, i) => {
      // 兼容两种写法:"文件名" 或 { file, link, linkText }
      const info = typeof item === "string" ? { file: item } : (item || {});
      if (!info.file) return;

      const s = document.createElement("div");
      s.className = "slide";

      const fig = document.createElement("figure");
      fig.className = "slide-figure" + (info.link ? " has-link" : "");

      const img = document.createElement("img");
      img.loading = i < 2 ? "eager" : "lazy";
      img.src = (p.folder || "") + "/" + info.file;
      img.alt = p.title + " " + (i + 1);
      fig.appendChild(img);

      if (info.link) {
        const a = document.createElement("a");
        a.className = "slide-link";
        a.href = info.link;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = info.linkText || "查看链接 →";
        fig.appendChild(a);
      }

      s.appendChild(fig);
      slides.push(s);
    });

    slides.forEach((s) => sec.appendChild(s));
    state[p.id] = { index: 0, total: slides.length, slides };

    // 左右点击翻页区
    const prevZone = document.createElement("div");
    prevZone.className = "slide-zone prev";
    prevZone.addEventListener("click", () => step(p.id, -1));
    const nextZone = document.createElement("div");
    nextZone.className = "slide-zone next";
    nextZone.addEventListener("click", () => step(p.id, 1));
    sec.appendChild(prevZone);
    sec.appendChild(nextZone);

    // 触摸滑动
    let touchX = null;
    sec.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    sec.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) step(p.id, dx < 0 ? 1 : -1);
      touchX = null;
    }, { passive: true });

    content.appendChild(sec);
  });

  function renderSlides(id) {
    const st = state[id];
    if (!st) return;
    st.slides.forEach((s, i) => s.classList.toggle("current", i === st.index));
    counter.textContent = (st.index + 1) + " / " + st.total;
  }

  function step(id, dir) {
    const st = state[id];
    if (!st || st.total === 0) return;
    st.index = (st.index + dir + st.total) % st.total;
    renderSlides(id);
  }

  /* ---------- 简介页 ---------- */
  if (cfg.about) {
    const sec = document.createElement("section");
    sec.className = "project page";
    sec.id = "page-about";

    const h = document.createElement("h1");
    h.className = "project-title";
    h.textContent = cfg.about.title || "About";
    sec.appendChild(h);

    const wrap = document.createElement("div");
    wrap.className = "about-wrap";

    const text = document.createElement("div");
    text.className = "about-text";
    text.textContent = cfg.about.bio || "";

    const c = cfg.about.contact || {};
    const contact = document.createElement("div");
    contact.className = "contact-block";
    contact.innerHTML = '<div class="contact-title">Contact</div>';
    [c.phone, c.email, c.extra].filter(Boolean).forEach((line) => {
      const p = document.createElement("div");
      p.textContent = line;
      contact.appendChild(p);
    });
    text.appendChild(contact);

    if (cfg.site.footer) {
      const f = document.createElement("div");
      f.className = "site-footer";
      f.textContent = cfg.site.footer;
      text.appendChild(f);
    }

    wrap.appendChild(text);

    if (cfg.about.portrait) {
      const port = document.createElement("div");
      port.className = "about-portrait";
      const img = document.createElement("img");
      img.src = cfg.about.portrait;
      img.alt = cfg.site.nameZh || "portrait";
      img.loading = "lazy";
      port.appendChild(img);
      wrap.appendChild(port);
    }

    sec.appendChild(wrap);
    content.appendChild(sec);
  }

  /* ---------- 页面切换 ---------- */
  const firstId =
    (cfg.site && cfg.site.homePage) ||
    (pages.length ? pages[0].id : "about");

  let activeId = null;

  function show(id) {
    const target = document.getElementById("page-" + id);
    if (!target) return show(firstId);
    activeId = id;
    document.querySelectorAll(".project").forEach((s) => s.classList.remove("visible"));
    target.classList.add("visible");
    document.querySelectorAll(".nav-link").forEach((a) =>
      a.classList.toggle("active", a.dataset.id === id)
    );
    if (state[id]) {
      counter.classList.add("visible");
      renderSlides(id);
    } else {
      counter.classList.remove("visible");
    }
    window.scrollTo({ top: 0 });
    sidebar.classList.remove("open");
  }

  window.addEventListener("hashchange", () =>
    show(location.hash.replace("#", "") || firstId)
  );
  show(location.hash.replace("#", "") || firstId);

  /* ---------- 键盘翻页 ---------- */
  document.addEventListener("keydown", (e) => {
    if (!activeId || !state[activeId]) return;
    if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); step(activeId, 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(activeId, -1); }
  });

  /* ---------- 移动端菜单 ---------- */
  const sidebar = document.getElementById("sidebar");
  document.getElementById("menuToggle").addEventListener("click", () =>
    sidebar.classList.toggle("open")
  );
})();
