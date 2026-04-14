import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM: Record<string, string> = {
  DSA: 'Senior Java engineer reviewing entry-level interview prep for Moniepoint fintech (Java, Spring Boot). Direct and structured.',
  DB: 'Senior MySQL engineer reviewing entry-level interview prep for Moniepoint fintech. Direct and structured.',
  SD: 'System design interviewer at a Nigerian fintech (Moniepoint — payments, wallets, transfers). Reviewing entry-level candidates. Structured and specific.',
};

const CRITERIA: Record<string, string> = {
  DSA: [
    '1. Correctness',
    '2. Time & space complexity (Big O)',
    '3. Java best practices: Collections API, generics, naming conventions',
    '4. Key gap or missed optimisation',
    '5. One concrete code-level fix',
  ].join('\n'),
  DB: [
    '1. Schema correctness and normalisation',
    '2. Index strategy and query efficiency',
    '3. MySQL best practices (constraints, types, foreign keys)',
    '4. Key gap',
    '5. One concrete improvement',
  ].join('\n'),
  SD: [
    '1. Core components — what is present and what is missing',
    '2. Scalability considerations',
    '3. Data model quality',
    '4. Fintech-specific concerns: idempotency, consistency, audit trails, failure handling',
    '5. Overall mock interview assessment',
  ].join('\n'),
};

function buildPrompt(body: Record<string, string | undefined>): string {
  const { problemTitle, problemDescription, problemType,
    code, explanation, imageUrl, dbSchema, dbExplanation } = body;

  let submissionBlock = '';

  if (problemType === 'DSA') {
    submissionBlock = `DOCUMENT TYPE: Java source code\n\`\`\`java\n${code || '(no code submitted)'}\n\`\`\``;
  }

  if (problemType === 'SD') {
    submissionBlock = [
      'DOCUMENT TYPE: System Design Submission',
      explanation ? `Written Explanation:\n${explanation}` : '(no explanation submitted)',
      imageUrl
        ? `Architecture Diagram: An image has been submitted at ${imageUrl}. Acknowledge it in your assessment but base code-level critique on the written explanation.`
        : '(no architecture diagram submitted)',
    ].join('\n\n');
  }

  if (problemType === 'DB') {
    submissionBlock = [
      'DOCUMENT TYPE: MySQL Database Submission',
      dbSchema ? `SQL Schema:\n\`\`\`sql\n${dbSchema}\n\`\`\`` : '(no schema submitted)',
      dbExplanation ? `Written Explanation:\n${dbExplanation}` : '(no explanation submitted)',
    ].join('\n\n');
  }

  return `Problem: ${problemTitle}\n${problemDescription}\n\n${submissionBlock}\n\nAssess:\n${CRITERIA[problemType!]}\n\nEnd with: **Score: Weak / Acceptable / Strong**`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { problemType } = req.body;
  if (!problemType) return res.status(400).json({ error: 'problemType required' });

  const max_tokens = problemType === 'SD' ? 700 : 500;

  console.log(`[assess] type=${problemType} title="${req.body.problemTitle}" tokens_limit=${max_tokens}`);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM[problemType] },
        { role: 'user', content: buildPrompt(req.body) },
      ],
      max_tokens,
      temperature: 0.3,
    });

    res.json({ assessment: completion.choices[0].message.content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[assess] OpenAI error:', message);
    res.status(500).json({ error: 'Assessment failed' });
  }
}
