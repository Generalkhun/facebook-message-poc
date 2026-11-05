import { NextResponse } from 'next/server';
import { globalMessages } from '@/lib/store';

export async function GET() {
  return NextResponse.json(globalMessages);
}