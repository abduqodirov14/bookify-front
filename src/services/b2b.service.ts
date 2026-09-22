import { getBaseApiUrl, getAuthToken, fetchWithRetry } from './api';

const getUrl = (endpoint: string) => `${getBaseApiUrl()}${endpoint}`;

export const b2bService = {
  // --- SUPER ADMIN: SCHOOLS ---
  async getSchools() {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl('/admin/schools'), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Maktablarni yuklab bo'lmadi");
    return res.json();
  },

  async addSchool(payload: any) {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl('/admin/schools'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Maktab qo'shishda xatolik");
    return res.json();
  },

  // --- DIRECTOR: CLASSES & STATS ---
  async getDirectorDashboard() {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl('/director/dashboard'), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Dashboardni yuklab bo'lmadi");
    return res.json();
  },

  async getClasses() {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl('/director/classes'), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Sinflarni yuklab bo'lmadi");
    return res.json();
  },

  async getClassDetails(classId: string) {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl(`/director/classes/${classId}`), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Sinf ma'lumotlarini yuklab bo'lmadi");
    return res.json();
  },

  // --- LIBRARIAN: BOOKS & ISSUING ---
  async getLibraryBooks() {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl('/librarian/books'), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Kutubxona kitoblarini yuklab bo'lmadi");
    return res.json();
  },

  async issueBook(payload: { student_id: string; book_id: string; due_date: string }) {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl('/librarian/issue'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Kitob berishda xatolik");
    return res.json();
  },

  async getIssuedBooks() {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl('/librarian/issued-books'), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Tarqatilgan kitoblarni yuklab bo'lmadi");
    return res.json();
  },

  async addLibrarian(payload: any) {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl('/director/librarian'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Kutubxonachi qo'shishda xatolik");
    return res.json();
  },

  // --- STUDENT: HOMEWORK ---
  async getStudentHomework() {
    const token = getAuthToken();
    const res = await fetchWithRetry(getUrl('/student/homework'), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Vazifalarni yuklab bo'lmadi");
    return res.json();
  }
};