/*  ============================================================
    MAIN.JS — Behaviour, i18n, animations for sediqi.dev
    ============================================================ 
*/

/* ── Translations ── */
const translations = {
  en: {
    /* Nav */
    nav_projects: "Projects",
    nav_skills: "Skills",
    nav_about: "About",
    nav_contact: "Contact",
    nav_cta: "Available for Praxisphase",

    /* Hero */
    hero_badge: "Wirtschaftsinformatik · sediqi.dev",
    hero_title: "Web Developer & Business Analyst",
    hero_tagline_0: "I build web applications that make business processes simpler and faster.",
    hero_tagline_1: "I build AI-powered tools that automate repetitive office work.",
    hero_tagline_2: "I build software solutions that turn data into better decisions.",
    hero_btn_projects: "View Projects",
    hero_btn_contact: "Get in Touch",

    /* Projects */
    projects_label: "Featured Projects",
    projects_title: "Tools built for real business problems.",
    projects_desc: "Each project solves a specific business challenge — built, deployed, and accessible online.",
    project1_tag: "Business Intelligence",
    project1_name: "Executive KPI Dashboard",
    project1_desc: "A management dashboard for tracking sales, costs, and key performance indicators with interactive charts and drill-down views.",
    project2_tag: "AI + Automation",
    project2_name: "AI Invoice Assistant",
    project2_desc: "Upload an invoice and let AI extract the key fields — vendor, amount, date, line items. Validates data and flags anomalies.",
    project3_tag: "AI · RAG",
    project3_name: "Knowledge Assistant",
    project3_desc: "Ask questions about internal documents and get accurate answers with source references. AI only answers from your documents.",
    project_link: "View project",

    /* Skills */
    skills_label: "Capabilities",
    skills_title: "Business thinking meets technical execution.",
    skills_desc: "A Wirtschaftsinformatik background means understanding both sides — what the business needs and how to build it.",
    skill1_title: "Web Development",
    skill2_title: "Data & Backend",
    skill3_title: "Infrastructure & Tools",
    skill4_title: "Business & Languages",

    /* About */
    about_label: "About",
    about_title: "Builder at heart, student by day.",
    about_p1: "I am a Wirtschaftsinformatik student at a German Fachhochschule, preparing for my Praxisphase. I am not just studying business IT — I am actively building the tools on this page, deploying them on a real server, and learning every step of the process.",
    about_p2: "What drives me is the combination of business understanding and technical execution. I want to build things that solve real problems — whether that is automating an invoice workflow, visualising KPIs for a manager, or making company knowledge searchable.",
    about_p3: "Long term, I am interested in AI-powered SaaS products and building tools that create genuine value for businesses.",
    about_fact1_value: "WI",
    about_fact1_label: "Wirtschaftsinformatik degree",
    about_fact2_value: "6mo",
    about_fact2_label: "Praxisphase available",
    about_fact3_value: "3",
    about_fact3_label: "Live projects deployed",
    about_fact4_value: "AI",
    about_fact4_label: "Automation & SaaS focus",

    /* Contact */
    contact_label: "Contact",
    contact_title: "Let's work together.",
    contact_desc: "I am looking for a Praxisphase internship in business IT, AI, automation, or web development. If you are building something interesting, I would love to hear from you.",
    contact_btn_email: "Email Me",
    contact_btn_github: "GitHub",
    contact_btn_linkedin: "LinkedIn",

    /* Footer */
    footer_copy: "© 2026 Samim Sediqi",
    footer_built: "Built and deployed on a self-managed VPS · Docker · Nginx · Traefik",
  },

  de: {
    /* Nav */
    nav_projects: "Projekte",
    nav_skills: "Fähigkeiten",
    nav_about: "Über mich",
    nav_contact: "Kontakt",
    nav_cta: "Verfügbar für Praxisphase",

    /* Hero */
    hero_badge: "Wirtschaftsinformatik · sediqi.dev",
    hero_title: "Web-Entwickler & Business Analyst",
    hero_tagline_0: "Ich entwickle Webanwendungen, die Geschäftsprozesse einfacher und schneller machen.",
    hero_tagline_1: "Ich entwickle KI-gestützte Tools, die repetitive Büroarbeit automatisieren.",
    hero_tagline_2: "Ich entwickle Softwarelösungen, die Daten in bessere Entscheidungen verwandeln.",
    hero_btn_projects: "Projekte ansehen",
    hero_btn_contact: "Kontakt aufnehmen",

    /* Projects */
    projects_label: "Ausgewählte Projekte",
    projects_title: "Tools für echte Geschäftsprobleme.",
    projects_desc: "Jedes Projekt löst eine konkrete Herausforderung — entwickelt, deployed und online zugänglich.",
    project1_tag: "Business Intelligence",
    project1_name: "Executive KPI Dashboard",
    project1_desc: "Ein Management-Dashboard zur Verfolgung von Umsatz, Kosten und KPIs mit interaktiven Diagrammen und Drill-down-Ansichten.",
    project2_tag: "KI + Automatisierung",
    project2_name: "KI-Rechnungsassistent",
    project2_desc: "Rechnung hochladen und KI extrahiert automatisch Lieferant, Betrag, Datum und Positionen. Validiert Daten und markiert Abweichungen.",
    project3_tag: "KI · RAG",
    project3_name: "Wissensassistent",
    project3_desc: "Fragen zu internen Dokumenten stellen und präzise Antworten mit Quellenangaben erhalten. Die KI antwortet nur aus Ihren Dokumenten.",
    project_link: "Projekt ansehen",

    /* Skills */
    skills_label: "Fähigkeiten",
    skills_title: "Geschäftsdenken trifft technische Umsetzung.",
    skills_desc: "Ein Wirtschaftsinformatik-Hintergrund bedeutet, beide Seiten zu verstehen — was das Unternehmen braucht und wie man es umsetzt.",
    skill1_title: "Web-Entwicklung",
    skill2_title: "Daten & Backend",
    skill3_title: "Infrastruktur & Tools",
    skill4_title: "Business & Sprachen",

    /* About */
    about_label: "Über mich",
    about_title: "Entwickler aus Leidenschaft, Student im Alltag.",
    about_p1: "Ich bin Wirtschaftsinformatik-Student an einer deutschen Fachhochschule und bereite mich auf meine Praxisphase vor. Ich studiere nicht nur Business-IT — ich entwickle aktiv die Tools auf dieser Seite, deploye sie auf einem echten Server und lerne jeden Schritt des Prozesses.",
    about_p2: "Was mich antreibt, ist die Kombination aus unternehmerischem Denken und technischer Umsetzung. Ich möchte Dinge bauen, die echte Probleme lösen — ob das die Automatisierung eines Rechnungsworkflows, die Visualisierung von KPIs oder die Durchsuchbarkeit von Unternehmenswissen ist.",
    about_p3: "Langfristig interessiere ich mich für KI-gestützte SaaS-Produkte und den Aufbau von Tools, die echten Mehrwert für Unternehmen schaffen.",
    about_fact1_value: "WI",
    about_fact1_label: "Wirtschaftsinformatik-Studium",
    about_fact2_value: "6 Mo.",
    about_fact2_label: "Praxisphase verfügbar",
    about_fact3_value: "3",
    about_fact3_label: "Live-Projekte deployed",
    about_fact4_value: "KI",
    about_fact4_label: "Automatisierung & SaaS",

    /* Contact */
    contact_label: "Kontakt",
    contact_title: "Lass uns zusammenarbeiten.",
    contact_desc: "Ich suche eine Praxisphase in Business-IT, KI, Automatisierung oder Web-Entwicklung. Wenn Sie etwas Interessantes aufbauen, freue ich mich von Ihnen zu hören.",
    contact_btn_email: "E-Mail schreiben",
    contact_btn_github: "GitHub",
    contact_btn_linkedin: "LinkedIn",

    /* Footer */
    footer_copy: "© 2026 Samim Sediqi",
    footer_built: "Entwickelt und deployed auf einem selbst verwalteten VPS · Docker · Nginx · Traefik",
  },
};


/* ── Language Engine ── */
let currentLang = "en";

function detectLanguage() {
  /* Check if user already made a manual choice */
  const saved = localStorage.getItem("preferred-lang");
  if (saved === "en" || saved === "de") return saved;

  /* Auto-detect from browser — German gets German, everything else gets English */
  const browser = navigator.language || navigator.userLanguage;
  return browser.startsWith("de") ? "de" : "en";
}

function applyLanguage(lang) {
  currentLang = lang;

  /* Update every element that has a data-i18n attribute */
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  /* Update toggle button states */
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  /* Save choice */
  localStorage.setItem("preferred-lang", lang);

  /* Update html lang attribute — important for accessibility */
  document.documentElement.lang = lang;
}

function initLanguage() {
  const lang = detectLanguage();
  applyLanguage(lang);
}


/* ── Rotating Headline ── */
let taglineIndex = 0;
let taglineInterval = null;

function updateTagline() {
  const taglines = document.querySelectorAll(".hero-tagline");
  if (!taglines.length) return;

  taglines.forEach((el) => el.classList.remove("active"));
  taglineIndex = (taglineIndex + 1) % taglines.length;
  taglines[taglineIndex].classList.add("active");
}

function initTagline() {
  const taglines = document.querySelectorAll(".hero-tagline");
  if (!taglines.length) return;

  /* Show first tagline immediately */
  taglines[0].classList.add("active");

  /* Rotate every 3.5 seconds */
  taglineInterval = setInterval(updateTagline, 3500);
}


/* ── Scroll Reveal ── */
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((el) => observer.observe(el));
}


/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initTagline();
  initScrollReveal();

  /* Language toggle buttons */
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLanguage(btn.dataset.lang);
    });
  });
});
