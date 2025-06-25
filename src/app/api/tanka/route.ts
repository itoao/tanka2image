import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, authorName, showDate, style, fontFamily, fontSize, bgColor, textColor, width, height } = body;

    // Create new tanka record
    const tanka = await prisma.tanka.create({
      data: {
        content,
        authorName: authorName || null,
        showDate: showDate ?? true,
        style: style || 'VERTICAL',
        fontFamily: fontFamily || 'mincho',
        fontSize: fontSize || 32,
        bgColor: bgColor || '#FFFFFF',
        textColor: textColor || '#000000',
        width: width || 1200,
        height: height || 1600,
      },
    });

    // Create share record
    const share = await prisma.share.create({
      data: {
        shareUrl: `share/${tanka.id}`,
        tankaId: tanka.id,
      },
    });

    return NextResponse.json({
      success: true,
      tankaId: tanka.id,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${tanka.id}`,
    });
  } catch (error) {
    console.error('Error creating tanka:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tanka' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const tanka = await prisma.tanka.findUnique({
      where: { id },
      include: {
        shares: true,
      },
    });

    if (!tanka) {
      return NextResponse.json(
        { success: false, error: 'Tanka not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tanka,
    });
  } catch (error) {
    console.error('Error fetching tanka:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tanka' },
      { status: 500 }
    );
  }
}