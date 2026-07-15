/* ============================================================
   日常不需要改这个文件。
   所有内容和布局都在 data/config.json 里配置。
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
      '<p style="color:#c00">无法读取 data/config.json。<br>' +
      "如果你是直接双击打开 index.html,浏览器会拦截本地文件读取;<br>" +
      "请部署到 GitHub Pages 后访问,或本地用 VS Code 的 Live Server 预览。</p>";
    return;
  }

  /* ---------- 应用布局参数 ---------- */
  const L = cfg.layout || {};
  const root = document.documentElement.style;
  if (L.accentColor)   root.setProperty("--accent", L.accentColor);
  if (L.sidebarWidth)  root.setProperty("--sidebar-width", L.sidebarWidth + "px");
  if (L.imageMaxWidth) root.setProperty("--image-max-width", L.imageMaxWidth + "px");
  if (L.imageGap != null) root.setProperty("--image-gap", L.imageGap + "px");
  if (L.fontScale)     root.setProperty("--font-scale", L.fontScale);
  root.setProperty("--columns", L.columns || 1);
  document.body.dataset.theme = L.theme === "dark" ? "dark" : "light";

  /* ---------- 站点名称 ---------- */
  document.title = cfg.site.title || "Portfolio";
  document.getElementById("siteName").textContent = cfg.site.nameZh || "";
  document.getElementById("siteNameEn").textContent = cfg.site.nameEn || "";
  document.getElementById("mobileName").textContent = cfg.site.nameZh || "";

  /* ---------- 收集所有页面(项目 + 简介) ---------- */
  const pages = [];
  (cfg.groups || []).forEach((g) =>
    (g.projects || []).forEach((p) => pages.push({ ...p, group: g.name }))
  );

  /* ---------- 生成左侧导航 ---------- */
  const navGroups = document.getElementById("navGroups");
  (cfg.groups || []).forEach((g) => {
    const div = document.createElement("div");
    div.className = "nav-group";
    const title = document.createElement("div");
    title.className = "nav-group-title";
    title.textContent = g.name;
    div.appendChild(title);
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

  // Info / 简介
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
    a.textContent = cfg.about.title || "About";
    div.appendChild(title);
    div.appendChild(a);
    navGroups.appendChild(div);
  }

  /* ---------- 生成项目页面 ---------- */
  content.innerHTML = "";
  pages.forEach((p) => {
    const sec = document.createElement("section");
    sec.className = "project";
    sec.id = "page-" + p.id;

    const h = document.createElement("h1");
    h.className = "project-title";
    h.textContent = p.title;
    sec.appendChild(h);

    if (p.description) {
      const d = document.createElement("p");
      d.className = "project-desc";
      d.textContent = p.description;
      sec.appendChild(d);
    }

    const flow = document.createElement("div");
    flow.className = "image-flow";
    (p.images || []).forEach((file, i) => {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = (p.folder || "") + "/" + file;
      img.alt = p.title + " " + (i + 1);
      img.addEventListener("click", () => openLightbox(img.src));
      flow.appendChild(img);
    });
    sec.appendChild(flow);
    content.appendChild(sec);
  });

  /* ---------- 简介页面 ---------- */
  if (cfg.about) {
    const sec = document.createElement("section");
    sec.className = "project";
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
  const firstId = pages.length ? pages[0].id : "about";

  function show(id) {
    const target = document.getElementById("page-" + id);
    if (!target) return show(firstId);
    document.querySelectorAll(".project").forEach((s) => s.classList.remove("visible"));
    target.classList.add("visible");
    document.querySelectorAll(".nav-link").forEach((a) =>
      a.classList.toggle("active", a.dataset.id === id)
    );
    window.scrollTo({ top: 0 });
    sidebar.classList.remove("open");
  }

  window.addEventListener("hashchange", () =>
    show(location.hash.replace("#", "") || firstId)
  );
  show(location.hash.replace("#", "") || firstId);

  /* ---------- 移动端菜单 ---------- */
  const sidebar = document.getElementById("sidebar");
  document.getElementById("menuToggle").addEventListener("click", () =>
    sidebar.classList.toggle("open")
  );

  /* ---------- 图片放大 ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }
  lightbox.addEventListener("click", () => {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) lightbox.click();
  });
})();
