
'use strict';

// sidebar submenu collapsible js
document.querySelectorAll(".sidebar-menu .dropdown").forEach(function (dropdown) {
  dropdown.addEventListener("click", function () {
    var item = this;

    // Close all sibling dropdowns
    item.parentNode.querySelectorAll(".dropdown").forEach(function (sibling) {
      if (sibling !== item) {
        sibling.querySelector(".sidebar-submenu").style.display = 'none';
        sibling.classList.remove("dropdown-open");
        sibling.classList.remove("open");
      }
    });

    // Toggle the current dropdown
    var submenu = item.querySelector(".sidebar-submenu");
    submenu.style.display = (submenu.style.display === 'block') ? 'none' : 'block';

    item.classList.toggle("dropdown-open");
  });
});

// Toggle sidebar visibility and active class
const sidebarToggle = document.querySelector(".sidebar-toggle");
if(sidebarToggle) {
  sidebarToggle.addEventListener("click", function() {
    this.classList.toggle("active");
    document.querySelector(".sidebar").classList.toggle("active");
    document.querySelector(".dashboard-main").classList.toggle("active");
  });
}

// Open sidebar in mobile view and add overlay
const sidebarMobileToggle = document.querySelector(".sidebar-mobile-toggle");
if(sidebarMobileToggle) {
  sidebarMobileToggle.addEventListener("click", function() {
    document.querySelector(".sidebar").classList.add("sidebar-open");
    document.body.classList.add("overlay-active");
  });
}

// Close sidebar and remove overlay
const sidebarColseBtn = document.querySelector(".sidebar-close-btn");
if(sidebarColseBtn){
  sidebarColseBtn.addEventListener("click", function() {
    document.querySelector(".sidebar").classList.remove("sidebar-open");
    document.body.classList.remove("overlay-active");
  });
}

//to keep the current page active
document.addEventListener("DOMContentLoaded", function () {
  var nk = window.location.href;
  var links = document.querySelectorAll("ul#sidebar-menu a");

  links.forEach(function (link) {
    if (link.href === nk) {
      link.classList.add("active-page"); // anchor
      var parent = link.parentElement;
      parent.classList.add("active-page"); // li

      // Traverse up the DOM tree and add classes to parent elements
      while (parent && parent.tagName !== "BODY") {
        if (parent.tagName === "LI") {
          parent.classList.add("show");
          parent.classList.add("open");
        }
        parent = parent.parentElement;
      }
    }
  });
});




// ===== Light / Dark theme toggle (robust, single source of truth) =====
(function () {
  var root = document.documentElement;
  // #theme-toggle-dark-icon  -> shown in LIGHT mode (a moon: "click to go dark")
  // #theme-toggle-light-icon -> shown in DARK  mode (a sun:  "click to go light")
  var darkIcon = document.getElementById('theme-toggle-dark-icon');
  var lightIcon = document.getElementById('theme-toggle-light-icon');
  var btn = document.getElementById('theme-toggle');

  function isDark() {
    return root.classList.contains('dark');
  }

  // Keep the button icon in sync with the ACTUAL theme (never drifts).
  function syncIcons() {
    if (!darkIcon || !lightIcon) return;
    darkIcon.classList.toggle('hidden', isDark());
    lightIcon.classList.toggle('hidden', !isDark());
  }

  // Apply the saved / preferred theme on load.
  var saved = localStorage.getItem('color-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  syncIcons();

  if (btn) {
    btn.addEventListener('click', function () {
      root.classList.toggle('dark');                                // flip theme
      localStorage.setItem('color-theme', isDark() ? 'dark' : 'light'); // persist
      syncIcons();                                                   // update icon
    });
  }
})();


// ===== Period tabs (1W / 1M / 6M / 1Y / ALL) — click to activate =====
(function () {
  // color utilities that define the active / inactive look (size & shape stay untouched)
  var CLEAR = ['bg-primary-600', 'text-white', 'text-neutral-500', 'dark:text-neutral-300', 'dark:text-neutral-400'];
  function setInactive(b) {
    b.classList.remove.apply(b.classList, CLEAR);
    b.classList.add('text-neutral-500', 'dark:text-neutral-300');
  }
  function setActive(b) {
    b.classList.remove.apply(b.classList, CLEAR);
    b.classList.add('bg-primary-600', 'text-white');
  }
  document.querySelectorAll('.period-tabs').forEach(function (group) {
    var btns = group.querySelectorAll('button');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(setInactive);
        setActive(btn);
      });
    });
  });
})();