const getBaseApiUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_UR || 'http://localhost:8000/api/v1';
  const clean = raw.trim().replace(/\/+$/, '');
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
};

export const API_BASE_URL = getBaseApiUrl();

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('fianny_token');
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fianny_token', token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fianny_token');
  }
};

export const api = {
  // Auth
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email.trim().toLowerCase());
    formData.append('password', password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Kirishda xatolik yuz berdi');
    }
    return res.json();
  },

  async verify2FA(tempToken: string, code: string) {
    const res = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temp_token: tempToken, code: code.trim() })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || '2FA kodi noto\'g\'ri');
    }
    return res.json();
  },

  async toggle2FA() {
    const token = getAuthToken();
    if (!token) return null;
    const res = await fetch(`${API_BASE_URL}/auth/2fa/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("2FA holatini o'zgartirishda xatolik");
    return res.json();
  },

  async getMe() {
    const token = getAuthToken();
    if (!token) return null;
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      clearAuthToken();
      return null;
    }
    return res.json();
  },

  // Books
  async getBooks() {
    const res = await fetch(`${API_BASE_URL}/books`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) return [];
    return res.json();
  },

  async getBookReader(id: string) {
    const res = await fetch(`${API_BASE_URL}/books/${id}/reader`);
    if (!res.ok) throw new Error("Kitob topilmadi");
    return res.json();
  },

  async getBookById(id: string) {
    const res = await fetch(`${API_BASE_URL}/books/${id}`);
    if (!res.ok) throw new Error("Kitob topilmadi");
    return res.json();
  },

  // Authors
  async getAuthors() {
    const res = await fetch(`${API_BASE_URL}/authors`);
    if (!res.ok) return [];
    return res.json();
  },

  // Library / Mening Javonim
  async getLibrary() {
    const token = getAuthToken();
    if (!token) {
      // Local storage fallback for unauthenticated user
      const saved = typeof window !== 'undefined' ? localStorage.getItem('fianny_saved_books') : null;
      return saved ? JSON.parse(saved) : [];
    }
    try {
      const res = await fetch(`${API_BASE_URL}/library/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async addToLibrary(bookId: string) {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_BASE_URL}/library/${bookId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    // Also save in local storage
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('fianny_saved_books') || '[]');
      if (!saved.includes(bookId)) {
        saved.push(bookId);
        localStorage.setItem('fianny_saved_books', JSON.stringify(saved));
      }
    }
  },

  async removeFromLibrary(bookId: string) {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_BASE_URL}/library/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    if (typeof window !== 'undefined') {
      let saved = JSON.parse(localStorage.getItem('fianny_saved_books') || '[]');
      saved = saved.filter((id: string) => id !== bookId);
      localStorage.setItem('fianny_saved_books', JSON.stringify(saved));
    }
  },


  // Challenges & Tournaments (Mavsumlar)
  async getChallenges() {
    const res = await fetch(`${API_BASE_URL}/challenges/`);
    if (!res.ok) return [];
    return res.json();
  },

  async createChallenge(data: { name: string; description?: string; start_at?: string; end_at?: string; cover_image?: string }) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/challenges/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Mavsum yaratishda xatolik');
    }
    return res.json();
  },

  async finishChallenge(challengeId: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/challenges/${challengeId}/finish`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error("Mavsumni yakunlashda xatolik");
    return res.json();
  },

  async getChallengeLeaderboard(challengeId: string, skip: number = 0, limit: number = 50) {
    const res = await fetch(`${API_BASE_URL}/challenges/${challengeId}/leaderboard?skip=${skip}&limit=${limit}`);
    if (!res.ok) return { items: [], total_count: 0, has_more: false };
    return res.json();
  },

  // Admin Book CRUD
  async updateBook(bookId: string, data: any) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/admin/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Kitobni tahrirlashda xatolik yuz berdi');
    }
    return res.json();
  },

  async deleteBook(bookId: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/admin/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Kitobni o'chirishda xatolik yuz berdi");
    }
    return res.json();
  },

  // Admin Book Upload
  async uploadBook(formData: FormData) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/admin/books/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Kitob yuklashda xatolik');
    }
    return res.json();
  },



  // Progress Sync
  async updateProgress(bookId: string, progressPercent: number, chapterId?: string) {
    const token = getAuthToken();
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/users/me/progress/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          percent: Number(progressPercent),
          progress_percent: Number(progressPercent),
          chapter_id: chapterId || undefined,
          last_read_at: new Date().toISOString()
        })
      });
    } catch {
      // Ignore background sync errors
    }
  }
};
