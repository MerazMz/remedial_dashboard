import { NextRequest } from 'next/server';

const OLLAMA_ENDPOINT = 'http://172.18.12.25:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2:latest';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      course,
      syllabusText,
      sectionName,
      questionType,
      questionNumber,
      marks,
      currentQuestionText,
    } = body;

    if (!course || !course.courseCode) {
      return new Response(
        JSON.stringify({ success: false, message: 'Course information is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const typeGuidance =
      questionType === 'mcq'
        ? 'Generate a Multiple Choice Question (MCQ) with 4 clear options ("A) ...", "B) ...", "C) ...", "D) ...") and correctAnswer ("A)", "B)", "C)", or "D)") with explanation.'
        : questionType === 'fill_in_the_blanks'
        ? 'Generate a Fill in the Blanks question containing "_______" placeholder in questionText, empty options [], and exact missing word/phrase in correctAnswer with explanation.'
        : 'Generate a True / False proposition statement with options ["True", "False"], correctAnswer ("True" or "False"), and reasoning in explanation.';

    const prompt = `You are a university professor creating an exam question for:
Course: ${course.courseCode} - ${course.courseTitle}
Section: ${sectionName || 'Assessment'}
Syllabus: ${syllabusText || 'Core Course Syllabus'}

Task: Generate 1 SINGLE fresh replacement question for Question ${questionNumber || 1} carrying ${marks || 2} marks.
Question Format: ${questionType}
Guidance: ${typeGuidance}
${currentQuestionText ? `Avoid duplicating the previous question: "${currentQuestionText}"` : ''}

Respond with ONLY this JSON format:
{
  "questionNumber": ${questionNumber || 1},
  "questionText": "Question text here",
  "marks": ${marks || 2},
  "questionType": "${questionType}",
  "options": ${questionType === 'mcq' ? '["A) ...", "B) ...", "C) ...", "D) ..."]' : questionType === 'true_false' ? '["True", "False"]' : '[]'},
  "correctAnswer": "${questionType === 'mcq' ? 'A)' : questionType === 'true_false' ? 'True' : 'term'}",
  "explanation": "Clear step-by-step reasoning and solution."
}`;

    // Enable streaming to Ollama
    const aiResponse = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: true,
        think: false,
        format: 'json',
      }),
    });

    if (!aiResponse.ok || !aiResponse.body) {
      const errText = await aiResponse.text();
      return new Response(
        JSON.stringify({ success: false, message: `Local AI error: ${errText || aiResponse.statusText}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

                // Send live chunk to client
                const sseMessage = `data: ${JSON.stringify({
                  type: 'chunk',
                  text: chunkText,
                  done: parsedChunk.done || false,
                })}\n\n`;
                controller.enqueue(encoder.encode(sseMessage));

                if (parsedChunk.done) {
                  let cleanJson = accumulatedJson.trim();
                  if (cleanJson.startsWith('```json')) {
                    cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
                  } else if (cleanJson.startsWith('```')) {
                    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/```\s*$/, '');
                  }

                  let parsedData = null;
                  try {
                    const rawParsed = JSON.parse(cleanJson);
                    parsedData = {
                      questionNumber: rawParsed.questionNumber || questionNumber || 1,
                      questionText: rawParsed.questionText || '',
                      marks: Number(rawParsed.marks) || marks || 2,
                      questionType: rawParsed.questionType || questionType || 'mcq',
                      options: Array.isArray(rawParsed.options) ? rawParsed.options : undefined,
                      correctAnswer: rawParsed.correctAnswer,
                      explanation: rawParsed.explanation,
                    };
                  } catch (pErr) {
                    console.warn('Single question JSON parse fallback:', pErr);
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
                // Ignore chunk parse glitches
              }
            }
          }

          // Fallback close
          let cleanJson = accumulatedJson.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
          } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```\s*/, '').replace(/```\s*$/, '');
          }

          let parsedData = null;
          try {
            const rawParsed = JSON.parse(cleanJson);
            parsedData = {
              questionNumber: rawParsed.questionNumber || questionNumber || 1,
              questionText: rawParsed.questionText || '',
              marks: Number(rawParsed.marks) || marks || 2,
              questionType: rawParsed.questionType || questionType || 'mcq',
              options: Array.isArray(rawParsed.options) ? rawParsed.options : undefined,
              correctAnswer: rawParsed.correctAnswer,
              explanation: rawParsed.explanation,
            };
          } catch (pErr) {
            console.warn('Fallback single question parse failed:', pErr);
          }

          const finalDoneMessage = `data: ${JSON.stringify({
            type: 'complete',
            fullResponse: accumulatedJson,
            parsedData: parsedData,
          })}\n\n`;
          controller.enqueue(encoder.encode(finalDoneMessage));
          controller.close();
        } catch (streamErr: any) {
          console.error('Error during single question stream:', streamErr);
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
  } catch (err: any) {
    console.error('Error regenerating question:', err);
    return new Response(
      JSON.stringify({ success: false, message: err.message || 'Failed to regenerate question.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
