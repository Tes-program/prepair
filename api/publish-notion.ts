import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client, APIErrorCode } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DATABASE_ID!;

interface PublishRequest {
  problemTitle: string;
  problemType: 'DSA' | 'SD' | 'DB';
  problemDescription: string;
  problemDifficulty: 'Easy' | 'Medium' | 'Hard';
  problemUrl?: string;
  weekNumber: number;
  member1: string;
  member2: string;
  code?: string;
  explanation?: string;
  imageUrl?: string;
  dbSchema?: string;
  dbExplanation?: string;
  assessment: string;
}

function extractScore(assessment: string): 'Weak' | 'Acceptable' | 'Strong' {
  const match = assessment.match(/Score:\s*(Weak|Acceptable|Strong)/i);
  return (match?.[1] as 'Weak' | 'Acceptable' | 'Strong') ?? 'Acceptable';
}

function scoreColour(score: string): 'red' | 'yellow' | 'green' {
  if (score === 'Weak') return 'red';
  if (score === 'Strong') return 'green';
  return 'yellow';
}

function text(content: string) {
  return [{ type: 'text' as const, text: { content } }];
}

function divider() {
  return { object: 'block' as const, type: 'divider' as const, divider: {} };
}

function heading2(content: string) {
  return {
    object: 'block' as const,
    type: 'heading_2' as const,
    heading_2: { rich_text: text(content) },
  };
}

function paragraph(content: string) {
  return {
    object: 'block' as const,
    type: 'paragraph' as const,
    paragraph: { rich_text: content ? text(content) : [] },
  };
}

function codeBlock(content: string, language: string) {
  return {
    object: 'block' as const,
    type: 'code' as const,
    code: {
      language: language as any,
      rich_text: text(content || '// No code submitted'),
    },
  };
}

function callout(content: string, colour: 'red' | 'yellow' | 'green', emoji: string) {
  return {
    object: 'block' as const,
    type: 'callout' as const,
    callout: {
      rich_text: text(content),
      icon: { type: 'emoji' as const, emoji },
      color: `${colour}_background` as any,
    },
  };
}

function imageBlock(url: string) {
  return {
    object: 'block' as const,
    type: 'image' as const,
    image: { type: 'external' as const, external: { url } },
  };
}

function buildBlocks(req: PublishRequest) {
  const { problemType, problemDescription, member1, member2,
    weekNumber, code: javaCode, explanation, imageUrl,
    dbSchema, dbExplanation, assessment, problemUrl } = req;

  const score = extractScore(assessment);
  const colour = scoreColour(score);
  const members = `${member1} and ${member2}`;
  const typeLabel = { DSA: 'DSA', SD: 'System Design', DB: 'Database' }[problemType];

  const blocks: any[] = [
    callout(`${members}  ·  Week ${weekNumber}  ·  ${typeLabel}`, 'yellow', '👥'),
    divider(),
    heading2('📋 Problem Statement'),
    paragraph(problemDescription),
  ];

  if (problemType === 'DSA' && problemUrl) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: 'View on LeetCode →', link: { url: problemUrl } },
          annotations: { color: 'blue' },
        }],
      },
    });
  }

  blocks.push(divider());

  if (problemType === 'DSA') {
    blocks.push(heading2('💻 Java Solution'));
    blocks.push(codeBlock(javaCode || '', 'java'));
  }

  if (problemType === 'SD') {
    blocks.push(heading2('🖼 Architecture Diagram'));
    if (imageUrl) {
      blocks.push(imageBlock(imageUrl));
    } else {
      blocks.push(paragraph('No diagram uploaded.'));
    }
    blocks.push(heading2('📝 Written Explanation'));
    blocks.push(paragraph(explanation || 'No explanation submitted.'));
  }

  if (problemType === 'DB') {
    blocks.push(heading2('🗄 MySQL Schema'));
    blocks.push(codeBlock(dbSchema || '', 'sql'));
    blocks.push(heading2('📝 Design Explanation'));
    blocks.push(paragraph(dbExplanation || 'No explanation submitted.'));
  }

  blocks.push(divider());
  blocks.push(heading2('🤖 AI Assessment'));

  const assessmentParagraphs = assessment
    .split('\n')
    .filter(line => line.trim())
    .filter(line => !line.match(/Score:\s*(Weak|Acceptable|Strong)/i));

  for (const line of assessmentParagraphs) {
    blocks.push(paragraph(line));
  }

  const scoreEmoji = { Weak: '⚠️', Acceptable: '✅', Strong: '🏆' }[score];
  blocks.push(callout(`Score: ${score}`, colour, scoreEmoji));

  return blocks;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body as PublishRequest;

  if (!body.assessment) {
    return res.status(400).json({ error: 'Cannot publish without an assessment' });
  }

  const score = extractScore(body.assessment);
  const typeLabel = { DSA: 'DSA', SD: 'System Design', DB: 'Database' }[body.problemType];
  const pageTitle = `${body.member1} & ${body.member2} — ${body.problemTitle}`;

  try {
    const page = await notion.pages.create({
      parent: { database_id: DB_ID },
      icon: {
        type: 'emoji',
        emoji: body.problemType === 'DSA' ? '💻'
          : body.problemType === 'SD' ? '🏗'
            : '🗄',
      },
      properties: {
        Name: { title: text(pageTitle) },
        Week: { number: body.weekNumber },
        Type: { select: { name: typeLabel } },
        Difficulty: { select: { name: body.problemDifficulty } },
        Problem: { rich_text: text(body.problemTitle) },
        Members: { rich_text: text(`${body.member1}, ${body.member2}`) },
        Score: { select: { name: score } },
        Submitted: { date: { start: new Date().toISOString() } },
        ...(body.problemUrl ? { LeetCode: { url: body.problemUrl } } : {}),
      },
      children: buildBlocks(body),
    });

    console.log(`[notion] Published: ${pageTitle} — Score: ${score}`);
    res.json({ url: (page as any).url });
  } catch (err: any) {
    console.error('[notion] Error:', err?.message);
    if (err?.code === APIErrorCode.ObjectNotFound) {
      return res.status(400).json({
        error: 'Notion database not found. Make sure you shared the database with the PrepPair integration.',
      });
    }
    res.status(500).json({ error: 'Notion publish failed. Check server logs.' });
  }
}
