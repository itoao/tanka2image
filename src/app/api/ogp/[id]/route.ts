import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    // Fetch tanka data
    const tanka = await prisma.tanka.findUnique({
      where: { id },
    });

    if (!tanka) {
      return new NextResponse('Tanka not found', { status: 404 });
    }

    // Generate OGP image using Canvas API (same logic as export function)
    const canvas = await generateTankaImage(tanka);
    
    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating OGP image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function generateTankaImage(tanka: any) {
  // For server-side canvas, we need to use a different canvas library
  // Install canvas: npm install canvas @types/canvas
  const { createCanvas } = require('canvas');
  
  const canvas = createCanvas(tanka.width, tanka.height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = tanka.bgColor;
  ctx.fillRect(0, 0, tanka.width, tanka.height);

  // Set font properties
  const fontFamily = tanka.fontFamily === 'mincho' ? 'serif' : 'sans-serif';
  ctx.font = `${tanka.fontSize}px ${fontFamily}`;
  ctx.fillStyle = tanka.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (tanka.style === 'VERTICAL') {
    // Vertical text rendering
    await renderVerticalText(ctx, tanka.content, tanka);
  } else {
    // Horizontal text rendering
    await renderHorizontalText(ctx, tanka.content, tanka);
  }

  // Render author name and date if specified
  if (tanka.authorName || tanka.showDate) {
    ctx.font = `${Math.floor(tanka.fontSize * 0.6)}px ${fontFamily}`;
    ctx.globalAlpha = 0.7;
    
    let infoY = tanka.height - 80;
    if (tanka.authorName) {
      ctx.fillText(tanka.authorName, tanka.width / 2, infoY);
      infoY += 30;
    }
    if (tanka.showDate) {
      ctx.fillText(tanka.createdAt.toLocaleDateString('ja-JP'), tanka.width / 2, infoY);
    }
    ctx.globalAlpha = 1;
  }

  return canvas;
}

async function renderVerticalText(ctx: any, text: string, settings: any) {
  const lines = text.split('\n').filter((line: string) => line.trim());
  const lineSpacing = settings.fontSize * 1.8;
  const charSpacing = settings.fontSize * 1.2;
  
  // Calculate starting position (centered)
  const totalWidth = lines.length * lineSpacing;
  let currentX = (settings.width + totalWidth) / 2 - lineSpacing / 2;
  
  for (const line of lines) {
    let currentY = (settings.height - line.length * charSpacing) / 2 + charSpacing / 2;
    
    for (const char of line) {
      // Special handling for punctuation and long vowel marks
      if (shouldRotateChar(char)) {
        ctx.save();
        ctx.translate(currentX, currentY);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(char, currentX, currentY);
      }
      currentY += charSpacing;
    }
    currentX -= lineSpacing;
  }
}

async function renderHorizontalText(ctx: any, text: string, settings: any) {
  const lines = text.split('\n').filter((line: string) => line.trim());
  const lineHeight = settings.fontSize * 1.6;
  
  // Calculate starting position (centered)
  const totalHeight = lines.length * lineHeight;
  let currentY = (settings.height - totalHeight) / 2 + settings.fontSize;
  
  for (const line of lines) {
    ctx.fillText(line, settings.width / 2, currentY);
    currentY += lineHeight;
  }
}

function shouldRotateChar(char: string): boolean {
  // Characters that should be rotated in vertical text
  const rotateChars = ['ー', '。', '、', '！', '？', '：', '；', '（', '）', '「', '」', '『', '』'];
  return rotateChars.includes(char);
}