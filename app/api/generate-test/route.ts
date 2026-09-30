import { NextRequest } from 'next/server';

const OLLAMA_ENDPOINT = 'http://172.18.12.25:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2:latest';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      course,
      syllabusText,
      sections,
      testTitle,
      unitScope,
      cohortTarget,
      durationMinutes,
      negativeMarking,
      passingPercentage,
      aiCustomPrompt,
      allowedAttempts,
    } = body;

    if (!course || !course.courseCode) {
      return new Response(
        JSON.stringify({ success: false, message: 'Valid course information is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'At least one section must be configured.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build section breakdown prompt string
    const sectionsPromptList = sections
      .map((s: any, idx: number) => {
        return `Section ${idx + 1}:
- Section Name: "${s.name}"
- Question Type: "${s.questionType}"
- Total Questions to Generate: ${s.totalQuestions}
- Questions to Attempt: ${s.questionsToAttempt}
- Marks Per Question: ${s.marksPerQuestion}
- Specific Instructions: "${s.instructions || 'Answer questions as instructed'}"`;
      })
      .join('\n\n');

    const prompt = `You are a distinguished university professor and examination board controller creating a formal test paper for the university course:
Course Code: ${course.courseCode}
Course Title: ${course.courseTitle}
Department: ${course.department || 'School of Computer Science & Engineering'}

SYLLABUS / UNIT TOPICS:
${syllabusText || 'Core Course Syllabus and Learning Objectives'}

EXAM SPECIFICATIONS:
- Unit Scope: ${unitScope || 'Mid-Term'}
- Target Cohort: ${cohortTarget === 'remedial' ? 'Remedial Classes (Focus on foundational clarity, clear concepts, detailed explanations)' : 'Tuition Classes (Advanced problem solving and analytical depth)'}
- Duration: ${durationMinutes || 60} Minutes
- Negative Marking Rule: ${negativeMarking !== 'none' ? `${negativeMarking} marks deducted per wrong objective response` : 'No negative marking'}
- Special Directives: ${aiCustomPrompt || 'Ensure questions are academically rigorous, unambiguous, and directly test syllabus topics.'}

REQUIRED OUTPUT FORMAT:
You MUST respond with a valid, parseable JSON object matching this exact schema:
{
  "generalInstructions": [
    "The exam duration is ${durationMinutes || 60} minutes.",
    "Read all section instructions and attempt rules carefully.",
    "${negativeMarking !== 'none' ? `Negative marking of ${negativeMarking} marks per wrong answer.` : 'No negative marking is applicable.'}"
  ],
  "sections": [
    {
      "name": "Exact Section Name matching configuration",
      "instructions": "Section specific instructions",
      "questionType": "mcq",
      "questions": [
        {
          "questionNumber": 1,
          "questionText": "Detailed question text (use '_______' for fill_in_the_blanks)",
          "marks": 2,
          "questionType": "mcq",
          "options": [
            "A) First option",
            "B) Second option",
            "C) Third option",
            "D) Fourth option"
          ],
          "correctAnswer": "A)",
          "explanation": "Clear explanation of the correct solution and concept."
        }
      ]
    }
  ]
}

SECTIONS TO GENERATE QUESTIONS FOR:
${sectionsPromptList}

IMPORTANT RULES:
1. Generate the EXACT number of questions requested for each section.
2. Supported Question Types ONLY:
   - "mcq": Provide 4 options ("A) ...", "B) ...", "C) ...", "D) ...") and correctAnswer ("A)", "B)", "C)", or "D)") with explanation.
   - "fill_in_the_blanks": Include a blank placeholder "_______" inside questionText, leave options empty [], and put the exact missing word/phrase in correctAnswer with explanation.
   - "true_false": Provide 2 options ["True", "False"], correctAnswer ("True" or "False"), and reasoning in explanation.
3. Return ONLY the valid JSON object without conversational preambles.`;

    // Connect to Ollama with streaming enabled
    const aiResponse = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: true,
        think: false,
        format: 'json',
      }),
    });

    if (!aiResponse.ok || !aiResponse.body) {
      const errorText = await aiResponse.text();
      console.error('Ollama API error response:', errorText);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Local AI server error (${aiResponse.status}): ${errorText || aiResponse.statusText}`,
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set up Server-Sent Events (SSE) stream to the client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResponse.body!.getReader();
        let accumulatedJson = '';
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              try {
                const parsedChunk = JSON.parse(trimmed);
                const chunkText = parsedChunk.response || '';
                accumulatedJson += chunkText;

                // Send live token chunk to frontend
                const sseMessage = `data: ${JSON.stringify({
                  type: 'chunk',
                  text: chunkText,
                  done: parsedChunk.done || false,
                })}\n\n`;
                controller.enqueue(encoder.encode(sseMessage));

                if (parsedChunk.done) {
                  // Send final completed payload event
                  let cleanJson = accumulatedJson.trim();
                  if (cleanJson.startsWith('```json')) {
                    cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
                  } else if (cleanJson.startsWith('```')) {
                    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/```\s*$/, '');
                  }

                  let parsedData = null;
                  try {
                    parsedData = JSON.parse(cleanJson);
                  } catch (pErr) {
                    console.warn('Direct server JSON parse failed, returning raw stream:', pErr);
                  }

                  const doneMessage = `data: ${JSON.stringify({
                    type: 'complete',
                    fullResponse: accumulatedJson,
                    parsedData: parsedData,
                  })}\n\n`;
                  controller.enqueue(encoder.encode(doneMessage));
                  controller.close();
                  return;
                }
              } catch (e) {
                // Ignore individual line JSON parse glitches in stream
              }
            }
          }

          // In case the stream closed without explicit done signal
          let cleanJson = accumulatedJson.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
          } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```\s*/, '').replace(/```\s*$/, '');
          }

          let parsedData = null;
          try {
            parsedData = JSON.parse(cleanJson);
          } catch (pErr) {
            console.warn('Direct server JSON parse fallback failed:', pErr);
          }

          const finalDoneMessage = `data: ${JSON.stringify({
            type: 'complete',
            fullResponse: accumulatedJson,
            parsedData: parsedData,
          })}\n\n`;
          controller.enqueue(encoder.encode(finalDoneMessage));
          controller.close();
        } catch (streamErr: any) {
          console.error('Streaming error from Ollama:', streamErr);
          const errorMessage = `data: ${JSON.stringify({
            type: 'error',
            message: streamErr.message || 'Stream disconnected unexpectedly.',
          })}\n\n`;
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/generate-test:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Failed to connect to local AI generator.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
