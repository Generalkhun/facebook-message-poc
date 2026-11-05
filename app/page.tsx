// 'use client';

// import { useEffect, useState } from 'react';

// interface Message {
//   id: string;
//   sender_psid: string;
//   sender_name: string;
//   message_text: string;
//   created_at: string;
// }

// export default function Dashboard() {
//   const [messages, setMessages] = useState<Message[]>([]);

//   const fetchMessages = async () => {
//     try {
//       const res = await fetch('/api/messages');
//       const data = await res.json();
//       setMessages(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//     // ดึงข้อมูลอัตโนมัติทุกๆ 3 วินาที (Polling แทน Realtime DB)
//     const interval = setInterval(fetchMessages, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="max-w-3xl mx-auto p-6 font-sans">
//       <header className="flex justify-between items-center mb-6 border-b pb-4">
//         <div>
//           <h1 className="text-xl font-bold text-gray-800">FB Message POC (No DB)</h1>
//           <p className="text-sm text-gray-500">แสดงข้อความที่ทักเข้ามาผ่าน Webhook แบบชั่วคราว</p>
//         </div>
//         <button
//           onClick={fetchMessages}
//           className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
//         >
//           รีเฟรชข้อมูล
//         </button>
//       </header>

//       <div className="bg-white border rounded-lg shadow overflow-hidden">
//         <div className="p-3 bg-gray-50 border-b font-medium text-gray-700 text-sm flex justify-between">
//           <span>รายการแชทล่าสุด</span>
//           <span>ทั้งหมด: {messages.length} ข้อความ</span>
//         </div>

//         {messages.length === 0 ? (
//           <div className="p-10 text-center text-gray-400">
//             ยังไม่มีข้อความ ลองพิมพ์ทัก Facebook Page ของคุณดูครับ
//           </div>
//         ) : (
//           <div className="divide-y">
//             {messages.map((msg) => (
//               <div key={msg.id} className="p-4 hover:bg-gray-50 flex justify-between items-start">
//                 <div>
//                   <h3 className="font-semibold text-gray-900">{msg.sender_name}</h3>
//                   <p className="text-gray-700 mt-1">{msg.message_text}</p>
//                   <span className="text-xs text-gray-400 mt-1 block">
//                     PSID: {msg.sender_psid} | {new Date(msg.created_at).toLocaleString('th-TH')}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';

interface Message {
  id: string;
  sender_psid: string;
  sender_name: string;
  message_text: string;
  created_at: string;
}

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // ต่อสาย SSE ฟังข้อมูลสดตรงจาก Serverless Vercel
    const eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data);
      setMessages((prev) => [newMessage, ...prev]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <header className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">FB Message Realtime Stream (No DB)</h1>
          <p className="text-sm text-gray-500">รับแชทตรงเข้า Client ผ่าน SSE โดยไม่ใช้ Database</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse">
          Live Connected
        </span>
      </header>

      <div className="bg-white border rounded-lg shadow overflow-hidden">
        <div className="p-3 bg-gray-50 border-b font-medium text-gray-700 text-sm flex justify-between">
          <span>รายการแชทที่ทักเข้ามาสดๆ</span>
          <span>ทั้งหมด: {messages.length} ข้อความ</span>
        </div>

        {messages.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            เปิดหน้านี้ค้างไว้ แล้วลองพิมพ์ทักเพจ Facebook ดูครับ ข้อความจะเด้งขึ้นทันที
          </div>
        ) : (
          <div className="divide-y">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 hover:bg-gray-50 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{msg.sender_name}</h3>
                  <p className="text-gray-700 mt-1">{msg.message_text}</p>
                  <span className="text-xs text-gray-400 mt-1 block">
                    PSID: {msg.sender_psid} | {new Date(msg.created_at).toLocaleTimeString('th-TH')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}