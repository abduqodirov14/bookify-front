const getBaseApiUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_UR || 'https://bookify-vz6r.onrender.com/api/v1';
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
    localStorage.removeItem('bookify_user');
  }
};

export const getCachedUser = () => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('bookify_user');
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
  }
  return null;
};

export const setCachedUser = (user: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bookify_user', JSON.stringify(user));
    } catch {}
  }
};


// Resilient Fetch with Auto-Retry (absorbs Render cold-start wake-up delays up to 25 seconds)
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 5, delay = 1500): Promise<Response> {
  try {
    const res = await fetch(url, options);
    // If Render returned 502/503 during server wake-up/reboot, retry automatically
    if ((res.status === 502 || res.status === 503) && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, Math.min(delay * 1.4, 4000));
    }
    return res;
  } catch (err: any) {
    if (retries > 0) {
      console.warn(`[Network] Re-attempting connection to ${url} (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, Math.min(delay * 1.4, 4000));
    }
    throw err;
  }
}

export const api = {
  // Auth
  async register(email: string, password: string, name: string) {
    const res = await fetchWithRetry(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        name: name.trim()
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || "Ro'yxatdan o'tishda xatolik yuz berdi");
    }
    return data;
  },

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email.trim().toLowerCase());
    formData.append('password', password);

    const res = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
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
    const res = await fetchWithRetry(`${API_BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temp_token: tempToken, code: code.trim() })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "2FA kodi noto'g'ri");
    }
    return res.json();
  },

  async toggle2FA() {
    const token = getAuthToken();
    if (!token) return null;
    const res = await fetchWithRetry(`${API_BASE_URL}/auth/2fa/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("2FA holatini o'zgartirishda xatolik");
    return res.json();
  },

  async getMe() {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        clearAuthToken();
        return null;
      }
      if (!res.ok) {
        return getCachedUser();
      }
      const data = await res.json();
      setCachedUser(data);
      return data;
    } catch {
      return getCachedUser();
    }
  },

  async googleAuth(credential: string) {
    const res = await fetchWithRetry(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || "Google orqali kirishda xatolik yuz berdi");
    }
    if (data.access_token) {
      setAuthToken(data.access_token);
      if (data.user) setCachedUser(data.user);
    }
    return data;
  },

  async telegramAuth(tgData: any) {
    const res = await fetchWithRetry(`${API_BASE_URL}/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || "Telegram orqali kirishda xatolik yuz berdi");
    }
    if (data.access_token) {
      setAuthToken(data.access_token);
      if (data.user) setCachedUser(data.user);
    }
    return data;
  },

  async updateAvatarUrl(avatarUrl: string) {
    const token = getAuthToken();
    if (!token) return null;
    const res = await fetchWithRetry(`${API_BASE_URL}/users/me/avatar-url`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ avatar_url: avatarUrl })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || "Avatarni yangilashda xatolik yuz berdi");
    }
    return data;
  },

  // Books
  async getBooks(includeAll = false) {
    try {
      const url = includeAll ? `${API_BASE_URL}/books?all=true` : `${API_BASE_URL}/books`;
      const res = await fetchWithRetry(url, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) return [];
      return res.json();
    } catch (e) {
      console.warn("Backend books fetch warning:", e);
      return [];
    }
  },

  async getBookReader(id: string) {
    const res = await fetchWithRetry(`${API_BASE_URL}/books/${id}/reader`);
    if (!res.ok) throw new Error("Kitob topilmadi");
    return res.json();
  },

  async getBookById(id: string) {
    const res = await fetchWithRetry(`${API_BASE_URL}/books/${id}`);
    if (!res.ok) throw new Error("Kitob topilmadi");
    return res.json();
  },

  // Authors
  async getAuthors() {
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/authors`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  // Library / Mening Javonim
  async getLibrary() {
    const token = getAuthToken();
    if (!token) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('fianny_saved_books') : null;
      return saved ? JSON.parse(saved) : [];
    }
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/library/`, {
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
      try {
        await fetchWithRetry(`${API_BASE_URL}/library/${bookId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {}
    }
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
      try {
        await fetchWithRetry(`${API_BASE_URL}/library/${bookId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {}
    }
    if (typeof window !== 'undefined') {
      let saved = JSON.parse(localStorage.getItem('fianny_saved_books') || '[]');
      saved = saved.filter((id: string) => id !== bookId);
      localStorage.setItem('fianny_saved_books', JSON.stringify(saved));
    }
  },

  // Reading Progress Sync
  async syncProgress(bookId: string, progressPercent: number, chapterId?: string) {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/users/me/progress/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          percent: progressPercent,
          progress_percent: progressPercent,
          chapter_id: chapterId || null,
          sentence_id: null,
          char_offset: 0
        })
      });
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  },

  async updateProgress(bookId: string, percent: number, chapterId?: string) {
    return this.syncProgress(bookId, percent, chapterId);
  },

  async getProgress(bookId: string) {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/users/me/progress/books/${bookId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  },

  // Bookmarks
  async getBookmarks() {
    const token = getAuthToken();
    if (!token) return [];
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/users/me/bookmarks/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async addBookmark(bookId: string, chapterId: string, sentenceIndex: number, textSnippet: string) {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/users/me/bookmarks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: bookId,
          chapter_id: chapterId,
          sentence_index: sentenceIndex,
          text_snippet: textSnippet
        })
      });
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  },

  async deleteBookmark(bookmarkId: string) {
    const token = getAuthToken();
    if (!token) return;
    try {
      await fetchWithRetry(`${API_BASE_URL}/users/me/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
  },

  // User Stats
  async getUserStats() {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/users/me/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  async updateReadingTime(minutes: number) {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/users/me/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ add_minutes: minutes })
      });
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  },

  // Admin APIs
  async getAdminStats() {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Statistikani yuklashda xatolik");
    return res.json();
  },

  async getAdminFinancials() {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/financials/overview`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Moliya hisobotini yuklashda xatolik");
    return res.json();
  },

  async getAdminSessions() {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/sessions/recent`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Sessiyalarni yuklashda xatolik");
    return res.json();
  },

  async getAdminUsers() {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Foydalanuvchilarni yuklashda xatolik");
    return res.json();
  },

  async resetUserPassword(userId: string, newPass: string) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ new_password: newPass })
    });
    if (!res.ok) throw new Error("Parolni tiklashda xatolik");
    return res.json();
  },

  async toggleUserStatus(userId: string, isSuspended: boolean) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_suspended: isSuspended })
    });
    if (!res.ok) throw new Error("Statusni o'zgartirishda xatolik");
    return res.json();
  },

  async uploadBook(formData: FormData) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/books/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Kitob yuklashda xatolik yuz berdi");
    }
    return res.json();
  },

  async updateBook(bookId: string, data: any) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Kitobni tahrirlashda xatolik");
    }
    return res.json();
  },

  async deleteBook(bookId: string) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/books/${bookId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Kitobni o'chirishda xatolik");
    }
    return res.json();
  },

  async getBookStatus(bookId: string) {
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/admin/books/${bookId}/status`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  async getBookPages(bookId: string) {
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/books/${bookId}/pages`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async publishBook(bookId: string) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/books/${bookId}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Kitobni chop etishda xatolik");
    }
    return res.json();
  },

  async retryBookPipeline(bookId: string) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/books/${bookId}/retry`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Qayta urinishda xatolik");
    }
    return res.json();
  },

  // Seasons / Tournaments (Challenges)
  async getActiveChallenge() {
    try {
      const list = await this.getChallenges();
      if (Array.isArray(list) && list.length > 0) {
        return list[0];
      }
      return null;
    } catch {
      return null;
    }
  },

  async getChallenges() {
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/challenges`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async createChallenge(dataOrName: any, description?: string, daysDuration?: number) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const payload = typeof dataOrName === 'object'
      ? dataOrName
      : {
          name: dataOrName,
          description: description || '',
          days_duration: daysDuration || 30
        };

    const res = await fetchWithRetry(`${API_BASE_URL}/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Mavsum yaratishda xatolik");
    return res.json();
  },

  async getChallengeLeaderboard(challengeId: string, skip: number = 0, limit: number = 50) {
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/challenges/${challengeId}/leaderboard?skip=${skip}&limit=${limit}`);
      if (!res.ok) return { items: [], total_count: 0 };
      return res.json();
    } catch {
      return { items: [], total_count: 0 };
    }
  },

  async joinChallenge(challengeId: string) {
    const token = getAuthToken();
    if (!token) throw new Error("Musobaqada qatnashish uchun tizimga kiring");
    const res = await fetchWithRetry(`${API_BASE_URL}/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Musobaqaga qo'shilishda xatolik");
    return res.json();
  },

  async finishChallenge(challengeId: string) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/challenges/${challengeId}/finish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Mavsumni yakunlashda xatolik");
    return res.json();
  },

  // Comments & Reviews
  async getBookComments(bookId: string) {
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/books/${bookId}/comments`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async addBookComment(bookId: string, dataOrContent: any, rating: number = 5) {
    const token = getAuthToken();
    if (!token) throw new Error("Fikr qoldirish uchun tizimga kiring");
    const payload = typeof dataOrContent === 'object'
      ? dataOrContent
      : { content: dataOrContent, rating };

    const res = await fetchWithRetry(`${API_BASE_URL}/books/${bookId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Fikr qoldirishda xatolik");
    }
    return res.json();
  },

  async postComment(bookId: string, content: string, rating: number = 5) {
    return this.addBookComment(bookId, content, rating);
  },

  async getAllAdminComments() {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/comments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return res.json();
  },

  async deleteAdminComment(commentId: string) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Fikrni o'chirishda xatolik");
    return res.json();
  },

  async deleteBookComment(bookId: string, commentId: string) {
    const token = getAuthToken();
    if (!token) throw new Error("Avtorizatsiya talab qilinadi");
    const res = await fetchWithRetry(`${API_BASE_URL}/books/${bookId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Fikrni o'chirishda xatolik");
    return res.json();
  }
};
