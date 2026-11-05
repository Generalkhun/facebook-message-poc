import { NextResponse } from 'next/server';
import { globalMessages } from '@/lib/store';

export async function GET() {
  console.log("🚀 ~ GET ~ globalMessages:", globalMessages)
  return NextResponse.json(globalMessages);
}