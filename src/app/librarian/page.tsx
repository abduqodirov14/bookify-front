"use client";
import React, { useState } from "react";
import { BookOpen, Search, ScanLine, Plus, X, UserSearch, Calendar, Check, AlertTriangle, AlertCircle, Filter, ChevronDown } from "lucide-react";

export default function LibrarianDashboard() {
  const dynamicCategories = ["Badiiy", "Shaxsiy rivojlanish", "Dramatik asar", "Ilmiy-ommabop", "Sarguzasht"];

  // Qarzga berilgan kitoblar holati (Mock Data)
  const initialIssuedBooks = [
    { id: 1, student: "Azizov Bekzod", studentId: "ID-9012", class: "9-'A'", book: "Yashamoq", dueDate: "2026-09-12", status: "red" }, // Muddat o'tgan
    { id: 2, student: "Komilova Shahnoza", studentId: "ID-8841", class: "10-'B'", book: "Ufq", dueDate: "2026-09-15", status: "yellow" }, // Ertaga
    { id: 3, student: "Rahimov Sardor", studentId: "ID-7732", class: "8-'V'", book: "Atom odatlar", dueDate: "2026-09-20", status: "green" }, // Vaqti ko'p
    { id: 4, student: "Tursunov Diyor", studentId: "ID-9921", class: "11-'A'", book: "Qiyomat", dueDate: "2026-09-10", status: "red" },
    { id: 5, student: "Yusupova Malika", studentId: "ID-1122", class: "9-'A'", book: "Raqamli Qal'a", dueDate: "2026-09-25", status: "green" },
  ];

  const [issuedBooks, setIssuedBooks] = useState(initialIssuedBooks);
  const [activeFilter, setActiveFilter] = useState("Barchasi");
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form states
  const [formStudent, setFormStudent] = useState("");
  const [formBook, setFormBook] = useState("");
  const [formDate, setFormDate] = useState("");

  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formStudent || !formBook || !formDate) return;
    
    const newBook = {
      id: Date.now(),
      student: formStudent,
      studentId: "ID-" + Math.floor(Math.random() * 9000 + 1000),
      class: "Yangi",
      book: formBook,
      dueDate: formDate,
      status: "green" // Yangi berilgan kitob holati doim yashil bo'ladi
    };
    
    setIssuedBooks([newBook, ...issuedBooks]);
    setIsIssueModalOpen(false);
    setFormStudent(""); setFormBook(""); setFormDate("");
  };

  const filteredBooks = issuedBooks.filter(book => {
    if (activeFilter === "Barchasi") return true;
    if (activeFilter === "Vaqti bor (Yashil)") return book.status === "green";
    if (activeFilter === "Yaqinlashdi (Sariq)") return book.status === "yellow";
    if (activeFilter === "Kechikkan (Qizil)") return book.status === "red";
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kutubxona boshqaruvi</h1>
          <p className="text-gray-500 font-medium mt-1">Jismoniy kitoblarni qabul qilish va tarqatish</p>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setIsIssueModalOpen(true)}
          className="bg-emerald-600 p-8 rounded-[32px] text-white flex flex-col justify-center items-center gap-4 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <ScanLine size={40} className="text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black mb-1">Kitob berish (Jurnal / QR)</h2>
            <p className="text-emerald-100 font-medium text-sm">O'quvchiga yangi qog'oz kitob biriktirish</p>
          </div>
        </button>

        <button className="bg-white border-2 border-dashed border-gray-300 p-8 rounded-[32px] text-gray-700 flex flex-col justify-center items-center gap-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <Plus size={40} className="text-gray-400 group-hover:text-emerald-600" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black mb-1">Yangi kitob qo'shish</h2>
            <p className="text-gray-500 font-medium text-sm">Kelgan yangi kitoblarni bazaga ro'yxatdan o'tkazish</p>
          </div>
        </button>
      </div>

      {/* Issued Books Tracker */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tarqatilgan kitoblar jurnali</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Holati ranglarga qarab o'zgarib boradi</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="O'quvchi ismi yoki ID..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 w-full" />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} className="text-gray-400"/> 
                <span className="hidden sm:inline">{activeFilter}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden py-1 animate-fade-in">
                  {["Barchasi", "Vaqti bor (Yashil)", "Yaqinlashdi (Sariq)", "Kechikkan (Qizil)"].map(status => (
                    <button 
                      key={status}
                      onClick={() => { setActiveFilter(status); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {status.includes("Yashil") && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
                        {status.includes("Sariq") && <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>}
                        {status.includes("Qizil") && <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>}
                        {status}
                      </div>
                      {activeFilter === status && <Check size={16} className="text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">O'quvchi</th>
                <th className="p-4">Kitob Nomi</th>
                <th className="p-4">Qaytarish Sanasi</th>
                <th className="p-4 text-center">Holat (Status)</th>
                <th className="p-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBooks.map(book => (
                <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{book.student}</div>
                    <div className="text-xs font-bold text-gray-400 mt-0.5">{book.studentId} • {book.class}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <BookOpen size={16} className="text-gray-400" /> {book.book}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400"/> {book.dueDate}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        book.status === 'green' ? 'bg-green-50 text-green-600 border border-green-100' :
                        book.status === 'yellow' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-red-50 text-red-600 border border-red-100 animate-pulse'
                      }`}>
                        {book.status === 'green' && <Check size={14} />}
                        {book.status === 'yellow' && <AlertTriangle size={14} />}
                        {book.status === 'red' && <AlertCircle size={14} />}
                        {book.status === 'green' ? "Vaqti bor" : book.status === 'yellow' ? "Yaqinlashdi" : "Kechikkan!"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors shadow-sm">
                      Qaytarib olish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Yangi kitob berish */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsIssueModalOpen(false)}></div>
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-6 sm:p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Kitob berish</h2>
              <button onClick={() => setIsIssueModalOpen(false)} className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleIssueBook} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">O'quvchi (Ismi yoki ID si)</label>
                <div className="relative">
                  <UserSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="Masalan: Azizov Bekzod" 
                    value={formStudent}
                    onChange={e => setFormStudent(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Kitob nomi</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="Masalan: Yashamoq" 
                    value={formBook}
                    onChange={e => setFormBook(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Qaytarish sanasi</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-700"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
                <Check size={20} /> Kitobni yozib qo'yish (Enter)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}