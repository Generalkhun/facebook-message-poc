export interface MessageItem {
  id: string;
  sender_psid: string;
  sender_name: string;
  message_text: string;
  created_at: string;
}

// ตัวแปรเก็บข้อมูลใน Memory (Global Store)
export const globalMessages: MessageItem[] = [];