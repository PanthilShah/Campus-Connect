/**
 * In-Memory Student Store
 * Lab 3 - Web Services & SOA Laboratory
 * Pre-seeded with Dhirubhai Ambani University (formerly DA-IICT) cohort data.
 */

let students = [
  {
    id: "MScIT-25-001",
    name: "Panthil Shah",
    email: "panthil.shah@dau.ac.in",
    course: "M.Sc. Information Technology",
    semester: 3,
    createdAt: new Date("2026-08-01T09:00:00.000Z").toISOString()
  },
  {
    id: "MScIT-25-002",
    name: "Rhea Deshmukh",
    email: "rhea.deshmukh@dau.ac.in",
    course: "M.Sc. Information Technology",
    semester: 3,
    createdAt: new Date("2026-08-01T09:15:00.000Z").toISOString()
  },
  {
    id: "MScIT-25-003",
    name: "Siddharth Mehta",
    email: "siddharth.mehta@dau.ac.in",
    course: "M.Sc. Information Technology",
    semester: 3,
    createdAt: new Date("2026-08-01T09:30:00.000Z").toISOString()
  },
  {
    id: "BTech-23-142",
    name: "Ananya Joshi",
    email: "ananya.joshi@dau.ac.in",
    course: "B.Tech. Information & Communication Technology",
    semester: 5,
    createdAt: new Date("2026-08-01T10:00:00.000Z").toISOString()
  }
];

let idCounter = 5;

const studentStore = {
  getAll: () => [...students],

  getById: (id) => {
    return students.find(s => String(s.id).toLowerCase() === String(id).toLowerCase());
  },

  create: (data) => {
    const newId = data.id || `MScIT-25-00${idCounter++}`;
    const newStudent = {
      id: newId,
      name: data.name,
      email: data.email,
      course: data.course,
      semester: data.semester,
      createdAt: new Date().toISOString()
    };
    students.push(newStudent);
    return newStudent;
  },

  update: (id, data) => {
    const idx = students.findIndex(s => String(s.id).toLowerCase() === String(id).toLowerCase());
    if (idx === -1) return null;

    students[idx] = {
      ...students[idx],
      name: data.name,
      email: data.email,
      course: data.course,
      semester: data.semester,
      updatedAt: new Date().toISOString()
    };
    return students[idx];
  },

  delete: (id) => {
    const idx = students.findIndex(s => String(s.id).toLowerCase() === String(id).toLowerCase());
    if (idx === -1) return null;
    const removed = students.splice(idx, 1);
    return removed[0];
  },

  reset: () => {
    // Helper to reset store for testing
    idCounter = 5;
  }
};

module.exports = studentStore;
