/**
 * CampusConnect - Smart University Service Portal
 * Lab 1 - Web Services & SOA Laboratory
 * Personalized for: Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar
 * Script: script.js
 * 
 * Features & Integrations:
 * 1. Theme Switch (Light / Dark Mode with localStorage persistence)
 * 2. Dynamic Time-based Greeting (Morning / Afternoon / Evening / Night)
 * 3. Dynamic Real-Time Date & Clock updates
 * 4. DAU Today Milestone Countdown & Progress calculation
 * 5. Animated Number Statistics counter on scroll / reveal
 * 6. Academic Calendar & Timeline status tracking
 * 7. Categorized Noticeboard with real-time search & filter
 * 8. Expandable announcement cards with keyboard accessibility
 * 9. Placement Hub (DAU Placement Policy 2025-26 rules & interactive actions)
 * 10. Life at DAU campus photographs interaction
 * 11. Quick Services prototype toast feedback
 * 12. IntersectionObserver reveal animations on scroll
 * 13. Centralized Mock Data Store structured for clean Lab 2 fetch() migration
 */

// ============================================================================
// 1. Centralized Student & University Data Store (Ready for Lab 2 API migration)
// ============================================================================
const CampusData = {
  // Personalized Student Profile (DAU M.Sc. IT Semester 3)
  student: {
    name: "Panthil Shah",
    id: "MScIT-25-0XX", // Fictional placeholder as requested
    program: "M.Sc. Information Technology",
    school: "School of Technology",
    university: "Dhirubhai Ambani University",
    formerName: "formerly DA-IICT",
    location: "Gandhinagar, Gujarat",
    semester: "Semester 3 (Autumn 2026-27)",
    initials: "PS",
    email: "mscit250xx@daiict.ac.in"
  },

  // Academic Statistics (Realistically tuned mock academic data)
  statistics: {
    attendance: { num: 86.7, suffix: "%", label: "Attendance", trend: "Eligible for Exams", status: "Above 80% threshold" },
    courses: { num: 4, suffix: "", label: "Active Courses", trend: "M.Sc. IT Core", status: "16 Credits" },
    assignments: { num: 2, suffix: " Pending", label: "Assignments", trend: "Due next week", status: "Action required" },
    exams: { num: 0, suffix: "06-10 Oct", label: "Next Exam", trend: "In-Sem 2", status: "Prep window" },
    cpi: { num: 6.38, suffix: "", label: "Cumulative CPI", trend: "Eligible for PG Placements", status: "CPI >= 6.00" },
    notifications: { num: 4, suffix: " Unread", count: 4, label: "Noticeboard", trend: "Academic Alerts", status: "Active notices" }
  },

  // Next Academic Milestone: Second In-Semester Examination (06-10-2026 to 10-10-2026)
  dauTodayMilestone: {
    title: "Second In-Semester Examination",
    semester: "Autumn Semester 2026-27",
    startDate: "2026-10-06T09:00:00+05:30",
    endDate: "2026-10-10T17:00:00+05:30",
    formattedPeriod: "06-10-2026 to 10-10-2026",
    venue: "Lecture Theatres & Lab Complex",
    statusBadge: "Upcoming Milestone"
  },

  // Full Weekly Master Timetable (M.Sc. IT Semester 3 & Electives)
  activeTimetableDay: "Monday", // default or auto-selected based on current day
  weeklyTimetable: {
    "Monday": [
      {
        id: "mon-1",
        time: "08:00 - 08:50 AM",
        startHour: 8.0,
        endHour: 8.83,
        courseTitle: "Creative Intelligence / Art of Influence / Management Skills",
        courseCodes: ["DE401", "HM443", "HM409"],
        type: "HSS / Management Elective",
        venue: "Lecture Theatre / Seminar Halls",
        badge: "Elective Basket"
      },
      {
        id: "mon-2",
        time: "11:00 - 11:50 AM",
        startHour: 11.0,
        endHour: 11.83,
        courseTitle: "Web & Mobile Development",
        courseCodes: ["IT645"],
        type: "Core Postgraduate Course",
        venue: "Tech Complex LT-1",
        badge: "Core Lecture"
      },
      {
        id: "mon-3",
        time: "02:00 - 02:50 PM",
        startHour: 14.0,
        endHour: 14.83,
        courseTitle: "Big Data Processing / Advanced Algorithms",
        courseCodes: ["IE494", "IT580"],
        type: "Technical Elective",
        venue: "Lab Complex / LH-2",
        badge: "Tech Elective"
      },
      {
        id: "mon-4",
        time: "03:00 - 03:50 PM",
        startHour: 15.0,
        endHour: 15.83,
        courseTitle: "Data Analysis",
        courseCodes: ["IT462"],
        type: "Core Analytics Lecture",
        venue: "Lecture Theatre 3",
        badge: "Core Lecture"
      },
      {
        id: "mon-5",
        time: "05:00 - 05:50 PM",
        startHour: 17.0,
        endHour: 17.83,
        courseTitle: "Computer Networks / Trustworthy AI / Cloud Computing",
        courseCodes: ["IT531", "IT586", "IT627"],
        type: "Systems / AI Elective",
        venue: "Networks & Systems Wing",
        badge: "Specialization"
      }
    ],

    "Tuesday": [
      {
        id: "tue-1",
        time: "11:00 - 11:50 AM",
        startHour: 11.0,
        endHour: 11.83,
        courseTitle: "Computer Networks / Trustworthy AI / Cloud Computing",
        courseCodes: ["IT531", "IT586", "IT627"],
        type: "Systems / AI Elective",
        venue: "Networks & Systems Wing",
        badge: "Specialization"
      },
      {
        id: "tue-2",
        time: "12:00 - 12:50 PM",
        startHour: 12.0,
        endHour: 12.83,
        courseTitle: "Design & Testing",
        courseCodes: ["IT643"],
        type: "Software Engineering Core",
        venue: "Lecture Theatre 2",
        badge: "Core Lecture"
      },
      {
        id: "tue-3",
        time: "03:00 - 03:50 PM",
        startHour: 15.0,
        endHour: 15.83,
        courseTitle: "Web Services & Service-Oriented Architecture",
        courseCodes: ["IT644"],
        type: "Web Services Laboratory Core",
        venue: "Tech Block - Lab 304",
        badge: "Core Lecture / Lab"
      },
      {
        id: "tue-4",
        time: "04:00 - 04:50 PM",
        startHour: 16.0,
        endHour: 16.83,
        courseTitle: "Big Data Processing / Advanced Algorithms",
        courseCodes: ["IE494", "IT580"],
        type: "Technical Elective",
        venue: "Lab Complex / LH-2",
        badge: "Tech Elective"
      }
    ],

    "Wednesday": [
      {
        id: "wed-1",
        time: "12:00 - 12:50 PM",
        startHour: 12.0,
        endHour: 12.83,
        courseTitle: "Web & Mobile Development",
        courseCodes: ["IT645"],
        type: "Core Postgraduate Course",
        venue: "Tech Complex LT-1",
        badge: "Core Lecture"
      },
      {
        id: "wed-2",
        time: "02:00 - 02:50 PM",
        startHour: 14.0,
        endHour: 14.83,
        courseTitle: "Data Analysis",
        courseCodes: ["IT462"],
        type: "Core Analytics Lecture",
        venue: "Lecture Theatre 3",
        badge: "Core Lecture"
      }
    ],

    "Thursday": [
      {
        id: "thu-1",
        time: "11:00 - 11:50 AM",
        startHour: 11.0,
        endHour: 11.83,
        courseTitle: "Creative Intelligence / Art of Influence / Management Skills",
        courseCodes: ["DE401", "HM443", "HM409"],
        type: "HSS / Management Elective",
        venue: "Lecture Theatre / Seminar Halls",
        badge: "Elective Basket"
      },
      {
        id: "thu-2",
        time: "12:00 - 12:50 PM",
        startHour: 12.0,
        endHour: 12.83,
        courseTitle: "Design & Testing",
        courseCodes: ["IT643"],
        type: "Software Engineering Core",
        venue: "Lecture Theatre 2",
        badge: "Core Lecture"
      },
      {
        id: "thu-3",
        time: "02:00 - 02:50 PM",
        startHour: 14.0,
        endHour: 14.83,
        courseTitle: "Web Services & Service-Oriented Architecture",
        courseCodes: ["IT644"],
        type: "Web Services Laboratory Core",
        venue: "Tech Block - Lab 304",
        badge: "Core Lecture / Lab"
      },
      {
        id: "thu-4",
        time: "03:00 - 03:50 PM",
        startHour: 15.0,
        endHour: 15.83,
        courseTitle: "Big Data Processing / Advanced Algorithms",
        courseCodes: ["IE494", "IT580"],
        type: "Technical Elective",
        venue: "Lab Complex / LH-2",
        badge: "Tech Elective"
      },
      {
        id: "thu-5",
        time: "04:00 - 04:50 PM",
        startHour: 16.0,
        endHour: 16.83,
        courseTitle: "Data Analysis",
        courseCodes: ["IT462"],
        type: "Core Analytics Lecture",
        venue: "Lecture Theatre 3",
        badge: "Core Lecture"
      }
    ],

    "Friday": [
      {
        id: "fri-1",
        time: "08:00 - 08:50 AM",
        startHour: 8.0,
        endHour: 8.83,
        courseTitle: "Design & Testing",
        courseCodes: ["IT643"],
        type: "Software Engineering Core",
        venue: "Lecture Theatre 2",
        badge: "Core Lecture"
      },
      {
        id: "fri-2",
        time: "11:00 - 11:50 AM",
        startHour: 11.0,
        endHour: 11.83,
        courseTitle: "Creative Intelligence / Art of Influence / Management Skills",
        courseCodes: ["DE401", "HM443", "HM409"],
        type: "HSS / Management Elective",
        venue: "Lecture Theatre / Seminar Halls",
        badge: "Elective Basket"
      },
      {
        id: "fri-3",
        time: "12:00 - 12:50 PM",
        startHour: 12.0,
        endHour: 12.83,
        courseTitle: "Web & Mobile Development",
        courseCodes: ["IT645"],
        type: "Core Postgraduate Course",
        venue: "Tech Complex LT-1",
        badge: "Core Lecture"
      },
      {
        id: "fri-4",
        time: "04:00 - 04:50 PM",
        startHour: 16.0,
        endHour: 16.83,
        courseTitle: "Web Services & Service-Oriented Architecture",
        courseCodes: ["IT644"],
        type: "Web Services Laboratory Core",
        venue: "Tech Block - Lab 304",
        badge: "Core Lecture / Lab"
      },
      {
        id: "fri-5",
        time: "05:00 - 05:50 PM",
        startHour: 17.0,
        endHour: 17.83,
        courseTitle: "Computer Networks / Trustworthy AI / Cloud Computing",
        courseCodes: ["IT531", "IT586", "IT627"],
        type: "Systems / AI Elective",
        venue: "Networks & Systems Wing",
        badge: "Specialization"
      }
    ]
  },

  // Academic Timeline: "My Academic Journey" from official DAU Calendar 2026-27
  journeyTimeline: [
    {
      stage: "Autumn Registration",
      period: "July 2026",
      desc: "Course enrollment and prerequisite approval for Autumn 2026-27.",
      state: "done"
    },
    {
      stage: "Regular Classes & Labs",
      period: "Aug - Nov 2026",
      desc: "Instruction, continuous evaluations, laboratory projects, and tutorials.",
      state: "active"
    },
    {
      stage: "First In-Semester Examination",
      period: "Sep 2026",
      desc: "Mid-semester component 1 examinations concluded.",
      state: "done"
    },
    {
      stage: "Second In-Semester Examination",
      period: "06-10-2026 to 10-10-2026",
      desc: "Official second evaluation cycle across all postgraduate and undergraduate courses.",
      state: "current"
    },
    {
      stage: "In-Semester Break",
      period: "09-11-2026 to 13-11-2026",
      desc: "Scheduled autumn university mid-semester break for students.",
      state: "upcoming"
    },
    {
      stage: "Last Date of Classes & Labs",
      period: "20-11-2026",
      desc: "Formal conclusion of Autumn semester teaching and lab coursework.",
      state: "upcoming"
    },
    {
      stage: "End-Semester Examination",
      period: "23-11-2026 to 02-12-2026",
      desc: "Comprehensive end-term evaluations as per DAU Examination Office schedule.",
      state: "upcoming"
    },
    {
      stage: "Announcement of Results",
      period: "14-12-2026",
      desc: "Declaration of official semester grades and updated CPI records.",
      state: "upcoming"
    },
    {
      stage: "Registration for Winter 2026-27",
      period: "07-12-2026 to 21-12-2026",
      desc: "Subsequent semester enrollment and winter internship confirmation.",
      state: "upcoming"
    }
  ],

  // Noticeboard: DAU-Specific Notices with official calendar dates & placement policy
  announcements: [
    {
      id: 1,
      title: "Second In-Semester Examination Schedule (06-10-2026 to 10-10-2026)",
      category: "examination",
      categoryLabel: "Examination",
      badgeClass: "cat-exam",
      date: "Sep 28, 2026",
      isOfficialCalendar: true,
      summary: "Official schedule for the upcoming Second In-Semester Examination cycle as per Academic Calendar 2026-27.",
      details: "Examinations will be held strictly between 06-10-2026 and 10-10-2026. Students in M.Sc. IT Semester 3 must ensure minimum 80% attendance to receive their hall tickets. Seating arrangements will be published on the portal 48 hours prior."
    },
    {
      id: 2,
      title: "Notice: Registration for Winter 2026-27 (07-12-2026 to 21-12-2026)",
      category: "registration",
      categoryLabel: "Registration",
      badgeClass: "cat-reg",
      date: "Sep 26, 2026",
      isOfficialCalendar: true,
      summary: "Academic Office circular regarding elective registration and Winter Semester 2026-27 timeline.",
      details: "Course registration for the upcoming Winter 2026-27 session will remain open from 07-12-2026 to 21-12-2026. Final-year students undertaking full-time Winter Internships (WI) must submit faculty advisor approval forms."
    },
    {
      id: 3,
      title: "In-Semester Break Schedule: 09-11-2026 to 13-11-2026",
      category: "academic",
      categoryLabel: "Academic",
      badgeClass: "cat-academic",
      date: "Sep 24, 2026",
      isOfficialCalendar: true,
      summary: "University recess notification for students and academic faculty.",
      details: "As sanctioned in the DAU Academic Calendar 2026-27, the In-Semester Break is scheduled from 09-11-2026 to 13-11-2026. Regular academic sessions will resume promptly on Monday, 16-11-2026."
    },
    {
      id: 4,
      title: "End-Semester Examination & Grade Announcement Timeline",
      category: "examination",
      categoryLabel: "Examination",
      badgeClass: "cat-exam",
      date: "Sep 22, 2026",
      isOfficialCalendar: true,
      summary: "End-Semester exams scheduled 23-11-2026 to 02-12-2026; Results on 14-12-2026.",
      details: "The final teaching day for classes, labs, and tutorials is 20-11-2026. End-Semester examinations will take place from 23-11-2026 through 02-12-2026, followed by the formal Announcement of Results on 14-12-2026."
    },
    {
      id: 5,
      title: "Placement Drive 2025-26: Eligibility & Category Guidelines",
      category: "administration",
      categoryLabel: "Placement Cell",
      badgeClass: "cat-admin",
      date: "Sep 20, 2026",
      isOfficialCalendar: false,
      summary: "Placement Cell notification regarding PG eligibility criteria (CPI >= 6.0) and Company Categories.",
      details: "As per Placement Policy 2025-26: Postgraduate students with CPI >= 6.0 are eligible. Company classification: Category I (CTC >= INR 10 LPA) and Category II (CTC < INR 10 LPA). Winter Internship (WI) switch rules apply under 1.5x rule."
    }
  ],

  // Academic Calendar Milestones (Calendar Card)
  calendarEvents: [
    {
      title: "Second In-Semester Examination",
      dates: "06-10-2026 to 10-10-2026",
      type: "Exam",
      typeBadge: "Exam"
    },
    {
      title: "In-Semester Break",
      dates: "09-11-2026 to 13-11-2026",
      type: "Break",
      typeBadge: "Recess"
    },
    {
      title: "Last date of Class, Lab & Tutorial",
      dates: "20-11-2026",
      type: "Academic",
      typeBadge: "Deadline"
    },
    {
      title: "End-Semester Examination",
      dates: "23-11-2026 to 02-12-2026",
      type: "Exam",
      typeBadge: "Exam"
    },
    {
      title: "Announcement of Results",
      dates: "14-12-2026",
      type: "Results",
      typeBadge: "Grades"
    },
    {
      title: "Registration for Winter 2026-27",
      dates: "07-12-2026 to 21-12-2026",
      type: "Registration",
      typeBadge: "Portal"
    }
  ],

  // Placement Hub Data (From verified Placement Policy 2025-26)
  placementHub: {
    policyTitle: "Placement Policy 2025-26",
    pgCriteria: "CPI >= 6.0",
    studentCpi: 6.38,
    isEligible: true,
    cat1: "CTC >= INR 10 LPA",
    cat2: "CTC < INR 10 LPA",
    switchRule: "1.5x CTC Switch Rule (Category II WI only)"
  },

  // Campus Life Photographs (Local Student Group Photographs)
  campusPhotos: {
    feature: {
      src: "assets/campus_life_feature.jpg",
      title: "Student Community & Cultural Celebration",
      subtitle: "Navratri & Festival Celebrations on DAU Campus grounds",
      tag: "Student Community"
    },
    community: {
      src: "assets/campus_life_community.jpg",
      title: "Campus Gathering & Fellowship",
      subtitle: "Evening gatherings at the lush green campus lawns",
      tag: "Campus Life"
    },
    activities: {
      src: "assets/campus_life_activities.jpg",
      title: "Student Activities & Cohort Spirit",
      subtitle: "M.Sc. IT and postgraduate cohort events and celebrations",
      tag: "Student Activities"
    }
  },

  // Quick Services Action Items
  services: [
    { id: "srv-att", name: "Attendance", desc: "Subject-wise logs and lecture percentage", badge: "86.7% Active" },
    { id: "srv-reg", name: "Registration", desc: "Winter 2026-27 course elective enrollment", badge: "Opens Dec 7" },
    { id: "srv-fee", name: "Fee Payment", desc: "Pay semester academic and lab charges", badge: "Receipts" },
    { id: "srv-trn", name: "Transcript", desc: "Official grade card and transcript requests", badge: "Self-Service" },
    { id: "srv-lib", name: "Library", desc: "Resource search, IEEE explorer & renewals", badge: "24/7 Access" },
    { id: "srv-tt", name: "Timetable", desc: "M.Sc. IT Semester 3 master schedule", badge: "Autumn Batch" }
  ]
};

// ============================================================================
// 2. DOM Initialization
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initGreetingAndClock();
  initDauTodayCountdown();
  renderStudentProfile();
  initStatCounters();
  initTimetableDaySelector();
  renderTimetable();
  renderTodayTimetableStrip();
  renderAcademicTimeline();
  renderCalendarEvents();
  renderAnnouncements(CampusData.announcements);
  initNoticeboardSearchAndFilter();
  initMobileMenu();
  initNotificationBadge();
  initScrollAnimations();
});

// ============================================================================
// 3. Feature 1: Theme Switch (Light/Dark Mode persisted in localStorage)
// ============================================================================
function initTheme() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const storedTheme = localStorage.getItem("dau_portal_theme");
  
  if (storedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("dau_portal_theme", nextTheme);
      showToast("Theme Updated", `Switched to ${nextTheme === "dark" ? "Dark" : "Light"} Mode`);
    });
  }
}

// ============================================================================
// 4. Feature 2 & 3: Dynamic Time-based Greeting & Live Clock / Date
// ============================================================================
function initGreetingAndClock() {
  updateTimeAndGreeting();
  setInterval(updateTimeAndGreeting, 1000);
}

function updateTimeAndGreeting() {
  const now = new Date();
  
  // Greeting based on time
  const hours = now.getHours();
  let greeting = "Good Day";
  let icon = "👋";

  if (hours >= 4 && hours < 12) {
    greeting = "Good Morning";
    icon = "☀️";
  } else if (hours >= 12 && hours < 17) {
    greeting = "Good Afternoon";
    icon = "🌤️";
  } else if (hours >= 17 && hours < 22) {
    greeting = "Good Evening";
    icon = "🌆";
  } else {
    greeting = "Good Night";
    icon = "🌙";
  }

  const greetingEl = document.getElementById("greetingText");
  if (greetingEl) {
    greetingEl.innerHTML = `${icon} ${greeting},`;
  }

  // Live Clock (HH:MM:SS AM/PM)
  const clockDigitsEl = document.getElementById("liveClockDigits");
  if (clockDigitsEl) {
    clockDigitsEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }

  // Live Date
  const dateLabelEl = document.getElementById("liveDateLabel");
  if (dateLabelEl) {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    dateLabelEl.textContent = now.toLocaleDateString('en-US', dateOptions);
  }
}

// ============================================================================
// 5. DAU TODAY Widget: Milestone Countdown & Progress Calculation
// ============================================================================
function initDauTodayCountdown() {
  const milestone = CampusData.dauTodayMilestone;
  const targetDate = new Date(milestone.startDate);
  
  const updateCountdown = () => {
    const now = new Date();
    const diffMs = targetDate - now;

    const daysEl = document.getElementById("countdownDays");
    const hoursEl = document.getElementById("countdownHours");
    const minsEl = document.getElementById("countdownMins");
    const progressFill = document.getElementById("milestoneProgressFill");
    const statusNote = document.getElementById("milestoneStatusNote");

    if (diffMs > 0) {
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / 1000 / 60) % 60);

      if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
      if (minsEl) minsEl.textContent = String(minutes).padStart(2, "0");

      if (statusNote) statusNote.textContent = `${days} days remaining until exam commencement`;
      
      // Progress calculation for Autumn Semester (Aug 1 to Oct 6 as initial phase)
      const semesterStart = new Date("2026-08-01T00:00:00+05:30").getTime();
      const examStart = targetDate.getTime();
      const currentTime = now.getTime();
      const totalSpan = examStart - semesterStart;
      const elapsed = currentTime - semesterStart;
      const pct = Math.min(100, Math.max(10, Math.round((elapsed / totalSpan) * 100)));
      if (progressFill) progressFill.style.width = `${pct}%`;
    } else {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minsEl) minsEl.textContent = "00";
      if (statusNote) statusNote.textContent = "In Progress / Active Session";
      if (progressFill) progressFill.style.width = "100%";
    }
  };

  updateCountdown();
  setInterval(updateCountdown, 60000); // refresh every minute
}

// ============================================================================
// 6. Render Student Profile in Welcome Hero
// ============================================================================
function renderStudentProfile() {
  const s = CampusData.student;
  
  const nameDisplay = document.getElementById("studentNameDisplay");
  const idDisplay = document.getElementById("studentIdDisplay");
  const progDisplay = document.getElementById("studentProgramDisplay");
  const semDisplay = document.getElementById("studentSemDisplay");
  const avatarInitials = document.getElementById("studentAvatarInitials");
  const quickName = document.getElementById("quickUserName");

  if (nameDisplay) nameDisplay.textContent = s.name;
  if (idDisplay) idDisplay.textContent = s.id;
  if (progDisplay) progDisplay.textContent = s.program;
  if (semDisplay) semDisplay.textContent = s.semester;
  if (avatarInitials) avatarInitials.textContent = s.initials;
  if (quickName) quickName.textContent = s.name.split(" ")[0];
}

// ============================================================================
// 7. Stat Number Counter Animation on Page Load / Visibility
// ============================================================================
function initStatCounters() {
  const stats = CampusData.statistics;
  
  // Update attendance
  animateCount("attendanceValue", 0, stats.attendance.num, 1200, "%");
  setCardDetails("attendanceLabel", stats.attendance.label, "attendanceTrend", stats.attendance.trend);

  // Active courses
  animateCount("coursesValue", 0, stats.courses.num, 800, "");
  setCardDetails("coursesLabel", stats.courses.label, "coursesTrend", stats.courses.trend);

  // Assignments
  const assignEl = document.getElementById("assignmentsValue");
  if (assignEl) assignEl.textContent = `${stats.assignments.num} Pending`;
  setCardDetails("assignmentsLabel", stats.assignments.label, "assignmentsTrend", stats.assignments.trend);

  // Exams
  const examsEl = document.getElementById("examsValue");
  if (examsEl) examsEl.textContent = stats.exams.suffix;
  setCardDetails("examsLabel", stats.exams.label, "examsTrend", stats.exams.trend);

  // CPI
  animateCount("cgpaValue", 0, stats.cpi.num, 1400, "", 2);
  setCardDetails("cgpaLabel", stats.cpi.label, "cgpaTrend", stats.cpi.trend);

  // Notifications
  const notifEl = document.getElementById("notificationsValue");
  if (notifEl) notifEl.textContent = `${stats.notifications.num} Unread`;
  setCardDetails("notificationsLabel", stats.notifications.label, "notificationsTrend", stats.notifications.trend);
}

function setCardDetails(labelId, labelText, trendId, trendText) {
  const l = document.getElementById(labelId);
  const t = document.getElementById(trendId);
  if (l) l.textContent = labelText;
  if (t) t.textContent = trendText;
}

function animateCount(id, start, end, duration, suffix = "", decimals = 1) {
  const el = document.getElementById(id);
  if (!el) return;

  const startTime = performance.now();
  const update = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out expo curve
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = start + (end - start) * easeProgress;
    
    el.textContent = `${decimals > 0 && end % 1 !== 0 ? current.toFixed(decimals) : Math.round(current)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = `${decimals > 0 && end % 1 !== 0 ? end.toFixed(decimals) : end}${suffix}`;
    }
  };
  requestAnimationFrame(update);
}

// ============================================================================
// 8. Render Timetable (Interactive Day Selector, Live Status, Full Weekly Grid)
// ============================================================================
function initTimetableDaySelector() {
  // Automatically select current day of week if Monday-Friday, else default to Monday
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[new Date().getDay()];
  if (CampusData.weeklyTimetable[todayName]) {
    CampusData.activeTimetableDay = todayName;
  } else {
    CampusData.activeTimetableDay = "Monday";
  }

  // Day pill buttons listener — also update aria-selected
  const dayBtns = document.querySelectorAll(".tt-day-btn");
  dayBtns.forEach(btn => {
    const day = btn.getAttribute("data-day");
    const isActive = day === CampusData.activeTimetableDay;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");

    btn.addEventListener("click", () => {
      dayBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      CampusData.activeTimetableDay = day;
      renderTimetable();
    });
  });

  // View toggle: Day View vs Weekly Master View
  const viewToggleBtn = document.getElementById("ttViewToggleBtn");
  if (viewToggleBtn) {
    viewToggleBtn.addEventListener("click", () => {
      const isWeekly = document.getElementById("timetableWeeklyView").classList.toggle("view-active");
      document.getElementById("timetableDayView").classList.toggle("view-hidden", isWeekly);
      viewToggleBtn.textContent = isWeekly ? "View Daily List" : "View Full Master Schedule";
      showToast(
        isWeekly ? "Weekly Schedule" : "Daily Schedule",
        isWeekly ? "Displaying full weekly master timetable matrix (Mon-Fri)." : `Displaying ${CampusData.activeTimetableDay}'s class schedule.`
      );
    });
  }
}

function renderTimetable() {
  const container = document.getElementById("timetableContainer");
  const badgeTitle = document.getElementById("timetableDayBadge");
  if (!container) return;

  const currentDay = CampusData.activeTimetableDay || "Monday";
  if (badgeTitle) {
    badgeTitle.textContent = `${currentDay} Schedule`;
  }

  const daySchedule = CampusData.weeklyTimetable[currentDay] || [];
  container.innerHTML = "";

  if (daySchedule.length === 0) {
    container.innerHTML = `<p class="empty-state-text">No lectures scheduled for ${currentDay}. Enjoy your academic self-study!</p>`;
    return;
  }

  // Calculate live/completed status relative to current time and today
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const isActualToday = dayNames[now.getDay()] === currentDay;
  const currentDecimalHour = now.getHours() + (now.getMinutes() / 60);

  daySchedule.forEach(slot => {
    let sessionState = "upcoming";
    let statusLabel = "Upcoming";
    let statusClass = "status-upcoming";

    if (isActualToday) {
      if (currentDecimalHour >= slot.endHour) {
        sessionState = "completed";
        statusLabel = "Completed";
        statusClass = "status-completed";
      } else if (currentDecimalHour >= slot.startHour && currentDecimalHour < slot.endHour) {
        sessionState = "live";
        statusLabel = "In Progress";
        statusClass = "status-live";
      }
    }

    // Format course code pill tags
    const codePills = slot.courseCodes.map(code => `<span class="course-code-pill">${code}</span>`).join(" ");

    const card = document.createElement("div");
    card.className = `timetable-card status-${sessionState}`;

    card.innerHTML = `
      <div class="timetable-time-box">
        <span class="time-range">${slot.time}</span>
        <span class="time-type-badge">${sessionState === 'live' ? '● Live Right Now' : slot.badge}</span>
      </div>
      <div class="timetable-details">
        <div class="course-codes-row">${codePills}</div>
        <h4 class="subject-name">${slot.courseTitle}</h4>
        <div class="subject-meta">
          <span class="meta-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            ${slot.venue}
          </span>
          <span class="meta-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            ${slot.type}
          </span>
        </div>
      </div>
      <span class="timetable-status-pill ${statusClass}">${statusLabel}</span>
    `;
    container.appendChild(card);
  });

  renderWeeklyMasterGrid();
}

// ============================================================================
// 8b. Render Today's Timetable Quick-View Strip
// ============================================================================
function renderTodayTimetableStrip() {
  const slotsRow = document.getElementById("todayTimetableSlots");
  const emptyEl = document.getElementById("todayTtEmpty");
  const dayBadgeEl = document.getElementById("todayTtDayBadge");
  const noteEl = document.getElementById("todayTtNote");
  if (!slotsRow) return;

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  const todayName = dayNames[now.getDay()];
  const todaySchedule = CampusData.weeklyTimetable[todayName] || [];
  const currentDecimalHour = now.getHours() + (now.getMinutes() / 60);
  const isWeekday = !!CampusData.weeklyTimetable[todayName];

  // Update badge and note
  if (dayBadgeEl) dayBadgeEl.textContent = todayName;
  if (noteEl) {
    noteEl.textContent = isWeekday
      ? `${todaySchedule.length} class${todaySchedule.length !== 1 ? 'es' : ''} scheduled • Live status updates every minute`
      : "No classes today — it's a weekend or holiday";
  }

  slotsRow.innerHTML = "";

  if (!isWeekday || todaySchedule.length === 0) {
    slotsRow.style.display = "none";
    if (emptyEl) emptyEl.style.display = "flex";
    return;
  }

  slotsRow.style.display = "flex";
  if (emptyEl) emptyEl.style.display = "none";

  // Determine the index of the next upcoming slot
  let nextSlotIdx = -1;
  for (let i = 0; i < todaySchedule.length; i++) {
    const slot = todaySchedule[i];
    if (currentDecimalHour < slot.startHour) {
      nextSlotIdx = i;
      break;
    }
  }

  todaySchedule.forEach((slot, idx) => {
    let state = "upcoming";
    let chipText = "Upcoming";
    let chipClass = "";
    let timeClass = "";
    let cardClass = "";

    if (currentDecimalHour >= slot.endHour) {
      state = "completed";
      chipText = "Done";
      chipClass = "chip-done";
      cardClass = "slot-completed";
    } else if (currentDecimalHour >= slot.startHour && currentDecimalHour < slot.endHour) {
      state = "live";
      chipText = "● Live";
      chipClass = "chip-live";
      timeClass = "live-time";
      cardClass = "slot-live";
    } else if (idx === nextSlotIdx) {
      state = "next";
      chipText = "Next Up";
      chipClass = "chip-next";
      cardClass = "slot-next";
    }

    const codeTags = slot.courseCodes
      .map(c => `<span class="slot-code-tag">${c}</span>`)
      .join("");

    const card = document.createElement("div");
    card.className = `today-tt-slot-card ${cardClass}`;
    card.innerHTML = `
      <div class="slot-time-row">
        <span class="slot-time-text ${timeClass}">${slot.time}</span>
        <span class="slot-status-chip ${chipClass}">${chipText}</span>
      </div>
      <div class="slot-course-codes">${codeTags}</div>
      <div class="slot-subject-title">${slot.courseTitle}</div>
      <div class="slot-venue-label">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        ${slot.venue}
      </div>
    `;
    slotsRow.appendChild(card);
  });

  // Scroll to live/next card automatically
  const liveCard = slotsRow.querySelector(".slot-live, .slot-next");
  if (liveCard) {
    setTimeout(() => liveCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" }), 400);
  }

  // Refresh strip every 60 seconds
  setTimeout(renderTodayTimetableStrip, 60000);
}

function renderWeeklyMasterGrid() {
  const gridContainer = document.getElementById("timetableWeeklyGrid");
  if (!gridContainer || gridContainer.children.length > 0) return; // render once

  gridContainer.innerHTML = "";
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[new Date().getDay()];
  const now = new Date();
  const currentDecimalHour = now.getHours() + (now.getMinutes() / 60);

  days.forEach(day => {
    const isToday = day === todayName;
    const col = document.createElement("div");
    col.className = `tt-day-column${isToday ? " tt-today-column" : ""}`;
    
    const slots = CampusData.weeklyTimetable[day] || [];
    let slotsHtml = slots.map(s => {
      let slotClass = "";
      if (isToday) {
        if (currentDecimalHour >= s.startHour && currentDecimalHour < s.endHour) {
          slotClass = "grid-slot-live";
        } else if (currentDecimalHour >= s.endHour) {
          slotClass = "grid-slot-done";
        }
      }
      return `
        <div class="tt-grid-slot ${slotClass}">
          <span class="grid-slot-time">${s.time}</span>
          <div class="grid-slot-codes">${s.courseCodes.join(" / ")}</div>
          <div class="grid-slot-title">${s.courseTitle}</div>
          <div class="grid-slot-venue">${s.venue}</div>
        </div>
      `;
    }).join("");

    col.innerHTML = `
      <div class="tt-day-col-header">
        <h4>${day}${isToday ? " <span class='today-col-indicator'>Today</span>" : ""}</h4>
        <span class="day-slot-count">${slots.length} Classes</span>
      </div>
      <div class="tt-col-slots-list">${slotsHtml || '<p class="no-class-note">No classes</p>'}</div>
    `;
    gridContainer.appendChild(col);
  });
}

// ============================================================================
// 9. Render "My Academic Journey" Timeline (Animated on scroll)
// ============================================================================
function renderAcademicTimeline() {
  const container = document.getElementById("timelineStagesContainer");
  if (!container) return;

  container.innerHTML = "";
  CampusData.journeyTimeline.forEach((stage, idx) => {
    const item = document.createElement("div");
    item.className = `timeline-node state-${stage.state}`;
    item.setAttribute("data-stage-idx", idx);

    let statusPill = "";
    if (stage.state === "done") statusPill = `<span class="timeline-status-pill pill-done">Completed</span>`;
    else if (stage.state === "current") statusPill = `<span class="timeline-status-pill pill-current">Current Focus</span>`;
    else if (stage.state === "active") statusPill = `<span class="timeline-status-pill pill-active">Ongoing</span>`;
    else statusPill = `<span class="timeline-status-pill pill-upcoming">Upcoming</span>`;

    item.innerHTML = `
      <div class="timeline-marker-col">
        <div class="timeline-dot">
          <span class="dot-inner"></span>
        </div>
        ${idx < CampusData.journeyTimeline.length - 1 ? '<div class="timeline-stem"></div>' : ''}
      </div>
      <div class="timeline-card">
        <div class="timeline-card-header">
          <span class="timeline-period-badge">${stage.period}</span>
          ${statusPill}
        </div>
        <h4 class="timeline-title">${stage.stage}</h4>
        <p class="timeline-desc">${stage.desc}</p>
      </div>
    `;
    container.appendChild(item);
  });
}

// ============================================================================
// 10. Render Academic Calendar Cards (Official 2026-27 Dates)
// ============================================================================
function renderCalendarEvents() {
  const container = document.getElementById("calendarEventsContainer");
  if (!container) return;

  container.innerHTML = "";
  CampusData.calendarEvents.forEach(item => {
    const el = document.createElement("div");
    el.className = "calendar-event-row";
    
    el.innerHTML = `
      <div class="cal-badge-box">
        <span class="cal-type-tag">${item.typeBadge}</span>
      </div>
      <div class="cal-details">
        <h4 class="cal-event-title">${item.title}</h4>
        <span class="cal-event-dates">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          ${item.dates}
        </span>
      </div>
      <span class="cal-official-tag" title="Verified from DAU Academic Calendar 2026-27">Official Calendar</span>
    `;
    container.appendChild(el);
  });
}

// ============================================================================
// 11. Render Noticeboard with Real-Time Search & Category Filters
// ============================================================================
function renderAnnouncements(items) {
  const container = document.getElementById("announcementsContainer");
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<p class="empty-state-text">No university notices match your filter keyword.</p>`;
    return;
  }

  container.innerHTML = "";
  items.forEach(a => {
    const card = document.createElement("article");
    card.className = "announcement-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");

    const officialBadge = a.isOfficialCalendar 
      ? `<span class="official-source-pill" title="Source: DAU Academic Calendar 2026-27">Academic Calendar 2026-27</span>`
      : `<span class="official-source-pill source-policy" title="Source: Placement Policy 2025-26">Placement Policy 2025-26</span>`;
    
    card.innerHTML = `
      <div class="announcement-meta-row">
        <div class="meta-tag-group">
          <span class="category-tag ${a.badgeClass}">${a.categoryLabel}</span>
          ${officialBadge}
        </div>
        <span class="announcement-date">${a.date}</span>
      </div>
      <h4 class="announcement-title">
        <span>${a.title}</span>
        <svg class="expand-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </h4>
      <p class="announcement-description">${a.summary}</p>
      <div class="announcement-expanded-content">
        <p>${a.details}</p>
      </div>
    `;

    // Expand/Collapse interaction
    const toggle = () => {
      const isExpanded = card.classList.toggle("expanded");
      card.setAttribute("aria-expanded", isExpanded);
    };

    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    container.appendChild(card);
  });
}

function initNoticeboardSearchAndFilter() {
  const searchInput = document.getElementById("announcementSearchInput");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let activeCategory = "all";
  let searchKeyword = "";

  const applyFilters = () => {
    const filtered = CampusData.announcements.filter(item => {
      const matchesCategory = (activeCategory === "all") || (item.category === activeCategory);
      const matchesSearch = item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                            item.summary.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                            item.details.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    renderAnnouncements(filtered);
  };

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchKeyword = e.target.value.trim();
      applyFilters();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-category");
      applyFilters();
    });
  });
}

// ============================================================================
// 12. Placement Hub & Quick Services Interactive Actions
// ============================================================================
function handleServiceClick(serviceName) {
  showToast(
    `Service Selected: ${serviceName}`,
    `Frontend prototype action triggered for DAU Portal. Ready for REST API integration in Lab 2.`
  );
}

function handlePlacementAction(actionType) {
  if (actionType === "policy") {
    showToast(
      "DAU Placement Policy 2025-26",
      "Official criteria: PG CPI >= 6.0 | Category I: CTC >= 10 LPA | Category II: CTC < 10 LPA with 1.5x Switch Rule."
    );
  } else if (actionType === "notices") {
    showToast(
      "Placement Cell Notices",
      "Displaying latest company schedules and Winter Internship (WI) selection processes."
    );
  } else if (actionType === "applications") {
    showToast(
      "My Placement Applications",
      "Current Status: Panthil Shah (CPI: 6.38) is eligible for PG Campus Placements 2025-26."
    );
  }
}

// ============================================================================
// 13. Notification Counter Interaction
// ============================================================================
function initNotificationBadge() {
  const notifBtn = document.getElementById("navNotificationsBtn");
  const notifCard = document.getElementById("notificationSummaryCard");

  const handleNotifClick = (e) => {
    e.preventDefault();
    if (CampusData.statistics.notifications.count > 0) {
      CampusData.statistics.notifications.count = 0;
      CampusData.statistics.notifications.num = 0;
      
      const badge = document.getElementById("navNotifBadge");
      if (badge) badge.style.display = "none";

      const notifValue = document.getElementById("notificationsValue");
      if (notifValue) notifValue.textContent = "All Read";

      const notifTrend = document.getElementById("notificationsTrend");
      if (notifTrend) notifTrend.textContent = "Up to date";

      showToast("Noticeboard Cleared", "You have marked all active DAU announcements as read.");
    } else {
      showToast("Noticeboard", "No unread alerts at this time.");
    }
  };

  if (notifBtn) notifBtn.addEventListener("click", handleNotifClick);
  if (notifCard) notifCard.addEventListener("click", handleNotifClick);
}

// ============================================================================
// 14. Mobile Menu Navigation
// ============================================================================
function initMobileMenu() {
  const menuToggle = document.getElementById("mobileMenuToggle");
  const mainNav = document.getElementById("mainNavigation");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("is-open");
    });
  }
}

// ============================================================================
// 15. IntersectionObserver Scroll Animations
// ============================================================================
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const observerOptions = {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal-on-scroll").forEach(el => {
    observer.observe(el);
  });
}

// ============================================================================
// 16. Reusable Toast Notification Feedback
// ============================================================================
let toastTimeout;
function showToast(title, message) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast-notification";
    toast.innerHTML = `
      <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <div class="toast-text">
        <span class="toast-title" id="toastTitle"></span>
        <span id="toastDesc"></span>
      </div>
    `;
    document.body.appendChild(toast);
  }

  document.getElementById("toastTitle").textContent = title;
  document.getElementById("toastDesc").textContent = message;

  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3800);
}
