/**
 * CampusConnect - REST API Integration
 * Lab 2 - Web Services & SOA Laboratory
 *
 * Endpoints Used:
 *   1. Student Profile   -> GET https://jsonplaceholder.typicode.com/users/1
 *   2. Announcements     -> GET https://jsonplaceholder.typicode.com/posts?_limit=5
 *   3. Assignments       -> GET https://jsonplaceholder.typicode.com/todos?userId=1&_limit=5
 *
 * Pattern: fetch() -> response.ok check -> response.json() -> update DOM
 */

const API_BASE = "https://jsonplaceholder.typicode.com";
const API_ENDPOINTS = {
  studentProfile: API_BASE + "/users/1",
  announcements:  API_BASE + "/posts?_limit=5",
  assignments:    API_BASE + "/todos?userId=1&_limit=5"
};

// ---- Utility: Loading state ----
function setApiLoading(id, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '<div class="api-loading-state"><div class="api-spinner" aria-hidden="true"></div><span>' + msg + '</span></div>';
}

// ---- Utility: Error state ----
function setApiError(id, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '<div class="api-error-state" role="alert"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg><span>' + msg + '</span><button class="api-retry-btn" onclick="initAllApiSections()">Retry</button></div>';
}

// ---- Helper ----
function capFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

// ==========================================================================
// API 1: Student Profile
// ==========================================================================
async function loadStudentProfile() {
  var el = document.getElementById("apiProfileBanner");
  if (!el) return;
  setApiLoading("apiProfileBanner", "Fetching profile from API...");
  try {
    var res = await fetch(API_ENDPOINTS.studentProfile);
    if (!res.ok) throw new Error("HTTP " + res.status);
    var u = await res.json();
    var initials = u.name.split(" ").map(function(w){return w[0];}).join("").toUpperCase().slice(0,2);
    el.innerHTML =
      '<div class="api-profile-inner">' +
        '<div class="api-profile-avatar">' + initials + '</div>' +
        '<div class="api-profile-info">' +
          '<div class="api-profile-source-pill">' +
            '<svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>' +
            'Live &middot; JSONPlaceholder /users/1' +
          '</div>' +
          '<h4 class="api-profile-name">' + u.name + '</h4>' +
          '<div class="api-profile-fields">' +
            '<span class="api-field-row"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>@' + u.username + '</span>' +
            '<span class="api-field-row"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>' + u.email + '</span>' +
            '<span class="api-field-row"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>' + u.phone + '</span>' +
            '<span class="api-field-row"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>' + u.website + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    console.log("[Lab 2] Student Profile loaded:", u);
  } catch(e) {
    console.error("[Lab 2] Profile error:", e.message);
    setApiError("apiProfileBanner", "Unable to load profile. " + e.message);
  }
}

// ==========================================================================
// API 2: Announcements
// ==========================================================================
var _posts = [];

async function loadAnnouncements() {
  var el = document.getElementById("apiAnnouncementsContainer");
  if (!el) return;
  setApiLoading("apiAnnouncementsContainer", "Fetching announcements from API...");
  try {
    var res = await fetch(API_ENDPOINTS.announcements);
    if (!res.ok) throw new Error("HTTP " + res.status);
    var posts = await res.json();
    _posts = posts;
    renderApiPosts(posts);
    console.log("[Lab 2] Announcements loaded:", posts.length);
  } catch(e) {
    console.error("[Lab 2] Announcements error:", e.message);
    setApiError("apiAnnouncementsContainer", "Unable to load announcements. " + e.message);
  }
}

var CAT_CLASSES = ["cat-exam","cat-academic","cat-reg","cat-admin","cat-exam"];
var CAT_LABELS  = ["Examination","Academic","Registration","Administration","Notice"];

function renderApiPosts(posts) {
  var el = document.getElementById("apiAnnouncementsContainer");
  if (!el) return;
  if (!posts || posts.length === 0) {
    el.innerHTML = '<p class="api-empty-note">No announcements available.</p>';
    return;
  }
  el.innerHTML = "";
  posts.forEach(function(post, i) {
    var card = document.createElement("div");
    card.className = "announcement-card api-announcement-card";
    card.setAttribute("data-title", post.title.toLowerCase());
    card.innerHTML =
      '<div class="announcement-card-header">' +
        '<div class="announcement-meta">' +
          '<span class="announcement-category-badge ' + CAT_CLASSES[i % 5] + '">' + CAT_LABELS[i % 5] + '</span>' +
          '<span class="announcement-source-tag">API &middot; Post #' + post.id + '</span>' +
        '</div>' +
        '<button class="announce-expand-btn" aria-expanded="false" aria-label="Expand">' +
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>' +
        '</button>' +
      '</div>' +
      '<h4 class="announcement-title">' + capFirst(post.title) + '</h4>' +
      '<p class="announcement-summary">' + capFirst(post.body.split("\n")[0]) + '...</p>' +
      '<div class="announcement-detail-body" style="display:none;">' +
        '<p>' + capFirst(post.body) + '</p>' +
      '</div>';

    card.querySelector(".announce-expand-btn").addEventListener("click", function() {
      var btn = this;
      var detail = card.querySelector(".announcement-detail-body");
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", !open);
      detail.style.display = open ? "none" : "block";
      btn.querySelector("svg").style.transform = open ? "" : "rotate(180deg)";
    });
    el.appendChild(card);
  });
}

function initApiAnnouncementSearch() {
  var input = document.getElementById("apiAnnouncementSearch");
  if (!input) return;
  input.addEventListener("input", function() {
    var q = input.value.trim().toLowerCase();
    if (!q) { renderApiPosts(_posts); return; }
    var filtered = _posts.filter(function(p) {
      return p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
    });
    renderApiPosts(filtered);
  });
}

// ==========================================================================
// API 3: Assignments (Todos)
// ==========================================================================
var _todos = [];
var _todoFilter = "all";

async function loadAssignments() {
  var el = document.getElementById("apiAssignmentsContainer");
  if (!el) return;
  setApiLoading("apiAssignmentsContainer", "Fetching assignments from API...");
  try {
    var res = await fetch(API_ENDPOINTS.assignments);
    if (!res.ok) throw new Error("HTTP " + res.status);
    var todos = await res.json();
    _todos = todos;
    renderApiTodos(todos, _todoFilter);
    console.log("[Lab 2] Assignments loaded:", todos.length);
  } catch(e) {
    console.error("[Lab 2] Assignments error:", e.message);
    setApiError("apiAssignmentsContainer", "Unable to load assignments. " + e.message);
  }
}

function renderApiTodos(todos, filter) {
  var el = document.getElementById("apiAssignmentsContainer");
  if (!el) return;
  var list = filter === "completed" ? todos.filter(function(t){return t.completed;})
           : filter === "pending"   ? todos.filter(function(t){return !t.completed;})
           : todos;
  if (list.length === 0) {
    el.innerHTML = '<p class="api-empty-note">No ' + (filter === "all" ? "" : filter + " ") + 'assignments found.</p>';
    return;
  }
  el.innerHTML = "";
  list.forEach(function(todo) {
    var item = document.createElement("div");
    item.className = "api-todo-item " + (todo.completed ? "todo-done" : "todo-pending");
    item.innerHTML =
      '<span class="todo-check-icon" aria-hidden="true">' +
        (todo.completed
          ? '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>'
          : '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>') +
      '</span>' +
      '<span class="todo-title">' + capFirst(todo.title) + '</span>' +
      '<span class="todo-status-pill ' + (todo.completed ? "pill-done" : "pill-pending") + '">' +
        (todo.completed ? "Completed" : "Pending") +
      '</span>';
    el.appendChild(item);
  });
}

function initAssignmentFilters() {
  var btns = document.querySelectorAll(".assign-filter-btn");
  btns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      btns.forEach(function(b){b.classList.remove("active");});
      btn.classList.add("active");
      _todoFilter = btn.getAttribute("data-filter");
      renderApiTodos(_todos, _todoFilter);
    });
  });
}

// ==========================================================================
// Refresh Button
// ==========================================================================
function initRefreshButton() {
  var btn = document.getElementById("apiRefreshBtn");
  if (!btn) return;
  btn.addEventListener("click", function() {
    btn.classList.add("spinning");
    btn.disabled = true;
    initAllApiSections().finally(function() {
      btn.classList.remove("spinning");
      btn.disabled = false;
      if (typeof showToast === "function") {
        showToast("API Refreshed", "All three sections reloaded from JSONPlaceholder.");
      }
    });
  });
}

// ==========================================================================
// Master init
// ==========================================================================
async function initAllApiSections() {
  await Promise.all([
    loadStudentProfile(),
    loadAnnouncements(),
    loadAssignments()
  ]);
}

document.addEventListener("DOMContentLoaded", function() {
  initAllApiSections();
  initAssignmentFilters();
  initApiAnnouncementSearch();
  initRefreshButton();
});
