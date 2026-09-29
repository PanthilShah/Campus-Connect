# CampusConnect – Smart University Service Portal
## Web Services & SOA Laboratory — Lab 1 + Lab 2: Frontend Prototype & REST API Integration
### Personalized for: Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar

---

## Lab 2 — REST API Integration

### API Mapping Table

| CampusConnect Section | HTTP Method | API Endpoint | Full URL | JSON Fields Used |
|---|---|---|---|---|
| Student Profile | GET | `/users/1` | `https://jsonplaceholder.typicode.com/users/1` | `name`, `username`, `email`, `phone`, `website` |
| Announcements | GET | `/posts?_limit=5` | `https://jsonplaceholder.typicode.com/posts?_limit=5` | `id`, `title`, `body` |
| Assignments | GET | `/todos?userId=1&_limit=5` | `https://jsonplaceholder.typicode.com/todos?userId=1&_limit=5` | `id`, `title`, `completed` |

### API Integration Flow
```
CampusConnect UI
  |
  |--- fetch(/users/1)  -->  JSON { name, username, email, phone, website }  --> Profile Banner
  |--- fetch(/posts)    -->  JSON [{ id, title, body }, ...]                  --> Announcements Section
  |--- fetch(/todos)    -->  JSON [{ id, title, completed }, ...]             --> Assignments Section
```

### Files Added in Lab 2
- `js/api.js` — All three `fetch()` calls, response handlers, DOM updaters, and interactions

### Interaction (Lab 2 Requirement)
- **Assignments**: Filter buttons — **All / Completed / Pending** — filter todo items client-side
- **Announcements**: Live search input — filter posts by title or body text
- **Header**: **Refresh button** — re-fetches all three APIs simultaneously

### Error Handling
- Every `fetch()` is wrapped in `try/catch`
- `response.ok` is checked before calling `.json()`
- On failure: an error card is shown with a **Retry** button that re-calls the API
- Loading spinner is displayed during in-flight requests

### Note on JSONPlaceholder Data
> JSONPlaceholder is a practice/mock REST API. Its data is **not real university data**. It is used purely to demonstrate REST API integration techniques as required by the Lab 2 assignment.

---


### 1. Project Title
**CampusConnect – Dhirubhai Ambani University Student Service Portal** (Frontend Prototype)

---

### 2. Project Description
CampusConnect is an interactive, responsive student portal prototype personalized specifically for **Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar**. Built as the foundational milestone of an 8-lab progression in **Web Services & Service-Oriented Architecture (SOA)**, it pairs authentic university academic milestones and placement policies with a componentized frontend architecture backed by centralized mock data.

The project models real-world university life for a postgraduate student in the **M.Sc. Information Technology** program, establishing clean separation across HTML structure, external CSS presentation, and vanilla JavaScript interactions.

---

### 3. Student Profile & Academic Persona
- **Student Name**: Panthil Shah
- **Student ID**: `MScIT-25-0XX` *(Fictional placeholder, non-real ID)*
- **Program**: M.Sc. Information Technology
- **School**: School of Technology
- **University**: Dhirubhai Ambani University *(formerly DA-IICT)*
- **Location**: Gandhinagar, Gujarat, India
- **Semester**: Semester 3 (Autumn 2026-27)
- **Cumulative CPI**: 6.38 *(Eligible for PG Campus Placements)*
- **Attendance**: 86.7% *(Above university examination eligibility threshold)*

---

### 4. Official Academic Calendar Integration (Autumn 2026-27)
All major calendar notices, timelines, and countdowns use verified milestones from the official **Dhirubhai Ambani University Academic Calendar 2026-27**:
- **Second In-Semester Examination**: 06-10-2026 to 10-10-2026
- **In-Semester Break**: 09-11-2026 to 13-11-2026
- **Last date of Class, Lab and Tutorial**: 20-11-2026
- **End-Semester Examination**: 23-11-2026 to 02-12-2026
- **Announcement of Results**: 14-12-2026
- **Registration for Winter 2026-27**: 07-12-2026 to 21-12-2026

---

### 5. Placement Policy 2025-26 Hub
Derived directly from the verified **Dhirubhai Ambani University Placement Policy 2025-26**:
- **PG Eligibility Criterion**: CPI &ge; 6.0 *(Panthil Shah holds 6.38 &mdash; Eligible)*
- **Company Category I**: CTC &ge; INR 10 LPA *(Single final offer lock)*
- **Company Category II**: CTC &lt; INR 10 LPA *(Eligible for switch under 1.5x rule)*
- **1.5x Switch Rule**: A student with a Category II Winter Internship (WI) only offer may participate in subsequent drives offering &ge; 1.5x CTC of the current offer.
- **Action Channels**: View Placement Policy, Placement Notices, and My Applications.

---

### 6. Technologies Used
- **HTML5**: Semantic markup (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **External CSS3**: Custom design tokens (CSS variables), CSS Grid & Flexbox, dark/light theme variables, glassmorphism, responsive breakpoints, and smooth micro-animations.
- **Vanilla JavaScript (ES6+)**: Centralized data store, real-time clock, dynamic time-of-day greeting, milestone countdown computation, number roll-up animations, keyword & category search filter, expandable accordion cards, and `IntersectionObserver` scroll reveals.
- **Assets**: Authentic student community and campus photographs illustrating university traditions, campus lawns, and postgraduate activities.

---

### 7. Project Structure
```text
CampusConnect/
│
├── index.html                  # Semantic HTML5 portal layout & accessibility attributes
├── css/
│   └── style.css               # External stylesheet (tokens, layout, dark theme, animations)
├── js/
│   ├── script.js               # Vanilla JavaScript with centralized mock data & DOM controllers
│   └── api.js                  # Lab 2: REST API fetch calls, JSON parsers, DOM updaters & filters
├── assets/                     # Student community photographs & vector crest graphics
│   ├── campus_life_feature.jpg    # Feature photo: Student Community cultural celebrations
│   ├── campus_life_community.jpg  # Supporting photo: Campus green lawns and evening gathering
│   └── campus_life_activities.jpg # Supporting photo: Student activities and cohort spirit
└── README.md                   # Complete documentation & Future API Mappings
```

---

### 8. Features & Components Implemented

1. **Navigation Bar (DAU Identity)**:
   - Geometric university crest logo and CampusConnect branding.
   - Distinctive *"formerly DA-IICT"* and *"Dhirubhai Ambani University"* tagline.
   - Quick links: Home, Services, Dashboard, Noticeboard, Profile.
   - Theme toggle button (Dark / Light mode).
   - Student quick-profile badge (`PS`).
   - Mobile responsive drawer navigation.

2. **Welcome Hero Section**:
   - Personalized student avatar with initials `PS`.
   - Dynamic time-based greeting (*Good Morning*, *Good Afternoon*, *Good Evening*).
   - Profile metadata pills (Student ID: `MScIT-25-0XX`, Program: M.Sc. IT, Semester: 3).
   - Live real-time digital clock and localized date.

3. **DAU TODAY Widget (Next Academic Milestone)**:
   - Tracks the **Second In-Semester Examination (06–10 October 2026)**.
   - Live countdown displaying remaining Days, Hours, and Minutes.
   - Visual progress bar showing semester timeline completion.

4. **Academic Summary Cards (Believable Student Data)**:
   - **Attendance**: `86.7%` *(Eligible for exams / above 80% threshold)*
   - **Active Courses**: `4` *(M.Sc. IT Core / 16 Credits)*
   - **Assignments**: `2 Pending` *(Action required / due next week)*
   - **Next Exam**: `06-10 Oct` *(In-Sem 2 preparation window)*
   - **Cumulative CPI**: `6.38` *(Eligible for PG Placements)*
   - **Noticeboard**: `4 Unread` *(Interactive mark-all-read trigger)*

5. **Today's Timetable (Realistic M.Sc. IT Curriculum)**:
   - **IT644**: Web Services & Service-Oriented Architecture (Completed)
   - **IT622**: Cloud Computing & Containerization (Live session with pulse animation)
   - **IT631**: Database Management & NoSQL Systems (Upcoming)
   - **IT655**: Software Engineering & Microservices (Upcoming)

6. **"My Academic Journey" Timeline**:
   - Scroll-animated timeline tracing Autumn Registration &rarr; Classes &rarr; In-Sem 1 &rarr; **In-Sem 2 (Current Focus)** &rarr; In-Sem Break &rarr; End-Sem &rarr; Results &rarr; Winter Registration.

7. **Placement Hub (DAU Placement Policy 2025-26)**:
   - Displays student CPI eligibility badge (`CPI 6.38 >= 6.0`).
   - Category I (&ge; 10 LPA) and Category II (&lt; 10 LPA) guidelines.
   - Explanation of the 1.5x CTC Switch Rule.
   - Prototype buttons for Policy details, Notices, and Applications.

8. **Official Academic Calendar Section**:
   - Calendar cards displaying all key 2026-27 dates and verification badges.

9. **Noticeboard with Real-Time Search & Category Filters**:
   - Live keyword search matching title, summary, and details.
   - Filter buttons: *All*, *Examination*, *Academic*, *Registration*, *Administration*.
   - Expandable accordion cards with full administrative circular details.

10. **"Life at DAU" Campus Life Photographs**:
    - High-quality student group photographs displaying cultural celebrations, campus lawns, and cohort camaraderie with subtle hover zoom and gradient overlays.

11. **Quick Services**:
    - Action buttons for *Attendance*, *Registration*, *Fee Payment*, *Transcript*, *Library*, and *Timetable* with animated toast feedback.

12. **Footer (Official University Details)**:
    - Address: *DA-IICT Road, Gandhinagar 382007, Gujarat, India*.
    - Official contact numbers: `079 6826 1700`, `079 6826 1710`.
    - Department links: Academic Services, Examination Department, Placement Office, Student Support.

---

### 9. JavaScript Interactions Implemented
| # | Interaction | Description |
|---|-------------|-------------|
| 1 | **Theme Switch (Light/Dark Mode)** | Toggles `data-theme` between `light` and `dark` and saves choice in `localStorage`. |
| 2 | **Dynamic Time-based Greeting** | Updates greeting headline according to current hour. |
| 3 | **Live Real-Time Date & Clock** | Updates `HH:MM:SS AM/PM` and formatted date every second. |
| 4 | **DAU TODAY Milestone Countdown** | Dynamically calculates days, hours, and minutes remaining until In-Sem 2 (Oct 6, 2026). |
| 5 | **Animated Number Roll-ups** | Smoothly animates statistics (Attendance 86.7%, CPI 6.38) from 0 using ease-out curves. |
| 6 | **Noticeboard Search & Filter** | Instant real-time search and category filtering without page reloads. |
| 7 | **Expandable Accordion Cards** | Interactive expansion of announcement circulars with ARIA attributes. |
| 8 | **Notification Counter Action** | Clicking notification bell marks notices as read and dismisses the badge. |
| 9 | **IntersectionObserver Scroll Reveals** | Smooth slide-up transitions when sections enter the viewport. |
| 10 | **Prototype Action Toast Notifications** | Floating alerts for Placement Hub and Quick Service prototype interactions. |

---

### 10. Future Service Mapping (Web Services & SOA Progression)

| UI Component | Current Mock Data | Future Lab Milestone | Future REST API Endpoint | HTTP Method |
|--------------|-------------------|----------------------|--------------------------|-------------|
| **Student Profile** | `CampusData.student` | Lab 2 (JSONPlaceholder) / Lab 3 (Student REST API) | `/users/1` or `/students/{id}` | `GET` |
| **Academic Stats / CPI** | `CampusData.statistics` | Lab 3 & 4 (Student Service + MongoDB) | `/students/{id}/academic-summary` | `GET` |
| **Courses** | `CampusData.statistics.courses` | Lab 3 (Student REST API) | `/students/{id}/courses` | `GET` |
| **Assignments** | `CampusData.statistics.assignments` | Lab 2 (JSONPlaceholder Todos) | `/todos?userId=1&_limit=5` | `GET` |
| **Noticeboard** | `CampusData.announcements` | Lab 2 (JSONPlaceholder Posts) / Lab 3 (Notices API) | `/posts?_limit=5` or `/announcements` | `GET` |
| **Timetable** | `CampusData.timetable` | Lab 3 & 6 (Timetable Microservice) | `/timetable/today` | `GET` |
| **Academic Calendar** | `CampusData.calendarEvents` | Lab 6 (Academic Microservice) | `/academic-calendar/2026-27` | `GET` |
| **Placement Hub** | `CampusData.placementHub` | Lab 6 & 7 (Placement Microservice) | `/placements/eligibility/{id}` | `GET` |
| **Fee Payment** | Quick Services Button | Lab 6 & 7 (Payment Microservice) | `/api/v1/payments/checkout` | `POST` |
| **Registration** | Quick Services Button | Lab 3 & 6 (Registration Service) | `/students/{id}/register` | `POST` |
| **Transcript Request**| Quick Services Button | Lab 6 (Academic Microservice) | `/transcripts/request` | `POST` |

---

### 11. How to Run the Project
1. Navigate to the project directory:
   ```powershell
   cd "CampusConnect"
   ```
2. Double-click `index.html` to open in any web browser (Chrome, Edge, Firefox, Safari).
3. Or launch with a local HTTP server:
   ```powershell
   python -m http.server 8000
   ```
   Open `http://localhost:8000`.
