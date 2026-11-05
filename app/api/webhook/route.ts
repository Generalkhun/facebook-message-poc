import { NextRequest, NextResponse } from 'next/server';
import { globalMessages } from '@/lib/store';

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'MY_SECRET_VERIFY_TOKEN';
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || '';

// Helper ดึงชื่อผู้ใช้จาก Graph API
async function getUserName(psid: string) {
  if (!PAGE_ACCESS_TOKEN) return 'Facebook User';
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${psid}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`
    );
    const data = await res.json();
    return `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Facebook User';
  } catch (err) {
    return 'Facebook User';
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging?.[0];
        if (!webhookEvent) continue;

        const senderPsid = webhookEvent.sender?.id;
        const messageText = webhookEvent.message?.text;

        if (senderPsid && messageText) {
          const senderName = await getUserName(senderPsid);

          // บันทึกลงตัวแปรชั่วคราว
          globalMessages.unshift({
            id: Date.now().toString(),
            sender_psid: senderPsid,
            sender_name: senderName,
            message_text: messageText,
            created_at: new Date().toISOString(),
          });
        }
      }
      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }
    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}