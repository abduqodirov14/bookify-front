"use client";
import React, { useState } from "react";
import { BookOpen, Smartphone, Search, Filter, X, Clock, ArrowRight, Tag, UserPlus, CheckCircle2, Mail, Lock } from "lucide-react";

export default function LibraryPage() {
  const [activeFilter, setActiveFilter] = useState("Barchasi");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isLibrarianModalOpen, setIsLibrarianModalOpen] = useState(false);

  // Librarian State
  const [librarian, setLibrarian] = useState({ name: "Shaxnoza Olimova", phone: "+998 90 123 45 67" });
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const handleAddLibrarian = (e: React.FormEvent) => {
    e.preventDefault();
    if(formName) {
      setLibrarian({ name: formName, phone: formPhone });
      setIsLibrarianModalOpen(false);
      setFormName("");
      setFormPhone("");
    }
  };

  const books = [
    { id: 1, title: "Yashamoq", author: "Mahmud Toir", type: "Jismoniy", genre: "Badiiy", count: 15, checkedOut: 3, isNew: true, barcode: "89432190", img: "https://api.asaxiy.uz/v1/media/pictures/books/yashamoq.jpg", reads: 0, format: "" },
    { id: 2, title: "Atom odatlar", author: "Jeyms Klir", type: "Jismoniy", genre: "Shaxsiy rivojlanish", count: 2, checkedOut: 18, isNew: false, barcode: "89432191", img: "https://kitobxon.com/img_knigi/s679.jpg", reads: 0, format: "" },
    { id: 3, title: "Ufq romani", author: "Said Ahmad", type: "Elektron", genre: "Badiiy", count: 0, checkedOut: 0, isNew: true, reads: 1250, format: "EPUB, Audio", barcode: "", img: "https://kitobxon.com/img_knigi/s679.jpg" },
    { id: 4, title: "Qiyomat", author: "Chingiz Aytmatov", type: "Elektron", genre: "Badiiy", count: 0, checkedOut: 0, isNew: false, reads: 890, format: "PDF", barcode: "", img: "https://api.asaxiy.uz/v1/media/pictures/books/yashamoq.jpg" }
  ];

  const filters = ["Barchasi", "Yangi kelganlar", "Jismoniy", "Elektron", "Badiiy", "Shaxsiy rivojlanish"];

  const filteredBooks = books.filter(book => {
    if (activeFilter === "Barchasi") return true;
    if (activeFilter === "Yangi kelganlar") return book.isNew;
    if (activeFilter === "Jismoniy" || activeFilter === "Elektron") return book.type === activeFilter;
    return book.genre === activeFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in relative pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Maktab Kutubxonasi</h1>
          <p className="text-gray-500 font-medium mt-1">Jismoniy va elektron kitoblar zaxirasini boshqarish</p>
        </div>
      </header>

      {/* Librarian Management Widget */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[24px] p-6 text-white shadow-xl shadow-emerald-600/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-2xl border border-white/20">
            {librarian.name[0]}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-700/50 rounded text-[10px] font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 size={12}/> Mas'ul Kutubxonachi
            </div>
            <h2 className="text-xl font-bold">{librarian.name}</h2>
            <p className="text-emerald-100 text-sm font-medium mt-0.5">Aloqa: {librarian.phone}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsLibrarianModalOpen(true)}
          className="relative z-10 w-full sm:w-auto px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus size={18} /> Kutubxonachi qo'shish
        </button>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Kitob, muallif yoki shtrix-kod..." className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 rounded-xl text-gray-500 mr-2 shrink-0">
            <Filter size={16} /> <span className="text-sm font-bold">Filtrlar:</span>
          </div>
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                activeFilter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === "Yangi kelganlar" ? "🆕 " + f : f}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <div 
            key={book.id} 
            onClick={() => setSelectedBook(book)}
            className="bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="relative h-48 w-full bg-gray-100 rounded-xl mb-4 overflow-hidden">
              {book.isNew && (
                <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm">Yangi</div>
              )}
              <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
                {book.type === 'Jismoniy' ? <BookOpen size={12}/> : <Smartphone size={12}/>} {book.type}
              </div>
              <div className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `url('${book.img}')` }}></div>
            </div>
            
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{book.title}</h3>
            <p className="text-sm text-gray-500 font-medium mb-4">{book.author}</p>
            
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              {book.type === "Jismoniy" ? (
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase">Omborda</div>
                  <div className={`font-black ${book.count > 5 ? 'text-green-600' : 'text-orange-600'}`}>{book.count} ta qoldi</div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase">O'qilgan</div>
                  <div className="font-black text-blue-600">{book.reads} marta</div>
                </div>
              )}
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Librarian Modal */}
      {isLibrarianModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsLibrarianModalOpen(false)}></div>
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-6 sm:p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Kutubxonachi qo'shish</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Yangi mas'ul xodimni ro'yxatdan o'tkazish</p>
              </div>
              <button onClick={() => setIsLibrarianModalOpen(false)} className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-full transition-colors self-start">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddLibrarian} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ism va Familiya</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="Masalan: Sardor Karimov" 
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Telefon raqami (Login uchun)</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="+998 90 123 45 67" 
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Vaqtinchalik parol</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    defaultValue="kutubxona123"
                    disabled
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <button type="submit" className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                Tasdiqlash va Qo'shish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Book Detail Modal (unchanged logically) */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBook(null)}></div>
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in flex flex-col md:flex-row overflow-hidden">
            
            <div className="md:w-2/5 bg-gray-100 relative min-h-[250px]">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${selectedBook.img}')` }}></div>
            </div>
            
            <div className="p-6 md:p-8 md:w-3/5 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-wider mb-2">
                  <Tag size={12}/> {selectedBook.genre}
                </div>
                <button onClick={() => setSelectedBook(null)} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <h2 className="text-3xl font-black text-gray-900 mb-1">{selectedBook.title}</h2>
              <p className="text-lg text-gray-500 font-medium mb-6">{selectedBook.author}</p>

              {selectedBook.type === "Jismoniy" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-2xl">
                      <div className="text-xs font-bold text-green-600 uppercase mb-1">Kutubxonada bor</div>
                      <div className="text-2xl font-black text-green-700">{selectedBook.count} ta</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-2xl">
                      <div className="text-xs font-bold text-orange-600 uppercase mb-1">Tarqatilgan</div>
                      <div className="text-2xl font-black text-orange-700">{selectedBook.checkedOut} ta</div>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-black/10">
                    O'quvchiga biriktirish (QR Skaner)
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl">
                      <div className="text-xs font-bold text-blue-600 uppercase mb-1">Jami O'qilgan</div>
                      <div className="text-2xl font-black text-blue-700">{selectedBook.reads} marta</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl">
                      <div className="text-xs font-bold text-purple-600 uppercase mb-1">Formatlar</div>
                      <div className="text-sm font-black text-purple-700 mt-1">{selectedBook.format}</div>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                    Sinflarga uy vazifasi qilib berish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}