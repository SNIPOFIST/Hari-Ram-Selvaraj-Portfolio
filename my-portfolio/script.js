const canvas = document.getElementById("particles");
const context = canvas.getContext("2d");
const trailCanvas = document.getElementById("cursor-trail");
const trailContext = trailCanvas?.getContext("2d");
const dpr = window.devicePixelRatio || 1;
const toggleLinks = [...document.querySelectorAll(".top-toggle-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const themeToggle = document.querySelector(".theme-toggle");
const tocLinks = [...document.querySelectorAll(".toc-link")];
const aboutSection = document.getElementById("about");
const projectCards = [...document.querySelectorAll("[data-project-card]")];
const roleTrack = document.querySelector(".role-track");
const taglineLine = document.getElementById("home-tagline-line");
const contactForm = document.getElementById("contact-form");
const contactFormStatus = document.getElementById("contact-form-status");
const PORTFOLIO_EMAIL = "Hselvara@syr.edu";
const iconGlows = [...document.querySelectorAll("[data-icon-glow]")];
const aboutToc = document.getElementById("about-toc");
const tocSectionLinks = [...document.querySelectorAll(".about-toc .toc-link")];
const projectsSection = document.getElementById("projects");
const projectDetail = document.getElementById("project-detail");
const detailPanel = document.querySelector(".project-detail-panel");
const detailCloseButtons = [...document.querySelectorAll("[data-detail-close]")];
const detailTitle = document.getElementById("detail-title");
const detailSubtitle = document.getElementById("detail-subtitle");
const detailDescription = document.getElementById("detail-description");
const detailHighLevelCopy = document.getElementById("detail-high-level-copy");
const detailFeaturesList = document.getElementById("detail-features-list");
const detailDatasetsSection = document.getElementById("detail-datasets");
const detailDatasetsList = document.getElementById("detail-datasets-list");
const detailLive = document.getElementById("detail-live");
const detailStack = document.getElementById("detail-stack");
const homeSection = document.getElementById("home");
const scrollCue = document.getElementById("scroll-cue");
const syracuseTime = document.getElementById("syracuse-time");
const aboutBlocks = ["Work Experience", "Studies", "Technical Skills"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const circles = [];
const meteors = [];
const cursorTrail = [];
const mouse = { x: 0, y: 0 };
const canvasSize = { w: 0, h: 0 };

const quantity = 140;
const staticity = 50;
const ease = 50;

let scrollDriftY = 0;
let lastScrollY = window.scrollY;
let nextMeteorAt = performance.now() + 9000 + Math.random() * 12000;
let lastCursorPoint = null;
let roleIndex = 0;
const homeTaglineSentences = [
  "Building machine learning models that turn complex data into predictions teams trust and deploy.",
  "Developing AI RAG applications that retrieve the right context for grounded, explainable answers.",
  "Engineering machine learning pipelines from ingestion and features through training and deployment.",
  "Applying data analysis and statistical tests to validate hypotheses and measure real-world impact.",
];
let particleMode = document.documentElement.dataset.theme === "light" ? "falling" : "normal";
let activeProjectCard = null;
let isDetailAnimating = false;
let canvasPalette = {
  star: "255, 255, 255",
  meteorHead: "255, 255, 255",
  meteorMid: "196, 181, 253",
};

const projectDetailsById = {
  1: {
    github: "https://github.com/SNIPOFIST/Bitcoin-FlashCrash-Prediction",
    live: "https://github.com/SNIPOFIST/Bitcoin-FlashCrash-Prediction",
    stack: "Python, PyTorch, scikit-learn, Pandas, VADER, FinBERT",
    highLevel:
      "Built a binary sequence model to detect Bitcoin flash-crash minutes by combining minute-level market behavior (from 3.4M second-level BTC records) with 11,890 time-aligned Reddit sentiment rows for interpretable risk monitoring.",
    datasets: [
      "Bitcoin market data: 3.4 million records at second-level resolution, aggregated to minute-level OHLCV bars and engineered features for 60-minute sequence modeling.",
      "Reddit sentiment: 11,890 scored posts and comments from crypto subreddits, aligned to market minutes with per-subreddit VADER aggregates (FinBERT scoring in parallel experiments).",
    ],
    features: [
      "Threshold 0.4 run in BTC_Vader.ipynb reaches test accuracy 0.7095 with class 1.0 F1 around 0.74 and class 0.0 F1 around 0.67.",
      "Threshold 0.3 run reports 0.6756 accuracy, illustrating precision/recall tradeoffs for imbalanced flash_crash detection.",
      "Saved notebook output includes final batched test accuracy 0.7095 and confusion-matrix-based class report across 56,792 test sequences.",
    ],
  },
  2: {
    github: "https://github.com/SNIPOFIST/Deep_Learning-Drowsiness_Detection_Using_Infrared_Images",
    live: "https://snipofist.github.io/Deep_Learning-Drowsiness_Detection_Using_Infrared_Images/",
    stack: "TensorFlow, Python, NumPy, Pandas, Matplotlib, scikit-learn, OpenCV, Pillow, dlib",
    highLevel:
      "Developed an infrared eye-image drowsiness classifier that predicts awake vs sleepy states, creating a practical foundation for in-cabin driver alert systems.",
    features: [
      "Classifies infrared eye-region crops into awake vs sleepy classes to support drowsiness risk monitoring.",
      "Trained on the MRL Eye Dataset (~84,898 images) with balanced train/val/test splits and grayscale preprocessing at 64x64.",
      "Baseline CNN run reports 98.59% test accuracy with macro F1 near 0.99, alongside confusion-matrix and ROC/AUC analysis.",
    ],
  },
  3: {
    github: "https://github.com/SNIPOFIST/DataThon26",
    live: "https://snipofist.github.io/DataThon26/",
    stack: "Python, Jupyter, pandas, NumPy, scikit-learn, Matplotlib, Seaborn, GeoPandas, Folium, Shapely",
    highLevel:
      "Merged Syracuse violations with assessment data to build analysis and geospatial risk views that help stakeholders identify patterns and prioritize inspections.",
    features: [
      "Joins Syracuse code violations to the 2025 assessment roll on SBL (~140k violation rows, ~41k parcels) with EDA on volume, complaint types, neighborhoods, and open vs closed.",
      "Track A: sklearn Pipeline with ColumnTransformer for OLS regression on Assess_Total_Assessment; notebook Code_Violations_Assessment_Merge.ipynb.",
      "Track B: city grid with crime, violations, vacancy, and assessment signals; Random Forest to Folium maps on GitHub Pages (grid risk, prediction dashboard, vacancy, confusion).",
    ],
  },
  4: {
    github: "https://github.com/SNIPOFIST/Syracuse_City_Crime_Data_Visualization",
    live: "https://mydatasciencegallery.shinyapps.io/Syracuse_Crime_Data_Visualization/",
    stack: "R, Shiny, Leaflet, ggplot2, tidyverse, dplyr, sf, jsonlite",
    highLevel:
      "Created an interactive Shiny dashboard for Syracuse crime exploration, enabling map-based and time-based analysis for faster public-safety insight.",
    features: [
      "Built an interactive R Shiny dashboard to filter Syracuse incidents by crime type and date, then visualize them on a Leaflet map and daily time-series chart.",
      "Ingests and harmonizes two city open-data CSV files (merged snapshot 9,671 x 10) and parses DATEEND for date-driven analytics.",
      "Supports residents and analysts with quick map-based exploration of public safety patterns while keeping workflows transparent and reproducible.",
    ],
  },
  5: {
    github: "https://github.com/SNIPOFIST/MediExplain---RAG-with-Modular-AI-assistants-Chatbot",
    live: "https://github.com/SNIPOFIST/MediExplain---RAG-with-Modular-AI-assistants-Chatbot",
    stack: "Python, Streamlit, OpenAI API, ChromaDB, NLP pipelines",
    highLevel:
      "MediExplain is a research-grade Streamlit app that simplifies medical text for patients, grounds explanations with RAG over PMC-style literature in Chroma, and runs modular AI assistants for synthetic clinical workflow demos.",
    datasets: [
      "PMC HTML articles (local mediexplain/html/) indexed into a persistent Chroma vector store for literature-grounded retrieval.",
      "OpenAI chat and text-embedding-3-small models for explanations, embeddings, and multi-step synthetic patient record generation.",
      "Medication RAG knowledge stores (project-specific indexes under meds_rag modules) for drug-focused retrieval experiments.",
    ],
    features: [
      "Converts dense clinical language into patient-friendly explanations with clear non-medical-advice guardrails.",
      "Uses retrieval over indexed medical literature to ground responses and improve transparency.",
      "Implements modular assistant steps for synthetic record generation, validation, and educational demonstrations.",
    ],
  },
  6: {
    github: "https://github.com/",
    live: "https://github.com/",
    stack: "JavaScript, Node.js",
    features: ["Developed interactive front-end workflow.", "Connected APIs with resilient handling.", "Improved usability with microinteractions."],
  },
};

function syncCanvasPalette() {
  const styles = getComputedStyle(document.documentElement);
  canvasPalette = {
    star: styles.getPropertyValue("--star-rgb").trim() || "255, 255, 255",
    meteorHead: styles.getPropertyValue("--meteor-head-rgb").trim() || "255, 255, 255",
    meteorMid: styles.getPropertyValue("--meteor-mid-rgb").trim() || "196, 181, 253",
  };
}

function resizeCanvas() {
  canvasSize.w = window.innerWidth;
  canvasSize.h = window.innerHeight;
  circles.length = 0;

  canvas.width = canvasSize.w * dpr;
  canvas.height = canvasSize.h * dpr;
  canvas.style.width = `${canvasSize.w}px`;
  canvas.style.height = `${canvasSize.h}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawParticles();
}

function resizeTrailCanvas() {
  if (!trailCanvas || !trailContext) return;
  trailCanvas.width = window.innerWidth * dpr;
  trailCanvas.height = window.innerHeight * dpr;
  trailCanvas.style.width = `${window.innerWidth}px`;
  trailCanvas.style.height = `${window.innerHeight}px`;
  trailContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function circleParams() {
  return {
    x: Math.floor(Math.random() * canvasSize.w),
    y: Math.floor(Math.random() * canvasSize.h),
    translateX: 0,
    translateY: 0,
    size: Math.floor(Math.random() * 2) + 0.1,
    alpha: 0,
    targetAlpha: Number((Math.random() * 0.6 + 0.1).toFixed(1)),
    dx: (Math.random() - 0.5) * 0.2,
    dy: (Math.random() - 0.5) * 0.2,
    magnetism: 0.1 + Math.random() * 4,
    fallVelocity: 0,
    fallDriftX: (Math.random() - 0.5) * 0.35,
    grounded: false,
    rollVelocity: 0,
  };
}

function drawCircle(circle, push = false) {
  context.save();
  context.translate(circle.translateX, circle.translateY);
  context.beginPath();
  context.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
  context.fillStyle = `rgba(${canvasPalette.star}, ${circle.alpha})`;
  context.fill();
  context.restore();

  if (push) {
    circles.push(circle);
  }
}

function drawParticles() {
  context.clearRect(0, 0, canvasSize.w, canvasSize.h);
  for (let i = 0; i < quantity; i += 1) {
    drawCircle(circleParams(), true);
  }
}

function createMeteor() {
  const startFromRight = Math.random() > 0.5;
  return {
    x: startFromRight ? canvasSize.w + 120 : Math.random() * canvasSize.w * 0.35,
    y: Math.random() * canvasSize.h * 0.35 + 20,
    vx: startFromRight ? -(7 + Math.random() * 3) : 7 + Math.random() * 3,
    vy: 4 + Math.random() * 2.5,
    length: 70 + Math.random() * 220,
    life: 0,
    ttl: 55 + Math.random() * 18,
    size: 0.35 + Math.random() * 2.15,
  };
}

function drawMeteor(meteor) {
  const tailX = meteor.x - meteor.vx * (meteor.length / 12);
  const tailY = meteor.y - meteor.vy * (meteor.length / 12);
  const gradient = context.createLinearGradient(meteor.x, meteor.y, tailX, tailY);

  gradient.addColorStop(0, `rgba(${canvasPalette.meteorHead}, 0.95)`);
  gradient.addColorStop(0.15, `rgba(${canvasPalette.meteorMid}, 0.8)`);
  gradient.addColorStop(1, `rgba(${canvasPalette.meteorHead}, 0)`);

  context.save();
  context.lineWidth = meteor.size;
  context.lineCap = "round";
  context.strokeStyle = gradient;
  context.beginPath();
  context.moveTo(meteor.x, meteor.y);
  context.lineTo(tailX, tailY);
  context.stroke();

  context.beginPath();
  context.fillStyle = `rgba(${canvasPalette.meteorHead}, 1)`;
  context.arc(meteor.x, meteor.y, meteor.size * 1.1, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function updateMeteors(now) {
  if (particleMode !== "normal") {
    meteors.length = 0;
    return;
  }

  if (now >= nextMeteorAt) {
    meteors.push(createMeteor());
    nextMeteorAt = now + 12000 + Math.random() * 20000;
  }

  for (let i = meteors.length - 1; i >= 0; i -= 1) {
    const meteor = meteors[i];
    meteor.x += meteor.vx;
    meteor.y += meteor.vy + scrollDriftY * 1.3;
    meteor.life += 1;

    drawMeteor(meteor);

    if (
      meteor.life > meteor.ttl ||
      meteor.x < -meteor.length ||
      meteor.x > canvasSize.w + meteor.length ||
      meteor.y > canvasSize.h + meteor.length
    ) {
      meteors.splice(i, 1);
    }
  }
}

function remapValue(value, start1, end1, start2, end2) {
  const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
  return remapped > 0 ? remapped : 0;
}

function animate(now) {
  context.clearRect(0, 0, canvasSize.w, canvasSize.h);

  for (let i = 0; i < circles.length; i += 1) {
    const circle = circles[i];

    const edges = [
      circle.x + circle.translateX - circle.size,
      canvasSize.w - circle.x - circle.translateX - circle.size,
      circle.y + circle.translateY - circle.size,
      canvasSize.h - circle.y - circle.translateY - circle.size,
    ];
    const closestEdge = edges.reduce((a, b) => Math.min(a, b));
    const remappedEdge = Number(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));

    if (remappedEdge > 1) {
      circle.alpha += 0.02;
      if (circle.alpha > circle.targetAlpha) {
        circle.alpha = circle.targetAlpha;
      }
    } else {
      circle.alpha = circle.targetAlpha * remappedEdge;
    }

    if (particleMode === "falling") {
      const floorY = canvasSize.h - circle.size - 2;
      if (!circle.grounded) {
        circle.fallVelocity += 0.24 + Math.random() * 0.03;
        circle.x += circle.fallDriftX;
        circle.y += circle.fallVelocity;
        circle.translateX *= 0.9;
        circle.translateY *= 0.9;
        if (circle.y >= floorY) {
          circle.y = floorY;
          circle.grounded = true;
          circle.fallVelocity = 0;
          circle.rollVelocity = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 2.8);
        }
      } else {
        circle.x += circle.rollVelocity;
        circle.rollVelocity *= 1.01;
        circle.alpha *= 0.99;
      }
    } else {
      circle.x += circle.dx;
      circle.y += circle.dy + scrollDriftY;
      circle.translateX += (mouse.x / (staticity / circle.magnetism) - circle.translateX) / ease;
      circle.translateY += (mouse.y / (staticity / circle.magnetism) - circle.translateY) / ease;
    }

    if (
      circle.x < -circle.size ||
      circle.x > canvasSize.w + circle.size ||
      circle.y < -circle.size
    ) {
      circles.splice(i, 1);
      if (particleMode === "normal") {
        const replacement = circleParams();
        replacement.y = canvasSize.h + replacement.size + Math.random() * 40;
        drawCircle(replacement, true);
      }
      i -= 1;
    } else if (circle.y > canvasSize.h + circle.size) {
      circles.splice(i, 1);
      if (particleMode === "normal") {
        const replacement = circleParams();
        replacement.y = -replacement.size - Math.random() * 40;
        drawCircle(replacement, true);
      }
      i -= 1;
    } else {
      drawCircle(circle, false);
    }
  }

  updateMeteors(now);
  if (trailContext) {
    trailContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = cursorTrail.length - 1; i >= 0; i -= 1) {
      const streak = cursorTrail[i];
      streak.life -= 1;
      if (streak.life <= 0) {
        cursorTrail.splice(i, 1);
        continue;
      }
      const alpha = streak.life / streak.maxLife;
      const gradient = trailContext.createLinearGradient(streak.toX, streak.toY, streak.fromX, streak.fromY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
      gradient.addColorStop(0.25, `rgba(156, 206, 255, ${alpha * 0.75})`);
      gradient.addColorStop(1, `rgba(125, 181, 255, 0)`);

      trailContext.beginPath();
      trailContext.lineCap = "round";
      trailContext.lineWidth = streak.width * alpha;
      trailContext.strokeStyle = gradient;
      trailContext.moveTo(streak.fromX, streak.fromY);
      trailContext.lineTo(streak.toX, streak.toY);
      trailContext.stroke();

      trailContext.beginPath();
      trailContext.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      trailContext.arc(streak.toX, streak.toY, Math.max(0.6, streak.width * 0.45 * alpha), 0, Math.PI * 2);
      trailContext.fill();

    }
  }
  scrollDriftY *= 0.92;
  window.requestAnimationFrame(animate);
}

function updateActiveToggle() {
  let current = "home";

  for (const section of sections) {
    if (window.scrollY >= section.offsetTop - 160) {
      current = section.id;
    }
  }

  for (const link of toggleLinks) {
    const target = link.getAttribute("href").slice(1);
    link.classList.toggle("is-active", target === current);
  }
}

function updateAboutVisibility(entries) {
  for (const entry of entries) {
    if (entry.target !== aboutSection) continue;

    if (entry.isIntersecting && entry.intersectionRatio > 0.18) {
      aboutSection.classList.add("is-active");
      aboutSection.classList.remove("is-leaving");
    } else {
      aboutSection.classList.remove("is-active");
      aboutSection.classList.add("is-leaving");
    }
  }
}

function updateNebulaState() {
  if (aboutBlocks.length === 0) return;
  if (!aboutSection?.classList.contains("is-active")) {
    for (const link of tocSectionLinks) {
      link.classList.remove("is-current");
      link.style.setProperty("--focus", "0");
    }
    return;
  }

  let activeLabel = "Work Experience";
  for (const block of aboutBlocks) {
    const rect = block.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.34 && rect.bottom > window.innerHeight * 0.2) {
      activeLabel = block.id;
    }
  }

  for (const link of tocSectionLinks) {
    const targetId = link.dataset.target;
    const block = aboutBlocks.find((item) => item.id === targetId);
    if (block) {
      const rect = block.getBoundingClientRect();
      const marker = window.innerHeight * 0.3;
      const distance = Math.abs(rect.top - marker);
      const focus = Math.max(0, 1 - distance / (window.innerHeight * 0.55));
      link.style.setProperty("--focus", focus.toFixed(3));
    }

    link.classList.toggle("is-current", targetId === activeLabel);
  }
}

function scrollToTarget(id, offset = 80) {
  const element = document.getElementById(id);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - offset;
  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

function updateHomeScrollFx() {
  if (!homeSection || !scrollCue) return;
  const homeRect = homeSection.getBoundingClientRect();
  const distance = Math.max(1, window.innerHeight * 0.35);
  const progress = Math.min(1, Math.max(0, -homeRect.top / distance));
  scrollCue.style.setProperty("--scroll-progress", progress.toFixed(4));
}

function updateAboutSidebarMotion() {
  if (!aboutToc || !projectsSection) return;
  const projectsTop = projectsSection.getBoundingClientRect().top;
  const slideOutStart = window.innerHeight * 0.42;
  const shouldSlideOut = projectsTop <= slideOutStart;
  aboutToc.classList.toggle("is-sliding-out", shouldSlideOut);
}

function updateSyracuseTime() {
  if (!syracuseTime) return;
  const now = new Date();
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  syracuseTime.textContent = formatted;
}

function updateProjectCardGlow(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  card.style.setProperty("--mouse-x", `${x}px`);
  card.style.setProperty("--mouse-y", `${y}px`);
}

function createZoomGhost(rect) {
  const ghost = document.createElement("div");
  ghost.className = "detail-zoom-ghost";
  ghost.style.left = `${rect.left}px`;
  ghost.style.top = `${rect.top}px`;
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  document.body.appendChild(ghost);
  return ghost;
}

function getProjectSlug(card) {
  const title = card.querySelector("h3")?.textContent?.trim() || "project";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function findProjectCardBySlug(slug) {
  return projectCards.find((card) => getProjectSlug(card) === slug) || null;
}

function getUrlWithProject(slug) {
  const url = new URL(window.location.href);
  url.searchParams.set("project", slug);
  return url;
}

function getUrlWithoutProject() {
  const url = new URL(window.location.href);
  url.searchParams.delete("project");
  return url;
}

function renderProjectDetail(card) {
  const id = Number(card.dataset.projectId || 1);
  const title = card.querySelector("h3")?.textContent?.trim() || "Project Title";
  const summary =
    card.querySelector("p:not(.project-card-meta)")?.textContent?.trim() || "Project summary placeholder.";
  const detailData = projectDetailsById[id] || projectDetailsById[1];
  const links = [...card.querySelectorAll(".project-card-actions a")];
  const directProjectLink =
    links.find((link) => !link.classList.contains("project-card-view") && !link.classList.contains("project-card-github"))?.href ||
    detailData.live ||
    detailData.github;
  const projectLink = detailData.live || detailData.github;

  if (detailTitle) detailTitle.textContent = title;
  if (detailSubtitle) detailSubtitle.textContent = "Full project details";
  if (detailDescription) {
    detailDescription.textContent =
      `${summary} This project detail view is designed for deeper context, implementation notes, and business outcomes.`;
  }
  if (detailHighLevelCopy) {
    detailHighLevelCopy.textContent =
      detailData.highLevel || "High-level project description will be added soon.";
  }

  if (detailDatasetsSection && detailDatasetsList) {
    const datasets = detailData.datasets || [];
    detailDatasetsSection.hidden = datasets.length === 0;
    detailDatasetsList.innerHTML = "";
    for (const row of datasets) {
      const item = document.createElement("li");
      item.textContent = row;
      detailDatasetsList.appendChild(item);
    }
  }

  if (detailFeaturesList) {
    detailFeaturesList.innerHTML = "";
    for (const feature of detailData.features) {
      const item = document.createElement("li");
      item.textContent = feature;
      detailFeaturesList.appendChild(item);
    }
  }

  if (detailLive) detailLive.href = directProjectLink || projectLink;
  if (detailStack) detailStack.textContent = `Tech Stack: ${detailData.stack}`;
}

function openProjectDetail(card, options = {}) {
  const { updateHistory = false, animate = true } = options;
  if (!projectDetail || !detailPanel || isDetailAnimating) return;
  isDetailAnimating = true;
  activeProjectCard = card;
  renderProjectDetail(card);

  const startRect = card.getBoundingClientRect();
  const ghost = animate ? createZoomGhost(startRect) : null;
  const targetRect = {
    left: 16,
    top: 16,
    width: window.innerWidth - 32,
    height: window.innerHeight - 32,
  };

  projectDetail.setAttribute("aria-hidden", "false");
  document.body.classList.add("detail-open");
  if (updateHistory) {
    const slug = getProjectSlug(card);
    window.history.pushState({ projectSlug: slug }, "", getUrlWithProject(slug));
  }

  window.requestAnimationFrame(() => {
    projectDetail.classList.add("is-open");
    if (ghost) {
      ghost.style.left = `${targetRect.left}px`;
      ghost.style.top = `${targetRect.top}px`;
      ghost.style.width = `${targetRect.width}px`;
      ghost.style.height = `${targetRect.height}px`;
    }
  });

  window.setTimeout(() => {
    ghost?.remove();
    isDetailAnimating = false;
  }, 560);
}

function closeProjectDetail(options = {}) {
  const { updateHistory = false } = options;
  if (!projectDetail || !detailPanel || !activeProjectCard || isDetailAnimating) return;

  if (updateHistory) {
    const hasProjectInUrl = new URL(window.location.href).searchParams.has("project");
    if (hasProjectInUrl) {
      if (window.history.state?.projectSlug) {
        window.history.back();
      } else {
        window.history.replaceState(window.history.state, "", getUrlWithoutProject());
        closeProjectDetail({ updateHistory: false });
      }
    }
    return;
  }

  isDetailAnimating = true;

  const panelRect = detailPanel.getBoundingClientRect();
  const endRect = activeProjectCard.getBoundingClientRect();
  const ghost = createZoomGhost(panelRect);

  projectDetail.classList.remove("is-open");

  window.requestAnimationFrame(() => {
    ghost.style.left = `${endRect.left}px`;
    ghost.style.top = `${endRect.top}px`;
    ghost.style.width = `${endRect.width}px`;
    ghost.style.height = `${endRect.height}px`;
  });

  window.setTimeout(() => {
    ghost.remove();
    projectDetail.setAttribute("aria-hidden", "true");
    document.body.classList.remove("detail-open");
    isDetailAnimating = false;
  }, 560);
}

function startVerticalTicker(track, options = {}) {
  if (!track) return;

  const getStepRem =
    options.getStepRem ??
    (() => {
      return options.stepRem ?? 2;
    });
  const intervalMs = options.intervalMs ?? 3200;
  const onIndexChange = options.onIndexChange;
  let index = 0;
  const totalItems = track.children.length;
  if (totalItems < 2) return;

  setInterval(() => {
    const stepRem = getStepRem();
    index += 1;
    track.classList.add("is-spinning");
    track.style.transition = "transform 320ms steps(6, end)";
    track.style.transform = `translateY(-${index * stepRem}rem)`;
    onIndexChange?.(index);

    if (index === totalItems - 1) {
      window.setTimeout(() => {
        track.style.transition = "none";
        track.style.transform = "translateY(0)";
        index = 0;
        onIndexChange?.(0);
        track.classList.remove("is-spinning");
      }, 380);
    } else {
      window.setTimeout(() => {
        track.classList.remove("is-spinning");
      }, 340);
    }
  }, intervalMs);
}

function startRoleTicker() {
  startVerticalTicker(roleTrack, {
    stepRem: 2,
    intervalMs: 1900,
    onIndexChange: (i) => {
      roleIndex = i;
    },
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildTaglineWords(sentence) {
  if (!taglineLine) return [];
  taglineLine.textContent = "";
  const tokens = sentence.split(" ");
  const wordNodes = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const word = document.createElement("span");
    word.className = "home-tagline-word";
    word.textContent = tokens[i];
    taglineLine.appendChild(word);
    wordNodes.push(word);
    if (i < tokens.length - 1) {
      taglineLine.appendChild(document.createTextNode(" "));
    }
  }

  return wordNodes;
}

async function revealTaglineWords(wordNodes, delayMs = 70) {
  for (const word of wordNodes) {
    word.classList.remove("is-out");
    word.classList.add("is-in");
    await wait(delayMs);
  }
}

async function hideTaglineWords(wordNodes, delayMs = 55) {
  for (let i = wordNodes.length - 1; i >= 0; i -= 1) {
    const word = wordNodes[i];
    word.classList.remove("is-in");
    word.classList.add("is-out");
    await wait(delayMs);
  }
}

async function runWordTaglineLoop() {
  if (!taglineLine || homeTaglineSentences.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealDelay = reducedMotion ? 0 : 70;
  const hideDelay = reducedMotion ? 0 : 55;
  const holdMs = reducedMotion ? 2800 : 2200;
  const betweenMs = reducedMotion ? 500 : 380;

  while (true) {
    for (const sentence of homeTaglineSentences) {
      const words = buildTaglineWords(sentence);
      if (words.length === 0) continue;

      if (reducedMotion) {
        for (const word of words) {
          word.classList.add("is-in");
        }
        await wait(holdMs);
        for (const word of words) {
          word.classList.remove("is-in", "is-out");
        }
      } else {
        await revealTaglineWords(words, revealDelay);
        await wait(holdMs);
        await hideTaglineWords(words, hideDelay);
      }

      taglineLine.textContent = "";
      await wait(betweenMs);
    }
  }
}

function startTaglineTicker() {
  runWordTaglineLoop();
}

window.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - canvasSize.w / 2;
  const y = event.clientY - rect.top - canvasSize.h / 2;

  const inside = x < canvasSize.w / 2 && x > -canvasSize.w / 2 && y < canvasSize.h / 2 && y > -canvasSize.h / 2;
  if (inside) {
    mouse.x = x;
    mouse.y = y;
  }

  if (lastCursorPoint) {
    const dx = event.clientX - lastCursorPoint.x;
    const dy = event.clientY - lastCursorPoint.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 2) {
      cursorTrail.push({
        fromX: lastCursorPoint.x,
        fromY: lastCursorPoint.y,
        toX: event.clientX,
        toY: event.clientY,
        width: 1.4 + Math.random() * 1.8,
        life: 12,
        maxLife: 12,
      });
    }
  }
  lastCursorPoint = { x: event.clientX, y: event.clientY };
  if (cursorTrail.length > 90) {
    cursorTrail.splice(0, cursorTrail.length - 90);
  }
});

window.addEventListener("resize", () => {
  resizeCanvas();
  resizeTrailCanvas();
  updateAboutSidebarMotion();
  updateHomeScrollFx();
});
window.addEventListener(
  "scroll",
  () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
    scrollDriftY += -delta * 0.015;
    updateActiveToggle();
    updateNebulaState();
    updateHomeScrollFx();
    updateAboutSidebarMotion();
  },
  { passive: true },
);

themeToggle?.addEventListener("click", () => {
  const root = document.documentElement;
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = nextTheme;
  syncCanvasPalette();

  if (nextTheme === "light") {
    particleMode = "falling";
    for (const circle of circles) {
      circle.fallVelocity = 0.8 + Math.random() * 1.8;
      circle.fallDriftX = (Math.random() - 0.5) * 0.9;
    }
  } else {
    particleMode = "normal";
    resizeCanvas();
    nextMeteorAt = performance.now() + 2500 + Math.random() * 4500;
  }
});

for (const link of tocLinks) {
  link.addEventListener("click", () => {
    scrollToTarget(link.dataset.target, 80);
  });
}

scrollCue?.addEventListener("click", () => {
  scrollToTarget("about", 78);
});

if (aboutSection) {
  const observer = new IntersectionObserver(updateAboutVisibility, {
    threshold: [0, 0.18, 0.35, 0.55],
  });
  observer.observe(aboutSection);
}

if (projectCards.length > 0) {
  const cardObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  for (const card of projectCards) {
    card.addEventListener("mousemove", updateProjectCardGlow);
    const viewDetails = card.querySelector(".project-card-view");
    viewDetails?.addEventListener("click", (event) => {
      event.preventDefault();
      openProjectDetail(card);
    });
    cardObserver.observe(card);
  }
}

for (const closeButton of detailCloseButtons) {
  closeButton.addEventListener("click", () => closeProjectDetail({ updateHistory: false }));
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && projectDetail?.classList.contains("is-open")) {
    closeProjectDetail({ updateHistory: false });
  }
});

window.addEventListener("popstate", () => {
  const slug = new URL(window.location.href).searchParams.get("project");
  const matchingCard = slug ? findProjectCardBySlug(slug) : null;

  if (!matchingCard && projectDetail?.classList.contains("is-open")) {
    closeProjectDetail({ updateHistory: false });
    return;
  }

  if (matchingCard && !projectDetail?.classList.contains("is-open")) {
    openProjectDetail(matchingCard, { updateHistory: false, animate: false });
    return;
  }

  if (matchingCard && projectDetail?.classList.contains("is-open")) {
    activeProjectCard = matchingCard;
    renderProjectDetail(matchingCard);
  }
});

for (const icon of iconGlows) {
  icon.addEventListener("mousemove", updateProjectCardGlow);
}

function setContactFormStatus(message, isError = false) {
  if (!contactFormStatus) return;
  contactFormStatus.textContent = message;
  contactFormStatus.classList.toggle("is-error", isError);
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const senderEmail = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !senderEmail || !message) {
    setContactFormStatus("Please fill in your name, email, and message.", true);
    return;
  }

  const subject = encodeURIComponent(`Portfolio contact from ${name}`);
  const body = encodeURIComponent(
    `Hi Hari,\n\n${message}\n\nFrom: ${name}\nReply-to: ${senderEmail}`,
  );

  setContactFormStatus("Opening your email app. Send the message from your inbox.");
  window.location.href = `mailto:${PORTFOLIO_EMAIL}?subject=${subject}&body=${body}`;
});

for (const link of document.querySelectorAll("a[href]")) {
  const href = link.getAttribute("href") || "";
  const isInternalHash = href.startsWith("#");
  const isRelativePath = href.startsWith("./") || href.startsWith("../") || href.startsWith("/");
  const isExternal = /^https?:\/\//i.test(href);
  const isSpecial = href.startsWith("mailto:") || href.startsWith("tel:");
  if (isExternal && !isInternalHash && !isRelativePath && !isSpecial) {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer noopener");
  }
}

syncCanvasPalette();
resizeCanvas();
resizeTrailCanvas();
updateActiveToggle();
updateNebulaState();
updateHomeScrollFx();
updateAboutSidebarMotion();
updateSyracuseTime();
window.setInterval(updateSyracuseTime, 1000);
startRoleTicker();
startTaglineTicker();
window.requestAnimationFrame(animate);

const initialProjectSlug = new URL(window.location.href).searchParams.get("project");
if (initialProjectSlug) {
  const card = findProjectCardBySlug(initialProjectSlug);
  if (card) {
    openProjectDetail(card, { updateHistory: false, animate: false });
  }
}
