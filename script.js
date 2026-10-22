/* Hi-Tech Industrial Maintenance LTD — site script (vanilla JS) */
(function () {
  "use strict";

  /* ===== EDITABLE BUSINESS SETTINGS ===== */
  var CONFIG = {
    businessName: "Hi-Tech Industrial Maintenance LTD",
    whatsappNumber: "2347079289318", // 0707 928 9318 in international format (no + or spaces)
    hours: "8:00 AM – 6:00 PM" // change here if the business confirms different hours
  };

  var PRODUCTS = [
    { name: "Industrial Bearings", group: "transmission", tag: "Power Transmission", img: "images/bearings.jpg",
      alt: "Assorted steel ball bearings and roller bearings",
      desc: "Bearings for industrial machinery, motors, pumps and production equipment.",
      points: ["Heavy-duty bearings", "Bearings for industrial machinery", "Bearing replacement enquiries"] },
    { name: "Roller Chains", group: "transmission", tag: "Power Transmission", img: "images/chains.jpg",
      alt: "Industrial steel roller chain beside a sprocket",
      desc: "Chains and related components for power transmission and drive systems.",
      points: ["Industrial roller chains", "Power transmission components", "Chain replacement enquiries"] },
    { name: "Compressor Repair Kits", group: "maintenance", tag: "Maintenance", img: "images/compressor.jpg",
      alt: "Compressor repair kit with valves, gaskets and piston rings",
      desc: "Components to support compressor servicing and repair.",
      points: ["Compressor maintenance components", "Repair and replacement kits"] },
    { name: "Mechanical Seals", group: "sealing", tag: "Sealing", img: "images/mechanical-seals.jpg",
      alt: "Industrial mechanical seals with metal and carbon face rings",
      desc: "Sealing solutions for pumps, mixers and rotating machinery.",
      points: ["Industrial mechanical seals", "Sealing components for machinery"] },
    { name: "Hydraulic Seals", group: "sealing", tag: "Sealing", img: "images/hydraulic-seals.jpg",
      alt: "Hydraulic rod seals, O-rings and wiper seals beside a hydraulic cylinder",
      desc: "Seals for hydraulic cylinders and hydraulic equipment.",
      points: ["Hydraulic equipment sealing components", "Replacement seal enquiries"] },
    { name: "Conveyor Belts", group: "maintenance", tag: "Material Handling", img: "images/conveyor.jpg",
      alt: "Black rubber industrial conveyor belt running over rollers",
      desc: "Belts and components for conveyor and material handling systems.",
      points: ["Industrial conveyor belts", "Material handling components"] },
    { name: "Other Industrial Spare Parts", group: "maintenance", tag: "General Supplies", img: "images/spare-parts.jpg",
      alt: "Assorted industrial gears, couplings, pulleys and bolts",
      desc: "Looking for a part not listed here? Send us the details and we'll check for you.",
      points: ["Gears, couplings, pulleys and more", "Enquire about components not listed"] }
  ];

  /* ===== HELPERS ===== */
  function waLink(message) {
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message);
  }
  function openWhatsApp(message) {
    var url = waLink(message);
    var win = window.open(url, "_blank", "noopener");
    if (!win) window.location.href = url; // popup blocked fallback
    return url;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.documentElement.classList.remove("no-js");

  /* Hours + year */
  document.querySelectorAll(".js-hours").forEach(function (el) { el.textContent = CONFIG.hours; });
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Generic WhatsApp links: set real hrefs so they work even if JS click handling fails */
  function wireWa(root) {
    (root || document).querySelectorAll(".js-wa").forEach(function (a) {
      var msg = a.getAttribute("data-msg") || "Hello " + CONFIG.businessName + ", I would like to make an enquiry.";
      a.setAttribute("href", waLink(msg));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
  }

  /* ===== PRODUCTS ===== */
  var grid = document.getElementById("product-grid");
  var noResults = document.getElementById("no-results");
  var searchInput = document.getElementById("product-search");
  var activeFilter = "all";

  function productMessage(name) {
    return "Hello " + CONFIG.businessName + ", I'm interested in *" + name + "*. Could you please share the price and availability? Thank you.";
  }

  function renderProducts() {
    grid.innerHTML = PRODUCTS.map(function (p, i) {
      var keywords = (p.name + " " + p.tag + " " + p.desc + " " + p.points.join(" ")).toLowerCase();
      return (
        '<article class="product-card reveal" data-group="' + p.group + '" data-keywords="' + escapeHtml(keywords) + '">' +
          '<div class="product-media"><img src="' + p.img + '" alt="' + escapeHtml(p.alt) + '" width="944" height="704" loading="lazy" /></div>' +
          '<div class="product-body">' +
            '<span class="product-tag">' + escapeHtml(p.tag) + "</span>" +
            "<h3>" + escapeHtml(p.name) + "</h3>" +
            "<p>" + escapeHtml(p.desc) + "</p>" +
            "<ul>" + p.points.map(function (pt) { return "<li>" + escapeHtml(pt) + "</li>"; }).join("") + "</ul>" +
            '<div class="product-foot">' +
              '<span class="price">Request Price</span>' +
              '<a class="btn btn-wa" href="' + waLink(productMessage(p.name)) + '" target="_blank" rel="noopener" aria-label="Enquire about ' + escapeHtml(p.name) + ' on WhatsApp">Enquire About This Product</a>' +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    // Footer product list + quote datalist
    var footerList = document.getElementById("footer-products");
    if (footerList) footerList.innerHTML = PRODUCTS.map(function (p) { return '<li><a href="#products">' + escapeHtml(p.name) + "</a></li>"; }).join("");
    var dl = document.getElementById("product-list");
    if (dl) dl.innerHTML = PRODUCTS.map(function (p) { return '<option value="' + escapeHtml(p.name) + '"></option>'; }).join("");
  }

  function applyFilters() {
    var q = (searchInput.value || "").trim().toLowerCase();
    var terms = q.split(/\s+/).filter(Boolean);
    var shown = 0;
    grid.querySelectorAll(".product-card").forEach(function (card) {
      var matchGroup = activeFilter === "all" || card.getAttribute("data-group") === activeFilter;
      var kw = card.getAttribute("data-keywords");
      var matchText = terms.every(function (t) { return kw.indexOf(t) !== -1; });
      var visible = matchGroup && matchText;
      card.hidden = !visible;
      if (visible) { shown++; card.classList.add("is-visible"); }
    });
    noResults.hidden = shown !== 0;
  }

  renderProducts();
  wireWa(document);

  searchInput.addEventListener("input", applyFilters);
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      activeFilter = chip.getAttribute("data-filter");
      applyFilters();
    });
  });

  /* ===== MOBILE NAV ===== */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  function setNav(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  }
  toggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1080) setNav(false); });

  /* ===== ACTIVE NAV LINK + REVEAL ===== */
  if ("IntersectionObserver" in window) {
    var links = document.querySelectorAll('.primary-nav ul a');
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle("is-current", l.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { sectionObs.observe(s); });

    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ===== QUOTE FORM ===== */
  var form = document.getElementById("quote-form");
  var statusEl = document.getElementById("form-status");

  function setError(input, msg) {
    var field = input.closest(".field");
    var err = field && field.querySelector(".error");
    if (field) field.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validate() {
    var ok = true;
    var first = null;
    var name = form.name;
    var phone = form.phone;
    var email = form.email;
    var product = form.product;
    var qty = form.quantity;

    function check(input, cond, msg) {
      if (!cond) { setError(input, msg); ok = false; if (!first) first = input; }
      else setError(input, "");
    }
    check(name, name.value.trim().length >= 2, "Please enter your full name.");
    var digits = phone.value.replace(/\D/g, "");
    check(phone, digits.length >= 10 && digits.length <= 14, "Please enter a valid phone number (e.g. 0803 000 0000).");
    check(email, !email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), "Please enter a valid email address or leave it blank.");
    check(product, product.value.trim().length >= 2, "Please tell us the product or part you need.");
    check(qty, qty.value.trim().length >= 1, "Please enter the quantity required.");

    var contact = form.querySelector('input[name="contact"]:checked');
    var contactErr = form.querySelector("fieldset .error");
    if (!contact) { contactErr.textContent = "Please choose a contact method."; ok = false; }
    else if (contact.value === "Email" && !email.value.trim()) {
      contactErr.textContent = "Please add your email address, or choose another contact method.";
      setError(email, "Email is required if you prefer to be contacted by email.");
      ok = false; if (!first) first = email;
    } else contactErr.textContent = "";

    if (first) first.focus();
    return ok;
  }

  // Exposed builder so a backend/CRM can reuse the same data later
  function collectQuote() {
    var contact = form.querySelector('input[name="contact"]:checked');
    return {
      name: form.name.value.trim(),
      company: form.company.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      product: form.product.value.trim(),
      quantity: form.quantity.value.trim(),
      specs: form.specs.value.trim(),
      contactMethod: contact ? contact.value : ""
    };
  }

  function quoteMessage(d) {
    var lines = [
      "*QUOTE REQUEST — " + CONFIG.businessName + "*",
      "",
      "Name: " + d.name
    ];
    if (d.company) lines.push("Company: " + d.company);
    lines.push("Phone: " + d.phone);
    if (d.email) lines.push("Email: " + d.email);
    lines.push("Product / part: " + d.product);
    lines.push("Quantity: " + d.quantity);
    if (d.specs) lines.push("Specifications: " + d.specs);
    lines.push("Preferred contact: " + d.contactMethod);
    lines.push("", "Please send pricing and availability. Thank you.");
    return lines.join("\n");
  }

  form.querySelectorAll("input, textarea").forEach(function (el) {
    el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") setError(el, ""); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.className = "form-status";
    statusEl.textContent = "";
    if (!validate()) {
      statusEl.className = "form-status err";
      statusEl.textContent = "Please correct the highlighted fields and try again.";
      return;
    }
    var data = collectQuote();
    /* To connect a backend or CRM later, send `data` here with fetch() before/instead of WhatsApp. */
    var url = openWhatsApp(quoteMessage(data));
    statusEl.className = "form-status ok";
    statusEl.innerHTML = "<strong>Almost done!</strong> WhatsApp has opened with your quote request. Please press <b>Send</b> in WhatsApp to deliver it. " +
      'If WhatsApp didn\'t open, <a href="' + url + '" target="_blank" rel="noopener">tap here</a> or call <a href="tel:+2347079289318">0707 928 9318</a>.';
    // Form data is intentionally kept so the customer can edit and resend.
  });

  // Prefill product field when arriving from a product (optional deep-link: #quote?product=...)
  window.HiTech = { config: CONFIG, products: PRODUCTS, waLink: waLink, collectQuote: collectQuote, quoteMessage: quoteMessage };
})();
