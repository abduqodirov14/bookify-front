"use client";
import React from "react";
import { MessageSquare, Trash2, Ban } from "lucide-react";

export default function CommentsPage() {
  const comments = [
    { id: 1, user: "Alisher U.", book: "Qiyomat", text: "Juda ta'sirli asar ekan, Chingiz Aytmatov qalamiga qoyil!", time: "2 soat oldin" },
    { id: 2, user: "Zilola M.", book: "1984", text: "Ba'zi joylarida audio biroz xirillagan, iltimos tekshirib ko'ringlar.", time: "Kecha" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Izohlar</h1>
        <p className="text-gray-500 font-medium mt-1">Platformadagi barcha foydalanuvchi izohlari moderatsiyasi</p>
      </header>

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row gap-6 justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm text-gray-600">{comment.user[0]}</div>
                <div>
                  <span className="font-bold text-gray-900">{comment.user}</span>
                  <span className="text-gray-400 text-sm ml-2">{comment.time}</span>
                </div>
              </div>
              <p className="text-gray-700 font-medium mb-3">{comment.text}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                <MessageSquare size={12} /> {comment.book}
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:self-start">
              <button className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors tooltip" title="O'chirish">
                <Trash2 size={18} />
              </button>
              <button className="p-2.5 text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors tooltip" title="Foydalanuvchini bloklash">
                <Ban size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}