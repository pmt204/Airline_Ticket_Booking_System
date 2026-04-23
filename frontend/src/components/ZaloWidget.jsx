import React from 'react';

const ZaloWidget = () => {
  const zaloNumber = "0363213230"; 

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex items-center gap-3">
      
      <div className="hidden md:block bg-white text-blue-600 px-4 py-2 rounded-2xl shadow-xl border border-blue-100 font-bold text-sm relative animate-bounce">
        Cần hỗ trợ? Chat ngay!
        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white"></div>
      </div>

      <a
        href={`https://zalo.me/${zaloNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 group"
        title="Chat Zalo ngay"
      >
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        
        <span className="relative z-10 text-white font-black text-lg tracking-wider">Zalo</span>
        
        <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white shadow-sm"></span>
        </span>
      </a>
      
    </div>
  );
};

export default ZaloWidget;