import { API_BASE_URL, getAuthToken, fetchWithRetry } from './api';

export const b2bService = {
  // --- SUPER ADMIN: SCHOOLS ---
  async getSchools() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/admin/schools`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch schools");
    return res.json();
  },

  async addSchool(payload: any) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/admin/schools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to add school");
    return res.json();
  },

  // --- DIRECTOR: CLASSES & STATS ---
  async getDirectorDashboard() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/director/dashboard`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    return res.json();
  },

  async getClasses() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/director/classes`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch classes");
    return res.json();
  },

  async getClassDetails(classId: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/director/classes/${classId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch class details");
    return res.json();
  },

  // --- LIBRARIAN: BOOKS & ISSUING ---
  async getLibraryBooks() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/librarian/books`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch library books");
    return res.json();
  },

  async issueBook(payload: { student_id: string, book_id: string, due_date: string }) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/librarian/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to issue book");
    return res.json();
  },

  async getIssuedBooks() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/librarian/issued-books`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch issued books");
    return res.json();
  },

  async addLibrarian(payload: any) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/director/librarian`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to add librarian");
    return res.json();
  },
  
  // --- STUDENT: HOMEWORK ---
  async getStudentHomework() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/student/homework`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch homework");
    return res.json();
  }
};