/* ==========================================================================
   PORTFOLIO | MAIN SCRIPT
   - Sticky navbar state, mobile menu, scroll highlighting
   - Auto-detects which nav links have a matching section yet
   - Pointer-driven tilt for the hero 3D scene
   ========================================================================== */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     NAVBAR
     ------------------------------------------------------------------ */
  const header = document.querySelector("[data-site-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const navLinks = Array.from(document.querySelectorAll("[data-nav] a[data-section]"));

  // Border + denser background once the page has scrolled
  const updateHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  // Mobile menu
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", () => setMenu(false));

  // Links whose section does not exist yet are dimmed and inert.
  // As soon as a section with the matching id is added to the page, the
  // link works with no further code changes.
  const liveLinks = [];
  navLinks.forEach((link) => {
    const target = document.getElementById(link.dataset.section);
    if (target) {
      liveLinks.push({ link, target });
      link.addEventListener("click", () => setMenu(false));
    } else {
      link.classList.add("is-pending");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      link.title = "Coming soon";
      link.addEventListener("click", (event) => event.preventDefault());
    }
  });

  // Highlight the link for the section currently in view
  const setActive = (id) => {
    liveLinks.forEach(({ link }) => {
      const isActive = link.dataset.section === id;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window && liveLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    liveLinks.forEach(({ target }) => observer.observe(target));
  }

  /* ------------------------------------------------------------------
     CTA
     When the contact page exists, change the href in index.html. If you
     would rather route it from here, set the URL below.
     ------------------------------------------------------------------ */
  const CONTACT_URL = null; // e.g. "contact.html"
  const cta = document.querySelector("[data-cta='contact']");
  if (cta && CONTACT_URL) cta.setAttribute("href", CONTACT_URL);

  /* ------------------------------------------------------------------
     PROJECT DIALOG ("View Blueprint")
     The title is read from the card itself. Edit the detail, stack and
     metrics below. NOTE: the metric figures are sample values: replace
     them with your real numbers before publishing.
     ------------------------------------------------------------------ */
  const PROJECTS = {
    "rbac": {
      detail: "A full-stack application where every request is checked against the user's role before any data is returned, so staff only ever see what they are cleared to see.",
      stack: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "PostgreSQL", "JWT"],
      metrics: [["User roles", "3"], ["Protected endpoints", "24"], ["Access-control tests", "40"]]
    },
    "tasks": {
      detail: "A task platform with secure sign-in and permission levels, so work moves through assignment, review and approval inside one trusted system.",
      stack: ["JavaScript", "Node.js", "Express", "MySQL", "bcrypt", "JWT"],
      metrics: [["Permission levels", "4"], ["Workflow states", "5"], ["Audit events logged", "12"]]
    },
    "remediation": {
      detail: "A structured security review of a web application: vulnerabilities are identified, ranked by risk, fixed and then retested to confirm the fix.",
      stack: ["OWASP Top 10", "Burp Suite", "OWASP ZAP", "Kali Linux"],
      metrics: [["Findings reported", "18"], ["High-risk issues fixed", "7"], ["Retests passed", "100%"]]
    },
    "injection-lab": {
      detail: "An isolated, intentionally vulnerable lab used to understand how SQL and command injection work, and to verify the defences that prevent them.",
      stack: ["Kali Linux", "DVWA", "sqlmap", "Burp Suite", "VirtualBox"],
      metrics: [["Test scenarios", "10"], ["Defences verified", "6"], ["Isolated VMs", "3"]]
    },
    "virtual-infra": {
      detail: "A virtualized enterprise network with directory services and managed servers, used to design, test and administer changes before they reach production.",
      stack: ["VirtualBox", "pfSense", "Windows Server", "Active Directory", "Linux"],
      metrics: [["Virtual machines", "8"], ["Network segments", "4"], ["Managed services", "5"]]
    },
    "vlan-env": {
      detail: "A multi-VM network split into VLAN zones, with firewall rules that control exactly which systems can talk to each other.",
      stack: ["pfSense", "VLANs", "iptables", "Wireshark", "Ubuntu Server"],
      metrics: [["VLANs", "4"], ["Firewall rules", "30"], ["Isolated zones", "3"]]
    }
  };

  const dialog = document.querySelector("[data-dialog]");
  if (dialog) {
    const titleEl = dialog.querySelector("[data-dialog-title]");
    const detailEl = dialog.querySelector("[data-dialog-detail]");
    const stackEl = dialog.querySelector("[data-dialog-stack]");
    const metricsEl = dialog.querySelector("[data-dialog-metrics]");

    const openProject = (button) => {
      const project = PROJECTS[button.dataset.project];
      if (!project) return;

      titleEl.textContent = button.closest(".project-card").querySelector(".project-title").textContent;
      detailEl.textContent = project.detail;

      stackEl.replaceChildren(...project.stack.map((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        return li;
      }));

      metricsEl.replaceChildren(...project.metrics.map(([label, value]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = label;
        dd.textContent = value;
        row.append(dt, dd);
        return row;
      }));

      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.body.classList.add("dialog-open");
    };

    const closeProject = () => {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      document.body.classList.remove("dialog-open");
    };

    document.querySelectorAll("[data-project]").forEach((button) => {
      button.addEventListener("click", () => openProject(button));
    });
    dialog.querySelector("[data-dialog-close]").addEventListener("click", closeProject);
    // Clicking the backdrop (outside the panel) closes the dialog
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeProject();
    });
    // Escape closes natively; keep the page-scroll lock in sync
    dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
  }

  /* ------------------------------------------------------------------
     FOOTER YEAR
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------------
     CONTACT FORM
     Posts JSON to /api/contact (backend/app.js), which validates the data
     again and saves it to MongoDB.
     When the page is served by the backend (npm start) the API lives on
     the same origin. If you open the HTML from another dev server (for
     example Live Server) requests are sent to the backend on port 3000.
     ------------------------------------------------------------------ */
  const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const API_BASE =
    window.location.protocol === "file:" || (isLocalDev && window.location.port !== "3000")
      ? "http://localhost:3000"
      : "";

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const statusEl = contactForm.querySelector("[data-form-status]");
    const submitBtn = contactForm.querySelector("[data-submit]");
    const successEl = document.querySelector("[data-contact-success]");
    const resetBtn = document.querySelector("[data-form-reset]");
    const successText = document.querySelector("[data-success-text]");
    const submitLabel = submitBtn.textContent;

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    // Keep these rules in sync with backend/validate.js
    const RULES = {
      fullName: (v) => (v.length < 2 ? "Please enter your full name." : v.length > 100 ? "Please keep your name under 100 characters." : ""),
      email: (v) => (!EMAIL_RE.test(v) ? "Please enter a valid email address." : v.length > 254 ? "That email address is too long." : ""),
      projectDetails: (v) => (v.length < 20 ? "Please share a few details (at least 20 characters)." : v.length > 2000 ? "Please keep the details under 2000 characters." : "")
    };

    const fieldOf = (name) => contactForm.elements[name];
    const errorOf = (name) => contactForm.querySelector(`[data-error-for="${name}"]`);

    const setError = (name, message) => {
      errorOf(name).textContent = message;
      if (message) fieldOf(name).setAttribute("aria-invalid", "true");
      else fieldOf(name).removeAttribute("aria-invalid");
    };
    const setStatus = (message, isError = false) => {
      statusEl.textContent = message;
      statusEl.classList.toggle("is-error", isError);
    };

    const validate = () => {
      const errors = {};
      Object.keys(RULES).forEach((name) => {
        const message = RULES[name](fieldOf(name).value.trim());
        setError(name, message);
        if (message) errors[name] = message;
      });
      return errors;
    };

    // Clear a field's error as soon as the visitor edits it
    Object.keys(RULES).forEach((name) => {
      fieldOf(name).addEventListener("input", () => {
        setError(name, "");
        setStatus("");
      });
    });

    const setLoading = (loading) => {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "Sending..." : submitLabel;
      contactForm.setAttribute("aria-busy", String(loading));
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("");

      const errors = validate();
      const firstInvalid = Object.keys(errors)[0];
      if (firstInvalid) {
        fieldOf(firstInvalid).focus();
        return;
      }

      const payload = {
        fullName: fieldOf("fullName").value.trim(),
        email: fieldOf("email").value.trim(),
        projectDetails: fieldOf("projectDetails").value.trim(),
        website: fieldOf("website").value // honeypot, should stay empty
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      setLoading(true);

      try {
        const response = await fetch(`${API_BASE}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          if (data.message) successText.textContent = data.message;
          contactForm.reset();
          contactForm.hidden = true;
          successEl.hidden = false;
          successEl.focus();
        } else if (response.status === 400 && data.errors) {
          Object.keys(RULES).forEach((name) => setError(name, data.errors[name] || ""));
          const first = Object.keys(data.errors)[0];
          if (first && fieldOf(first)) fieldOf(first).focus();
        } else {
          setStatus(data.message || "Something went wrong. Please try again.", true);
        }
      } catch (error) {
        setStatus(
          error.name === "AbortError"
            ? "The request took too long. Please try again."
            : "Could not reach the server. Please check your connection and try again.",
          true
        );
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    resetBtn.addEventListener("click", () => {
      successEl.hidden = true;
      contactForm.hidden = false;
      setStatus("");
      fieldOf("fullName").focus();
    });
  }

  /* ------------------------------------------------------------------
     3D SCENE: pointer tilt
     ------------------------------------------------------------------ */
  const scene = document.querySelector("[data-scene]");
  if (!scene || prefersReducedMotion) return;

  const BASE_X = -12; // degrees, matches --rx in the stylesheet
  const BASE_Y = -24; // degrees, matches --ry in the stylesheet
  const RANGE_X = 9;
  const RANGE_Y = 14;

  let targetX = BASE_X;
  let targetY = BASE_Y;
  let currentX = BASE_X;
  let currentY = BASE_Y;
  let frame = null;

  const render = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    scene.style.setProperty("--rx", `${currentX.toFixed(2)}deg`);
    scene.style.setProperty("--ry", `${currentY.toFixed(2)}deg`);

    const settled = Math.abs(targetX - currentX) < 0.02 && Math.abs(targetY - currentY) < 0.02;
    frame = settled ? null : requestAnimationFrame(render);
  };
  const schedule = () => {
    if (frame === null) frame = requestAnimationFrame(render);
  };

  const visual = scene.closest(".hero-visual") || scene;

  visual.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const rect = visual.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;  // -1 to 1
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;  // -1 to 1
    targetY = BASE_Y + nx * RANGE_Y;
    targetX = BASE_X - ny * RANGE_X;
    schedule();
  });

  visual.addEventListener("pointerleave", () => {
    targetX = BASE_X;
    targetY = BASE_Y;
    schedule();
  });
})();
