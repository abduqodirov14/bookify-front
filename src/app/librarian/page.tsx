"use client";
import React, { useState, useEffect } from "react";
import { BookOpen, Search, ScanLine, Plus, X, UserSearch, Calendar, Check, AlertTriangle, AlertCircle, Filter, ChevronDown, Loader2, Clock } from "lucide-react";
import { b2bService } from "@/services/b2b.service";

export default function LibrarianDashboard() {
  const [issuedBooks, setIssuedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState("Barchasi");
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form states
  const [formStudent, setFormStudent] = useState("");
  const [formBook, setFormBook] = useState("");
  const [formDate, setFormDate] = useState("");
  const [issuing, setIssuing] = useState(false);

  const fetchBooks = async () => {
    try {
      const data = await b2bService.getIssuedBooks();
      setIssuedBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formStudent || !formBook || !formDate) return;
    
    setIssuing(true);
    try {
      await b2bService.issueBook({
        student_id: formStudent,
        book_id: formBook,
        due_date: formDate
      });
      setIsIssueModalOpen(false);
      setFormStudent(""); setFormBook(""); setFormDate("");
      await fetchBooks();
    } catch (err) {
      alert("Xatolik yuz berdi");
    } finally {
      setIssuing(false);
    }
  };

  const getStatusColor = (dueDate: string) => {
    const due = new Date(dueDate).getTime();
    const now = Date.now();
    const daysLeft = (due - now) / (1000 * 3600 * 24);
    if (daysLeft < 0) return "red";
    if (daysLeft < 3) return "yellow";
    return "green";
  };

  const filteredBooks = issuedBooks.filter(book => {
    if (activeFilter === "Barchasi") return true;
    const status = getStatusColor(book.due_date || book.dueDate);
    if (activeFilter === "Vaqti bor (Yashil)") return status === "green";
    if (activeFilter === "Yaqinlashdi (Sariq)") return status === "yellow";
    if (activeFilter === "Kechikkan (Qizil)") return status === "red";
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kutubxona boshqaruvi</h1>
          <p className="text-gray-500 font-medium mt-1">Jismoniy kitoblarni qabul qilish va tarqatish</p>
        </div>
        <button onClick={() => setIsIssueModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-black/10 hover:bg-black active:scale-95 transition-all">
          <ScanLine size={18} /> Kitob Berish
        </button>
      </header>

      {/* Tizimdagi kitoblar */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1 relative">
          <h2 className="text-xl font-bold text-gray-900">Joriy holat (Qarzga berilganlar)</h2>
          
          <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-white px-4 py-2.5 rounded-full border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
              <Filter size={16} className={activeFilter !== "Barchasi" ? "text-orange-500" : ""} /> {activeFilter} <ChevronDown size={14} />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden py-1 animate-fade-in">
                {["Barchasi", "Vaqti bor (Yashil)", "Yaqinlashdi (Sariq)", "Kechikkan (Qizil)"].map(f => (
                  <button key={f} onClick={() => { setActiveFilter(f); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors ${activeFilter === f ? 'text-orange-500 bg-orange-50' : 'text-gray-700'}`}>{f}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center bg-white rounded-[32px] border border-gray-100">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {filteredBooks.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <BookOpen size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Ma'lumot topilmadi</h3>
                <p className="text-gray-500 font-medium">Bu filtrlarga mos kitoblar mavjud emas.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider rounded-tl-[32px]">O'quvchi</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Sinf / ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kitob nomi</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right rounded-tr-[32px]">Muddati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBooks.map((item, idx) => {
                    const status = getStatusColor(item.due_date || item.dueDate);
                    return (
                      <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.student || item.student_name || "Noma'lum"}</div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className="font-bold text-gray-700">{item.class || "-"}</div>
                          <div className="text-xs text-gray-400 font-medium">{item.studentId || item.student_id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700">
                            <BookOpen size={14} className="text-gray-400" /> {item.book || item.book_title || "Kitob"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="text-sm font-bold text-gray-900">{new Date(item.due_date || item.dueDate).toLocaleDateString()}</div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ${status === 'red' ? 'bg-red-100 text-red-500' : status === 'yellow' ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'}`}>
                              {status === 'red' ? <AlertTriangle size={16} /> : status === 'yellow' ? <Clock size={16} /> : <Check size={16} />}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      {/* Kitob Berish Modali */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><ScanLine size={20} className="text-blue-500" /> Kitob Tarqatish</h3>
              <button onClick={() => setIsIssueModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleIssueBook} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">O'quvchi ID yoki Ismi</label>
                <div className="relative">
                  <UserSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="text" value={formStudent} onChange={e=>setFormStudent(e.target.value)} placeholder="ID-9012 yoki Azizov Bekzod" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kitob Shtrixkodi / Nomi</label>
                <div className="relative">
                  <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="text" value={formBook} onChange={e=>setFormBook(e.target.value)} placeholder="0123456789 yoki 'Yashamoq'" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Qaytarish muddati</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="date" value={formDate} onChange={e=>setFormDate(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>

              <button disabled={issuing} type="submit" className="w-full mt-2 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg shadow-black/10 transition-transform active:scale-95 flex items-center justify-center gap-2">
                {issuing ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Tasdiqlash va Berish</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}