'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Grid,
  Alert,
  Paper,
  RadioGroup,
  Radio,
  CircularProgress,
  Tooltip,
  IconButton,
  Switch,
  LinearProgress,
} from '@mui/material';
import {
  IconSparkles,
  IconFileText,
  IconCheck,
  IconCopy,
  IconDownload,
  IconUpload,
  IconAward,
  IconSend,
  IconPlus,
  IconTrash,
  IconAdjustments,
  IconBulb,
  IconRefresh,
  IconTerminal2,
  IconPlayerStop,
  IconEye,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { SLMCourse } from '../../mock/slmMockData';

// ONLY 3 QUESTION TYPES AS REQUESTED
export type QuestionType = 'mcq' | 'fill_in_the_blanks' | 'true_false';

export interface TestSectionConfig {
  id: string;
  name: string;
  questionType: QuestionType;
  totalQuestions: number;
  questionsToAttempt: number;
  marksPerQuestion: number;
  instructions?: string;
}

export interface GeneratedQuestion {
  questionNumber: number;
  questionText: string;
  marks: number;
  questionType: QuestionType;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  isStreamingActive?: boolean;
}

export interface GeneratedSection {
  id: string;
  name: string;
  instructions: string;
  questionType: QuestionType;
  totalQuestions: number;
  questionsToAttempt: number;
  marksPerQuestion: number;
  totalSectionMarks: number;
  questions: GeneratedQuestion[];
}

export interface GeneratedTestPaper {
  testTitle: string;
  courseCode: string;
  courseTitle: string;
  department: string;
  term: string;
  unitScope: string;
  targetCohort: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  negativeMarking: string;
  allowedAttempts: string;
  generalInstructions: string[];
  generatedAt: string;
  sections: GeneratedSection[];
}

interface GenerateTestPanelProps {
  selectedCourse: SLMCourse | null;
  onOpenAddCourse?: () => void;
}

// Progressive real-time stream parser: extracts live instructions, sections, and active incomplete questions
function parseLiveStream(
  rawText: string,
  configSections: TestSectionConfig[]
): {
  instructions: string[];
  sections: GeneratedSection[];
  totalQuestionsFound: number;
  isStreamingActive: boolean;
} {
  if (!rawText || !rawText.trim()) {
    const emptySections = configSections.map((sec, sIdx) => ({
      id: sec.id || `sec-${sIdx + 1}`,
      name: sec.name,
      instructions: sec.instructions || '',
      questionType: sec.questionType,
      totalQuestions: sec.totalQuestions,
      questionsToAttempt: sec.questionsToAttempt,
      marksPerQuestion: sec.marksPerQuestion,
      totalSectionMarks: sec.questionsToAttempt * sec.marksPerQuestion,
      questions: [],
    }));
    return { instructions: [], sections: emptySections, totalQuestionsFound: 0, isStreamingActive: true };
  }

  let clean = rawText.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/i, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '');
  }

  // 1. Extract general instructions in real-time
  const instructions: string[] = [];
  const instMatch = clean.match(/"generalInstructions"\s*:\s*\[([^\]]*)(?:\]|$)/);
  if (instMatch) {
    const instRegex = /"((?:[^"\\]|\\.)*)(?:"|$)/g;
    let m;
    while ((m = instRegex.exec(instMatch[1])) !== null) {
      if (m[1]) instructions.push(m[1].replace(/\\"/g, '"'));
    }
  }

  // 2. Extract question occurrences (including active question currently being typed by the LLM)
  const qStarts: number[] = [];
  let searchIdx = 0;
  while (true) {
    const idx = clean.indexOf('"questionText"', searchIdx);
    if (idx === -1) break;
    const openBrace = clean.lastIndexOf('{', idx);
    if (openBrace !== -1 && !qStarts.includes(openBrace)) {
      qStarts.push(openBrace);
    }
    searchIdx = idx + 14;
  }

  const questionsFound: GeneratedQuestion[] = [];
  for (let i = 0; i < qStarts.length; i++) {
    const start = qStarts[i];
    const end = i + 1 < qStarts.length ? qStarts[i + 1] : clean.length;
    const chunk = clean.substring(start, end);
    const isLast = i === qStarts.length - 1;

    const qNumMatch = chunk.match(/"questionNumber"\s*:\s*(\d+)/);
    const qNum = qNumMatch ? parseInt(qNumMatch[1], 10) : i + 1;

    let qText = '';
    const qTextMatch = chunk.match(/"questionText"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
    if (qTextMatch) {
      qText = qTextMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }

    const marksMatch = chunk.match(/"marks"\s*:\s*(\d+)/);
    const marks = marksMatch ? parseInt(marksMatch[1], 10) : 2;

    const typeMatch = chunk.match(/"questionType"\s*:\s*"([^"]*)"/);
    let qType: QuestionType = 'mcq';
    if (typeMatch) {
      const parsedType = typeMatch[1].toLowerCase();
      if (parsedType.includes('blank') || parsedType.includes('fill')) {
        qType = 'fill_in_the_blanks';
      } else if (parsedType.includes('true') || parsedType.includes('false')) {
        qType = 'true_false';
      } else {
        qType = 'mcq';
      }
    }

    const options: string[] = [];
    const optionsBlock = chunk.match(/"options"\s*:\s*\[([^\]]*)(?:\]|$)/);
    if (optionsBlock) {
      const optStr = optionsBlock[1];
      const optRegex = /"((?:[^"\\]|\\.)*)(?:"|$)/g;
      let optM;
      while ((optM = optRegex.exec(optStr)) !== null) {
        if (optM[1]) options.push(optM[1].replace(/\\"/g, '"'));
      }
    }

    let correctAnswer: string | undefined = undefined;
    const ansMatch = chunk.match(/"correctAnswer"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
    if (ansMatch) {
      correctAnswer = ansMatch[1].replace(/\\"/g, '"');
    }

    let explanation: string | undefined = undefined;
    const expMatch = chunk.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
    if (expMatch) {
      explanation = expMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }

    // Auto-detect type if options missing but blanks or true/false present
    if (qType === 'mcq') {
      if (qText.includes('_____') || qText.includes('_______')) {
        qType = 'fill_in_the_blanks';
      } else if (
        options.length === 2 &&
        (options[0].toLowerCase().includes('true') || options[1].toLowerCase().includes('false'))
      ) {
        qType = 'true_false';
      }
    }

    questionsFound.push({
      questionNumber: qNum,
      questionText: qText,
      marks,
      questionType: qType,
      options: options.length > 0 ? options : undefined,
      correctAnswer,
      explanation,
      isStreamingActive: isLast,
    });
  }

  // 3. Distribute found questions into configured section slots
  let qCursor = 0;
  const sections = configSections.map((sec, sIdx) => {
    const secQuestions: GeneratedQuestion[] = [];
    for (let i = 0; i < sec.totalQuestions; i++) {
      if (qCursor < questionsFound.length) {
        const q = questionsFound[qCursor];
        // Enforce section questionType consistency
        secQuestions.push({
          ...q,
          questionType: sec.questionType,
        });
        qCursor++;
      }
    }
    return {
      id: sec.id || `sec-${sIdx + 1}`,
      name: sec.name,
      instructions: sec.instructions || '',
      questionType: sec.questionType,
      totalQuestions: sec.totalQuestions,
      questionsToAttempt: sec.questionsToAttempt,
      marksPerQuestion: sec.marksPerQuestion,
      totalSectionMarks: sec.questionsToAttempt * sec.marksPerQuestion,
      questions: secQuestions,
    };
  });

  return {
    instructions,
    sections,
    totalQuestionsFound: questionsFound.length,
    isStreamingActive: true,
  };
}

// Helper to parse single question streaming chunks in real time
function parseSingleQuestionStream(
  raw: string,
  defaultNum: number,
  defaultType: QuestionType,
  defaultMarks: number
): GeneratedQuestion {
  let qText = '';
  const textMatch = raw.match(/"questionText"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
  if (textMatch) {
    qText = textMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }

  let marks = defaultMarks;
  const marksMatch = raw.match(/"marks"\s*:\s*(\d+)/);
  if (marksMatch) {
    marks = parseInt(marksMatch[1], 10);
  }

  let qType = defaultType;
  const typeMatch = raw.match(/"questionType"\s*:\s*"([^"]+)"/);
  if (typeMatch) {
    const rawType = typeMatch[1].toLowerCase();
    if (rawType.includes('mcq') || rawType.includes('multiple')) qType = 'mcq';
    else if (rawType.includes('blank') || rawType.includes('fill')) qType = 'fill_in_the_blanks';
    else if (rawType.includes('true') || rawType.includes('false')) qType = 'true_false';
  }

  const options: string[] = [];
  const optArrayMatch = raw.match(/"options"\s*:\s*\[([\s\S]*?)(?:\]|$)/);
  if (optArrayMatch) {
    const optStr = optArrayMatch[1];
    const optRegex = /"((?:[^"\\]|\\.)*)(?:"|$)/g;
    let optM;
    while ((optM = optRegex.exec(optStr)) !== null) {
      if (optM[1]) options.push(optM[1].replace(/\\"/g, '"'));
    }
  }

  let correctAnswer: string | undefined = undefined;
  const ansMatch = raw.match(/"correctAnswer"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
  if (ansMatch) {
    correctAnswer = ansMatch[1].replace(/\\"/g, '"');
  }

  let explanation: string | undefined = undefined;
  const expMatch = raw.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
  if (expMatch) {
    explanation = expMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }

  return {
    questionNumber: defaultNum,
    questionText: qText,
    marks,
    questionType: qType,
    options:
      options.length > 0
        ? options
        : qType === 'true_false'
        ? ['True', 'False']
        : undefined,
    correctAnswer,
    explanation,
    isStreamingActive: true,
  };
}

export default function GenerateTestPanel({
  selectedCourse,
  onOpenAddCourse,
}: GenerateTestPanelProps) {
  // Check for uploaded syllabus
  const syllabusDocs =
    selectedCourse?.documents.filter((d) => d.type === 'syllabus' || d.type === 'ip') || [];
  const hasUploadedSyllabus = syllabusDocs.length > 0;

  // 1. Syllabus Source State
  const [sourceMode, setSourceMode] = useState<'uploaded' | 'paste' | 'new_upload'>(
    hasUploadedSyllabus ? 'uploaded' : 'paste'
  );
  const [selectedDocId, setSelectedDocId] = useState<string>(
    syllabusDocs.length > 0 ? syllabusDocs[0].id : ''
  );
  const [pastedSyllabus, setPastedSyllabus] = useState<string>(
    'Unit 1: Arrays, Linked Lists (Singly, Doubly, Circular), Stack Applications\nUnit 2: Queues, Deque, Priority Queues, Binary Trees & Traversals\nUnit 3: Binary Search Trees (BST), AVL Trees & Tree Balancing\nUnit 4: Graph Representations (Adj Matrix, Adj List), BFS & DFS\nUnit 5: Shortest Path (Dijkstra, Bellman-Ford), Minimum Spanning Trees (Prim, Kruskal)\nUnit 6: Dynamic Programming, Greedy Algorithms, Time & Space Complexity'
  );
  const [unitScope, setUnitScope] = useState<string>('Mid-Term');

  // 2. Global Test Configuration
  const [testTitle, setTestTitle] = useState<string>(
    selectedCourse
      ? `${selectedCourse.courseCode}: Assessment & Mock Test - 2026`
      : 'Course Assessment Mock Test - 2026'
  );
  const [cohortTarget, setCohortTarget] = useState<string>('remedial');
  const [allowedAttempts, setAllowedAttempts] = useState<string>('unlimited');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [negativeMarking, setNegativeMarking] = useState<string>('none');
  const [passingPercentage, setPassingPercentage] = useState<number>(40);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>(
    'Focus on core problem-solving, foundational concepts, step-by-step clarity, and practical comprehension.'
  );
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [randomizeOrder, setRandomizeOrder] = useState<boolean>(true);

  // 3. Dynamic Section Builder State (Default: Only MCQ Section)
  const [sections, setSections] = useState<TestSectionConfig[]>([
    {
      id: 'sec-1',
      name: 'Section A: Multiple Choice Questions (MCQs)',
      questionType: 'mcq',
      totalQuestions: 5,
      questionsToAttempt: 5,
      marksPerQuestion: 2,
      instructions: 'Compulsory. Each question carries 2 marks.',
    },
  ]);

  // Dynamic calculated totals
  const calculatedTotalMarks = useMemo(() => {
    return sections.reduce((sum, s) => sum + s.questionsToAttempt * s.marksPerQuestion, 0);
  }, [sections]);

  const totalQuestionsTarget = useMemo(() => {
    return sections.reduce((sum, s) => sum + s.totalQuestions, 0);
  }, [sections]);

  // Section Handlers
  const handleAddSection = () => {
    const nextLetter = String.fromCharCode(65 + sections.length);
    const types: QuestionType[] = ['mcq', 'fill_in_the_blanks', 'true_false'];
    const chosenType = types[sections.length % 3];

    const typeNames: Record<QuestionType, string> = {
      mcq: 'Multiple Choice Questions (MCQs)',
      fill_in_the_blanks: 'Fill in the Blanks',
      true_false: 'True / False Statements',
    };

    const newSection: TestSectionConfig = {
      id: `sec-${Date.now()}`,
      name: `Section ${nextLetter}: ${typeNames[chosenType]}`,
      questionType: chosenType,
      totalQuestions: 5,
      questionsToAttempt: 5,
      marksPerQuestion: chosenType === 'true_false' ? 1 : 2,
      instructions: `All questions in Section ${nextLetter} carry equal marks.`,
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleUpdateSection = (id: string, field: keyof TestSectionConfig, value: any) => {
    setSections(
      sections.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };
          if (field === 'totalQuestions' && updated.questionsToAttempt > Number(value)) {
            updated.questionsToAttempt = Number(value);
          }
          return updated;
        }
        return s;
      })
    );
  };

  // Preset Template Loader (Only using mcq, fill_in_the_blanks, true_false)
  const applyPresetTemplate = (preset: 'standard' | 'quiz' | 'remedial' | 'comprehensive') => {
    if (preset === 'quiz') {
      setDurationMinutes(20);
      setSections([
        {
          id: 'sec-q1',
          name: 'Section A: Multiple Choice Questions (MCQs)',
          questionType: 'mcq',
          totalQuestions: 5,
          questionsToAttempt: 5,
          marksPerQuestion: 1,
          instructions: 'All 5 MCQs are compulsory (1 mark each).',
        },
        {
          id: 'sec-q2',
          name: 'Section B: True / False Statements',
          questionType: 'true_false',
          totalQuestions: 5,
          questionsToAttempt: 5,
          marksPerQuestion: 1,
          instructions: 'State True or False (1 mark each).',
        },
      ]);
    } else if (preset === 'remedial') {
      setDurationMinutes(45);
      setSections([
        {
          id: 'sec-r1',
          name: 'Section A: Fundamental MCQs',
          questionType: 'mcq',
          totalQuestions: 5,
          questionsToAttempt: 5,
          marksPerQuestion: 2,
          instructions: 'Core concept definitions (2 marks each).',
        },
        {
          id: 'sec-r2',
          name: 'Section B: Fill in the Blanks',
          questionType: 'fill_in_the_blanks',
          totalQuestions: 5,
          questionsToAttempt: 5,
          marksPerQuestion: 2,
          instructions: 'Fill in missing keywords & terms (2 marks each).',
        },
        {
          id: 'sec-r3',
          name: 'Section C: True / False Concept Checks',
          questionType: 'true_false',
          totalQuestions: 5,
          questionsToAttempt: 5,
          marksPerQuestion: 1,
          instructions: 'Identify True/False statements (1 mark each).',
        },
      ]);
    } else if (preset === 'comprehensive') {
      setDurationMinutes(90);
      setSections([
        {
          id: 'sec-c1',
          name: 'Section A: Objective MCQs',
          questionType: 'mcq',
          totalQuestions: 10,
          questionsToAttempt: 10,
          marksPerQuestion: 2,
          instructions: 'All 10 MCQs are compulsory.',
        },
        {
          id: 'sec-c2',
          name: 'Section B: Fill in the Blanks',
          questionType: 'fill_in_the_blanks',
          totalQuestions: 10,
          questionsToAttempt: 10,
          marksPerQuestion: 2,
          instructions: 'Provide exact missing terms.',
        },
        {
          id: 'sec-c3',
          name: 'Section C: True / False Analysis',
          questionType: 'true_false',
          totalQuestions: 10,
          questionsToAttempt: 10,
          marksPerQuestion: 1,
          instructions: 'State True or False for each proposition.',
        },
      ]);
    } else {
      // Standard: Default MCQ only
      setDurationMinutes(30);
      setSections([
        {
          id: 'sec-1',
          name: 'Section A: Multiple Choice Questions (MCQs)',
          questionType: 'mcq',
          totalQuestions: 5,
          questionsToAttempt: 5,
          marksPerQuestion: 2,
          instructions: 'Compulsory. Each question carries 2 marks.',
        },
      ]);
    }
  };

  // AI Live Streaming State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [streamedRawText, setStreamedRawText] = useState<string>('');
  const [streamChunksCount, setStreamChunksCount] = useState<number>(0);
  const [streamSeconds, setStreamSeconds] = useState<number>(0);
  const [showStreamConsole, setShowStreamConsole] = useState<boolean>(false);

  // Live Real-Time Dynamic Test Paper State (Populates as tokens land!)
  const [liveStreamData, setLiveStreamData] = useState<{
    instructions: string[];
    sections: GeneratedSection[];
    totalQuestionsFound: number;
  }>({
    instructions: [],
    sections: [],
    totalQuestionsFound: 0,
  });

  // Final Generated Paper State (After completion)
  const [generatedPaper, setGeneratedPaper] = useState<GeneratedTestPaper | null>(null);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [published, setPublished] = useState<boolean>(false);

  // Active question scroll ref
  const activeQuestionRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to active building question during stream
  useEffect(() => {
    if (isGenerating && activeQuestionRef.current) {
      activeQuestionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [liveStreamData.totalQuestionsFound, isGenerating]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // State for single question regeneration
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);

  // Regenerate a single specific question with LIVE real-time streaming animation
  const handleRegenerateSingleQuestion = async (
    sectionId: string,
    sectionName: string,
    question: GeneratedQuestion
  ) => {
    if (!selectedCourse) return;
    const key = `${sectionId}-${question.questionNumber}`;
    setRegeneratingKey(key);

    let activeSyllabus = pastedSyllabus;
    if (sourceMode === 'uploaded') {
      const doc = syllabusDocs.find((d) => d.id === selectedDocId) || syllabusDocs[0];
      if (doc) {
        activeSyllabus = `Syllabus Title: ${doc.name}\nFile: ${doc.fileName}\nUnit Scope: ${doc.unitModule}\nDescription: ${doc.description || 'Course Syllabus and Learning Objectives'}`;
      }
    }

    const updateQuestionInState = (qData: GeneratedQuestion) => {
      setGeneratedPaper((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((sec) => {
            if (sec.id === sectionId || sec.name === sectionName) {
              return {
                ...sec,
                questions: sec.questions.map((q) =>
                  q.questionNumber === question.questionNumber ? qData : q
                ),
              };
            }
            return sec;
          }),
        };
      });

      setLiveStreamData((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id === sectionId || sec.name === sectionName) {
            return {
              ...sec,
              questions: sec.questions.map((q) =>
                q.questionNumber === question.questionNumber ? qData : q
              ),
            };
          }
          return sec;
        }),
      }));
    };

    // Reset question to blank streaming state immediately
    updateQuestionInState({
      questionNumber: question.questionNumber,
      questionText: '',
      marks: question.marks,
      questionType: question.questionType,
      options: [],
      correctAnswer: undefined,
      explanation: undefined,
      isStreamingActive: true,
    });

    try {
      const response = await fetch('/api/regenerate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: {
            courseCode: selectedCourse.courseCode,
            courseTitle: selectedCourse.courseTitle,
            department: selectedCourse.department,
          },
          syllabusText: activeSyllabus,
          sectionName,
          questionType: question.questionType,
          questionNumber: question.questionNumber,
          marks: question.marks,
          currentQuestionText: question.questionText,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedRaw = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const jsonPayload = trimmed.replace(/^data:\s*/, '');
          try {
            const eventData = JSON.parse(jsonPayload);

            if (eventData.type === 'chunk') {
              accumulatedRaw += eventData.text || '';
              const liveParsedQ = parseSingleQuestionStream(
                accumulatedRaw,
                question.questionNumber,
                question.questionType,
                question.marks
              );
              updateQuestionInState(liveParsedQ);
            } else if (eventData.type === 'complete') {
              const finalQData =
                eventData.parsedData ||
                parseSingleQuestionStream(
                  accumulatedRaw,
                  question.questionNumber,
                  question.questionType,
                  question.marks
                );
              updateQuestionInState({
                ...finalQData,
                isStreamingActive: false,
              });
            }
          } catch (e) {
            // Ignore line parsing glitch
          }
        }
      }
    } catch (err) {
      console.error('Failed to stream regenerate single question:', err);
      updateQuestionInState({ ...question, isStreamingActive: false });
    } finally {
      setRegeneratingKey(null);
    }
  };

  // Stop Generation Handler
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGenerating(false);
  };

  // Real-Time Live Building Stream Generation
  const handleGenerate = async () => {
    if (!selectedCourse) return;

    // Reset previous states
    setIsGenerating(true);
    setGenerationError(null);
    setStreamedRawText('');
    setStreamChunksCount(0);
    setStreamSeconds(0);
    setGeneratedPaper(null);
    setShowAnswers(false);
    setPublished(false);

    // Initialize blank live building sections
    const initialLive = parseLiveStream('', sections);
    setLiveStreamData(initialLive);

    // Start live elapsed timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStreamSeconds((prev) => prev + 1);
    }, 1000);

    // Abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let activeSyllabus = pastedSyllabus;
    if (sourceMode === 'uploaded') {
      const doc = syllabusDocs.find((d) => d.id === selectedDocId) || syllabusDocs[0];
      if (doc) {
        activeSyllabus = `Syllabus Title: ${doc.name}\nFile: ${doc.fileName}\nUnit Scope: ${doc.unitModule}\nDescription: ${doc.description || 'Course Syllabus and Learning Objectives'}`;
      }
    }

    try {
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          course: {
            courseCode: selectedCourse.courseCode,
            courseTitle: selectedCourse.courseTitle,
            department: selectedCourse.department,
            term: selectedCourse.term,
          },
          syllabusText: activeSyllabus,
          sections,
          testTitle,
          unitScope,
          cohortTarget,
          durationMinutes,
          negativeMarking,
          passingPercentage,
          aiCustomPrompt,
          allowedAttempts,
        }),
      });

      if (!response.ok) {
        let errMessage = `HTTP error ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson.message) errMessage = errJson.message;
        } catch {
          // ignore
        }
        throw new Error(errMessage);
      }

      if (!response.body) {
        throw new Error('ReadableStream body not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedRaw = '';
      let chunkCounter = 0;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const jsonPayload = trimmed.replace(/^data:\s*/, '');
          try {
            const eventData = JSON.parse(jsonPayload);

            if (eventData.type === 'chunk') {
              accumulatedRaw += eventData.text || '';
              chunkCounter++;
              setStreamChunksCount(chunkCounter);
              setStreamedRawText(accumulatedRaw);

              // 🌟 REAL-TIME TOKEN-BY-TOKEN QUESTION UI BUILDER:
              const liveParsed = parseLiveStream(accumulatedRaw, sections);
              setLiveStreamData(liveParsed);
            } else if (eventData.type === 'complete') {
              const fullJsonText = eventData.fullResponse || accumulatedRaw;
              let finalParsed = eventData.parsedData;

              if (!finalParsed) {
                try {
                  let clean = fullJsonText.trim();
                  if (clean.startsWith('```json')) {
                    clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
                  } else if (clean.startsWith('```')) {
                    clean = clean.replace(/^```\s*/, '').replace(/```\s*$/, '');
                  }
                  finalParsed = JSON.parse(clean);
                } catch {
                  const fallbackParsed = parseLiveStream(fullJsonText, sections);
                  finalParsed = {
                    generalInstructions: fallbackParsed.instructions,
                    sections: fallbackParsed.sections,
                  };
                }
              }

              // Finalize and build complete test paper object
              const finalizedSections: GeneratedSection[] = (finalParsed.sections || []).map(
                (sec: any, idx: number) => {
                  const cfgSec = sections[idx] || sections[0];
                  const qList: GeneratedQuestion[] = Array.isArray(sec.questions)
                    ? sec.questions
                    : [];
                  return {
                    id: sec.id || `sec-${idx + 1}`,
                    name: sec.name || cfgSec?.name || `Section ${String.fromCharCode(65 + idx)}`,
                    instructions: sec.instructions || cfgSec?.instructions || '',
                    questionType: cfgSec.questionType,
                    totalQuestions: cfgSec?.totalQuestions || qList.length || 1,
                    questionsToAttempt: cfgSec?.questionsToAttempt || qList.length || 1,
                    marksPerQuestion: cfgSec?.marksPerQuestion || 2,
                    totalSectionMarks:
                      (cfgSec?.questionsToAttempt || qList.length || 1) *
                      (cfgSec?.marksPerQuestion || 2),
                    questions: qList.map((q) => ({
                      ...q,
                      questionType: cfgSec.questionType,
                      isStreamingActive: false,
                    })),
                  };
                }
              );

              const newPaper: GeneratedTestPaper = {
                testTitle: testTitle || `${selectedCourse.courseCode} Assessment Examination`,
                courseCode: selectedCourse.courseCode,
                courseTitle: selectedCourse.courseTitle,
                department: selectedCourse.department,
                term: selectedCourse.term,
                unitScope,
                targetCohort: cohortTarget === 'remedial' ? 'Remedial Classes' : 'Tuition Classes',
                durationMinutes,
                totalMarks: calculatedTotalMarks,
                passingPercentage,
                negativeMarking,
                allowedAttempts,
                generalInstructions:
                  Array.isArray(finalParsed.generalInstructions) &&
                  finalParsed.generalInstructions.length > 0
                    ? finalParsed.generalInstructions
                    : [
                        `Total duration: ${durationMinutes} minutes.`,
                        `Read all questions and instructions carefully before attempting.`,
                        negativeMarking !== 'none'
                          ? `Negative marking of ${negativeMarking} marks is applicable.`
                          : 'No negative marking.',
                      ],
                generatedAt: new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                sections: finalizedSections,
              };

              setGeneratedPaper(newPaper);
              setIsGenerating(false);
              if (timerRef.current) clearInterval(timerRef.current);
              return;
            } else if (eventData.type === 'error') {
              throw new Error(eventData.message || 'Error occurred during AI generation.');
            }
          } catch (pErr: any) {
            if (pErr.name === 'AbortError') return;
            // non-fatal stream parse glitch
          }
        }
      }

      // If stream ended without explicit complete signal, use accumulated stream
      if (accumulatedRaw) {
        const liveFallback = parseLiveStream(accumulatedRaw, sections);
        const newPaper: GeneratedTestPaper = {
          testTitle: testTitle || `${selectedCourse.courseCode} Assessment Examination`,
          courseCode: selectedCourse.courseCode,
          courseTitle: selectedCourse.courseTitle,
          department: selectedCourse.department,
          term: selectedCourse.term,
          unitScope,
          targetCohort: cohortTarget === 'remedial' ? 'Remedial Classes' : 'Tuition Classes',
          durationMinutes,
          totalMarks: calculatedTotalMarks,
          passingPercentage,
          negativeMarking,
          allowedAttempts,
          generalInstructions: liveFallback.instructions.length > 0 ? liveFallback.instructions : [
            `Total duration: ${durationMinutes} minutes.`,
            `Read all section instructions carefully.`,
          ],
          generatedAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          sections: liveFallback.sections,
        };
        setGeneratedPaper(newPaper);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('AI generation stream error:', err);
        setGenerationError(err.message || 'Could not connect to local AI service.');
      }
    } finally {
      setIsGenerating(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(
      `https://ums.lpu.co.in/assessment/${selectedCourse?.courseCode || 'test'}`
    );
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePublish = () => {
    setPublished(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine active display data (either live streaming in real-time or finalized paper)
  const isDisplayingPaper = isGenerating || generatedPaper !== null;
  const activeSections = generatedPaper ? generatedPaper.sections : liveStreamData.sections;
  const activeInstructions = generatedPaper
    ? generatedPaper.generalInstructions
    : liveStreamData.instructions.length > 0
    ? liveStreamData.instructions
    : [
        `The exam duration is ${durationMinutes} minutes.`,
        `Read all section instructions and attempt rules carefully.`,
        negativeMarking !== 'none'
          ? `Negative marking: ${negativeMarking} marks deducted per wrong response.`
          : 'No negative marking is applicable.',
      ];

  if (!selectedCourse) {
    return (
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px dashed #cbd5e1',
          p: { xs: 4, md: 8 },
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}
      >
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: '20px',
            bgcolor: '#e5f3fb',
            color: '#0085db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <IconSparkles size={36} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
          No Course Code Selected
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', maxWidth: '440px', mx: 'auto', mb: 3 }}>
          Please select a course code from the left sidebar or create a new course code to begin
          configuring and generating real-time live building AI tests with llama3.2.
        </Typography>
        {onOpenAddCourse && (
          <Button
            variant="contained"
            onClick={onOpenAddCourse}
            startIcon={<IconPlus size={18} />}
            sx={{
              bgcolor: '#0085db',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 3,
              py: 1,
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            Add New Course Code
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Header Course Banner */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          p: { xs: 2.5, sm: 3 },
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75, flexWrap: 'wrap' }}>
              <Chip
                label={selectedCourse.courseCode}
                sx={{
                  bgcolor: '#0085db',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  height: '30px',
                  borderRadius: '8px',
                  px: 0.5,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  fontSize: { xs: '1.05rem', sm: '1.25rem' },
                }}
              >
                {selectedCourse.courseTitle}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              {selectedCourse.department} • {selectedCourse.credits} Credits • {selectedCourse.term} •
              Lead: {selectedCourse.facultyLead}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<IconSparkles size={16} style={{ color: '#0085db' }} />}
              label="Ollama llama3.2:latest Engine"
              sx={{
                bgcolor: '#e5f3fb',
                color: '#0085db',
                fontWeight: 700,
                border: '1px solid #cbe6f7',
                borderRadius: '10px',
                px: 1,
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* 2. Syllabus & Instruction Plan (IP) Source Card */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#e5f3fb',
              color: '#0085db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconFileText size={22} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
              1. Syllabus & Instruction Plan (IP) Source
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Select where the local AI should extract the concepts, learning objectives, and unit scope.
            </Typography>
          </Box>
        </Box>

        {/* Input Mode Selector */}
        <RadioGroup
          row
          value={sourceMode}
          onChange={(e) => setSourceMode(e.target.value as any)}
          sx={{ mb: 2.5, gap: 2 }}
        >
          <FormControlLabel
            value="uploaded"
            disabled={!hasUploadedSyllabus}
            control={<Radio size="small" sx={{ color: '#0085db', '&.Mui-checked': { color: '#0085db' } }} />}
            label={
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: hasUploadedSyllabus ? '#1e293b' : '#94a3b8' }}
              >
                Use Uploaded Syllabus / IP {hasUploadedSyllabus ? `(${syllabusDocs.length} Found)` : '(None Uploaded)'}
              </Typography>
            }
          />
          <FormControlLabel
            value="paste"
            control={<Radio size="small" sx={{ color: '#0085db', '&.Mui-checked': { color: '#0085db' } }} />}
            label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Paste / Custom Syllabus Topics</Typography>}
          />
          <FormControlLabel
            value="new_upload"
            control={<Radio size="small" sx={{ color: '#0085db', '&.Mui-checked': { color: '#0085db' } }} />}
            label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Upload New Syllabus Document</Typography>}
          />
        </RadioGroup>

        {/* Mode 1: Uploaded Syllabus Selected */}
        {sourceMode === 'uploaded' && hasUploadedSyllabus && (
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="select-syllabus-label">Select Uploaded Course Syllabus / IP</InputLabel>
              <Select
                labelId="select-syllabus-label"
                value={selectedDocId || syllabusDocs[0]?.id}
                label="Select Uploaded Course Syllabus / IP"
                onChange={(e) => setSelectedDocId(e.target.value)}
                sx={{ borderRadius: '10px' }}
              >
                {syllabusDocs.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    📄 {doc.name} ({doc.fileName}) • Scope: {doc.unitModule}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Alert
              severity="success"
              icon={<IconCheck size={18} />}
              sx={{ mt: 1.5, borderRadius: '10px', bgcolor: '#e5f3fb', color: '#006cb3', border: '1px solid #cbe6f7' }}
            >
              <strong>Active Syllabus Verified:</strong> AI will generate questions adhering strictly to learning objectives from &quot;{syllabusDocs.find((d) => d.id === selectedDocId)?.name || syllabusDocs[0]?.name}&quot;.
            </Alert>
          </Box>
        )}

        {/* Mode 2: Paste Syllabus Text */}
        {sourceMode === 'paste' && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Syllabus Units & Key Topics Outline"
              placeholder="e.g. Unit 1: Arrays, Linked Lists, Stack Applications\nUnit 2: Binary Search Trees, Graph Traversals..."
              value={pastedSyllabus}
              onChange={(e) => setPastedSyllabus(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                },
              }}
            />
          </Box>
        )}

        {/* Mode 3: Upload New File */}
        {sourceMode === 'new_upload' && (
          <Box
            sx={{
              p: 2.5,
              mb: 2,
              border: '2px dashed #0085db',
              borderRadius: '14px',
              bgcolor: '#f0f7fd',
              textAlign: 'center',
            }}
          >
            <IconUpload size={28} color="#0085db" style={{ marginBottom: 6 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Drag & Drop Syllabus PDF / DOCX or Click to Browse
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Supported: PDF, DOCX, TXT (Up to 25MB)
            </Typography>
          </Box>
        )}
      </Card>

      {/* 3. Test Format & Assessment Parameters */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.5,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: '#e5f3fb',
                color: '#0085db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconAdjustments size={22} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                2. Test Format & Assessment Parameters
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Configure test title, unit scope, target cohort, attempts, duration, negative marking, and passing marks.
              </Typography>
            </Box>
          </Box>

          {/* Quick Preset Templates */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mr: 0.5 }}>
              1-Click Presets:
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => applyPresetTemplate('standard')}
              sx={{ borderRadius: '8px', fontSize: '0.72rem', py: 0.3, textTransform: 'none', borderColor: '#cbd5e1', color: '#334155' }}
            >
              Standard 25M
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => applyPresetTemplate('quiz')}
              sx={{ borderRadius: '8px', fontSize: '0.72rem', py: 0.3, textTransform: 'none', borderColor: '#cbd5e1', color: '#334155' }}
            >
              Quick Quiz 10M
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => applyPresetTemplate('remedial')}
              sx={{ borderRadius: '8px', fontSize: '0.72rem', py: 0.3, textTransform: 'none', borderColor: '#cbd5e1', color: '#334155' }}
            >
              Remedial 25M
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => applyPresetTemplate('comprehensive')}
              sx={{ borderRadius: '8px', fontSize: '0.72rem', py: 0.3, textTransform: 'none', borderColor: '#cbd5e1', color: '#334155' }}
            >
              Full 50M
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          {/* Test Title */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Test / Exam Title"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Grid>

          {/* Unit Scope */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Unit Scope</InputLabel>
              <Select
                value={unitScope}
                label="Unit Scope"
                onChange={(e) => setUnitScope(e.target.value)}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="Full Course">Full Course (All Units 1-6)</MenuItem>
                <MenuItem value="Unit 1">Unit 1</MenuItem>
                <MenuItem value="Unit 2">Unit 2</MenuItem>
                <MenuItem value="Unit 3">Unit 3</MenuItem>
                <MenuItem value="Unit 4">Unit 4</MenuItem>
                <MenuItem value="Unit 5">Unit 5</MenuItem>
                <MenuItem value="Unit 6">Unit 6</MenuItem>
                <MenuItem value="Mid-Term">Mid-Term (Units 1, 2, 3)</MenuItem>
                <MenuItem value="End-Term">End-Term (Units 4, 5, 6)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Target Cohort */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Target Cohort</InputLabel>
              <Select
                value={cohortTarget}
                label="Target Cohort"
                onChange={(e) => setCohortTarget(e.target.value)}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="remedial">Remedial Classes</MenuItem>
                <MenuItem value="tuition">Tuition Classes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Allowed Attempts */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Allowed Attempts</InputLabel>
              <Select
                value={allowedAttempts}
                label="Allowed Attempts"
                onChange={(e) => setAllowedAttempts(e.target.value)}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="unlimited">Endless / Unlimited Attempts</MenuItem>
                <MenuItem value="1">1 Attempt (Strict Single Submission)</MenuItem>
                <MenuItem value="2">2 Attempts</MenuItem>
                <MenuItem value="3">3 Attempts</MenuItem>
                <MenuItem value="5">5 Attempts</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Duration */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Duration (Minutes)</InputLabel>
              <Select
                value={durationMinutes}
                label="Duration (Minutes)"
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value={15}>15 Minutes (Micro Quiz)</MenuItem>
                <MenuItem value={30}>30 Minutes</MenuItem>
                <MenuItem value={45}>45 Minutes</MenuItem>
                <MenuItem value={60}>60 Minutes (1 Hour)</MenuItem>
                <MenuItem value={90}>90 Minutes (1.5 Hours)</MenuItem>
                <MenuItem value={120}>120 Minutes (2 Hours)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Negative Marking */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Negative Marking</InputLabel>
              <Select
                value={negativeMarking}
                label="Negative Marking"
                onChange={(e) => setNegativeMarking(e.target.value)}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="none">No Negative Marking</MenuItem>
                <MenuItem value="0.25">-0.25 Mark (-25% per wrong response)</MenuItem>
                <MenuItem value="0.33">-0.33 Mark (-33% per wrong response)</MenuItem>
                <MenuItem value="0.50">-0.50 Mark (-50% per wrong response)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Passing Percentage */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Passing Criteria</InputLabel>
              <Select
                value={passingPercentage}
                label="Passing Criteria"
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value={30}>30% Pass Threshold</MenuItem>
                <MenuItem value={40}>40% Standard Pass Threshold</MenuItem>
                <MenuItem value={50}>50% Moderate Mastery</MenuItem>
                <MenuItem value={60}>60% High Distinction Level</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* 4. Dynamic Section Builder Card (Strictly MCQ, Fill in Blanks, True/False) */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.5,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: '#e5f3fb',
                color: '#0085db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconAward size={22} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                3. Section Builder & Marks Distribution ({sections.length} Sections)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Configure sections choosing from MCQ, Fill in the Blanks, and True / False formats.
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            variant="contained"
            onClick={handleAddSection}
            startIcon={<IconPlus size={16} />}
            sx={{
              bgcolor: '#0085db',
              color: '#ffffff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            + Add New Section
          </Button>
        </Box>

        {/* Section List Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map((sec, idx) => {
            const sectionSubtotal = sec.questionsToAttempt * sec.marksPerQuestion;

            return (
              <Paper
                key={sec.id}
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  bgcolor: '#f8fafc',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#cbd5e1' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Chip
                      label={`Section ${String.fromCharCode(65 + idx)}`}
                      size="small"
                      sx={{ bgcolor: '#0085db', color: '#ffffff', fontWeight: 800, fontSize: '0.74rem' }}
                    />
                    <TextField
                      size="small"
                      value={sec.name}
                      onChange={(e) => handleUpdateSection(sec.id, 'name', e.target.value)}
                      sx={{
                        flex: 1,
                        maxWidth: '450px',
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#ffffff',
                          borderRadius: '8px',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={`Subtotal: ${sec.questionsToAttempt} × ${sec.marksPerQuestion}M = ${sectionSubtotal} Marks`}
                      sx={{
                        bgcolor: '#e5f3fb',
                        color: '#0085db',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        border: '1px solid #cbe6f7',
                      }}
                    />

                    {sections.length > 1 && (
                      <Tooltip title="Remove Section">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSection(sec.id)}
                          sx={{ color: '#dc2626', p: 0.5 }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {/* Section Controls Grid */}
                <Grid container spacing={2}>
                  {/* Question Format */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Question Type</InputLabel>
                      <Select
                        value={sec.questionType}
                        label="Question Type"
                        onChange={(e) => handleUpdateSection(sec.id, 'questionType', e.target.value)}
                        sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                      >
                        <MenuItem value="mcq">Multiple Choice Questions (MCQ)</MenuItem>
                        <MenuItem value="fill_in_the_blanks">Fill in the Blanks</MenuItem>
                        <MenuItem value="true_false">True / False</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Total Questions in Section */}
                  <Grid size={{ xs: 6, sm: 2, md: 2.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Total Questions"
                      value={sec.totalQuestions}
                      onChange={(e) =>
                        handleUpdateSection(sec.id, 'totalQuestions', Math.max(1, Number(e.target.value)))
                      }
                      slotProps={{ htmlInput: { min: 1, max: 50 } }}
                      sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>

                  {/* Questions to Attempt */}
                  <Grid size={{ xs: 6, sm: 2, md: 2.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="To Attempt"
                      value={sec.questionsToAttempt}
                      onChange={(e) =>
                        handleUpdateSection(
                          sec.id,
                          'questionsToAttempt',
                          Math.min(sec.totalQuestions, Math.max(1, Number(e.target.value)))
                        )
                      }
                      slotProps={{ htmlInput: { min: 1, max: sec.totalQuestions } }}
                      helperText={
                        sec.questionsToAttempt < sec.totalQuestions
                          ? `Choice: ${sec.questionsToAttempt} of ${sec.totalQuestions}`
                          : 'Compulsory'
                      }
                      sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>

                  {/* Marks per Question */}
                  <Grid size={{ xs: 12, sm: 2, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Marks / Question"
                      value={sec.marksPerQuestion}
                      onChange={(e) =>
                        handleUpdateSection(sec.id, 'marksPerQuestion', Math.max(1, Number(e.target.value)))
                      }
                      slotProps={{ htmlInput: { min: 1, max: 100 } }}
                      sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>

        {/* Dynamic Summary Bar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            p: 2,
            mt: 2.5,
            bgcolor: '#f0f7fd',
            borderRadius: '14px',
            border: '1.5px solid #cbe6f7',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#004d80' }}>
              Test Paper Summary:
            </Typography>
            <Chip label={`${sections.length} Configured Sections`} size="small" sx={{ bgcolor: '#ffffff', fontWeight: 700 }} />
            <Chip label={`${totalQuestionsTarget} Total Questions`} size="small" sx={{ bgcolor: '#ffffff', fontWeight: 700 }} />
            <Chip label={`${durationMinutes} Minutes Allowed`} size="small" sx={{ bgcolor: '#ffffff', fontWeight: 700 }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#004d80' }}>
              Calculated Total:
            </Typography>
            <Chip
              icon={<IconAward size={18} style={{ color: '#ffffff' }} />}
              label={`${calculatedTotalMarks} Maximum Marks`}
              sx={{
                bgcolor: '#0085db',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                py: 2,
                px: 1,
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* 5. AI Directives & Execution Card */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#e5f3fb',
              color: '#0085db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconBulb size={22} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
              4. AI Generation Directives & Execution
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Connected to local AI model <code>llama3.2:latest</code> (http://172.18.12.25:11434). Responses stream in real-time.
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Custom AI Prompt / Specific Focus Directives"
          value={aiCustomPrompt}
          onChange={(e) => setAiCustomPrompt(e.target.value)}
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontSize: '0.88rem',
            },
          }}
        />

        {generationError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleGenerate} startIcon={<IconRefresh size={14} />}>
                Retry
              </Button>
            }
            sx={{ mb: 2.5, borderRadius: '10px' }}
          >
            {generationError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Include Complete Answer Keys & Explanations</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={randomizeOrder}
                  onChange={(e) => setRandomizeOrder(e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Randomize Question Order</Typography>}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isGenerating && (
              <Button
                variant="outlined"
                color="error"
                size="large"
                onClick={handleStopGeneration}
                startIcon={<IconPlayerStop size={18} />}
                sx={{
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 2.5,
                  py: 1.35,
                  textTransform: 'none',
                }}
              >
                Stop Stream
              </Button>
            )}

            <Button
              variant="contained"
              size="large"
              onClick={handleGenerate}
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <IconSparkles size={20} />}
              sx={{
                bgcolor: '#0085db',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                px: 4,
                py: 1.35,
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(0, 133, 219, 0.3)',
                textTransform: 'none',
                '&:hover': { bgcolor: '#006cb3' },
              }}
            >
              {isGenerating ? 'AI Synthesizing Test UI...' : 'Generate Test Paper with Local AI'}
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 6. LIVE REAL-TIME BUILDING EXAMINATION PAPER UI */}
      {isDisplayingPaper && (
        <Card
          elevation={0}
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '20px',
            border: isGenerating ? '2px solid #0085db' : '1px solid #e2e8f0',
            p: { xs: 2.5, sm: 4 },
            boxShadow: isGenerating
              ? '0 8px 32px rgba(0, 133, 219, 0.15)'
              : '0 4px 24px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Live Progress Bar when generating */}
          {isGenerating && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                bgcolor: '#e5f3fb',
                '& .MuiLinearProgress-bar': { bgcolor: '#0085db' },
              }}
            />
          )}

          {/* Live Building Status Banner */}
          {isGenerating && (
            <Box
              sx={{
                p: 2,
                mb: 3,
                bgcolor: '#e5f3fb',
                borderRadius: '14px',
                border: '1.5px solid #bce1fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.25)',
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
                      '70%': { transform: 'scale(1)', boxShadow: '0 0 0 8px rgba(16, 185, 129, 0)' },
                      '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
                    },
                  }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#004d80' }}>
                  Building Test Questions in Real-Time via llama3.2:latest...
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  label={`Chunks: ${streamChunksCount}`}
                  size="small"
                  sx={{ bgcolor: '#ffffff', fontWeight: 700, color: '#004d80' }}
                />
                <Chip
                  label={`Elapsed: ${streamSeconds}s`}
                  size="small"
                  sx={{ bgcolor: '#ffffff', fontWeight: 700, color: '#004d80' }}
                />
                <Chip
                  label={`Questions Built: ${liveStreamData.totalQuestionsFound} / ${totalQuestionsTarget}`}
                  size="small"
                  sx={{ bgcolor: '#0085db', color: '#ffffff', fontWeight: 800 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowStreamConsole(!showStreamConsole)}
                  startIcon={<IconTerminal2 size={14} />}
                  endIcon={showStreamConsole ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#0085db',
                    color: '#0085db',
                    bgcolor: '#ffffff',
                  }}
                >
                  {showStreamConsole ? 'Hide Stream Console' : 'View Stream Console'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Optional Collapsible Token Stream Console */}
          {isGenerating && showStreamConsole && (
            <Box
              sx={{
                bgcolor: '#0f172a',
                color: '#38bdf8',
                borderRadius: '14px',
                p: 2,
                mb: 3,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid #1e293b',
              }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1, fontWeight: 700 }}>
                RAW SSE STREAM BUFFER:
              </Typography>
              <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#e2e8f0', lineHeight: 1.5 }}>
                {streamedRawText || 'Connecting to local LLM endpoint...'}
              </Box>
            </Box>
          )}

          {/* Header of Test Paper */}
          <Box
            sx={{
              pb: 3,
              mb: 3,
              borderBottom: '2px solid #e2e8f0',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label={isGenerating ? '⚡ AI Live Real-Time Synthesis' : 'Local AI Generated Assessment'}
                  size="small"
                  sx={{
                    bgcolor: isGenerating ? '#e0f2fe' : '#e5f3fb',
                    color: '#0085db',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    border: isGenerating ? '1px solid #7dd3fc' : 'none',
                  }}
                />
                <Chip
                  label={`Target: ${cohortTarget === 'remedial' ? 'Remedial Classes' : 'Tuition Classes'}`}
                  size="small"
                  sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.72rem' }}
                />
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Unit Scope: {unitScope} • Term: {selectedCourse.term}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {testTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mt: 0.25 }}>
                {selectedCourse.department} • Maximum Marks: {calculatedTotalMarks} • Time Allowed: {durationMinutes} Minutes • Pass Threshold: {passingPercentage}%
              </Typography>
            </Box>

            {/* Test Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Tooltip title={showAnswers ? 'Hide Answer Key' : 'Reveal Solution Key'}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowAnswers(!showAnswers)}
                  startIcon={<IconEye size={16} />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#0085db',
                    color: '#0085db',
                  }}
                >
                  {showAnswers ? 'Hide Answers' : 'Show Answer Key'}
                </Button>
              </Tooltip>

              <Tooltip title="Copy Student Test Link">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCopyLink}
                  startIcon={<IconCopy size={16} />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#cbd5e1',
                    color: '#334155',
                  }}
                >
                  {copiedLink ? 'Copied Link!' : 'Copy Link'}
                </Button>
              </Tooltip>

              <Button
                size="small"
                variant="outlined"
                onClick={handlePrint}
                startIcon={<IconDownload size={16} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#cbd5e1',
                  color: '#334155',
                }}
              >
                Download / Print
              </Button>

              <Button
                size="small"
                variant="contained"
                onClick={handlePublish}
                startIcon={<IconSend size={16} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: published ? '#16a34a' : '#0085db',
                  '&:hover': { bgcolor: published ? '#15803d' : '#006cb3' },
                }}
              >
                {published ? 'Published to Students!' : 'Publish Test'}
              </Button>
            </Box>
          </Box>

          {/* Test Paper Instructions */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3.5,
              bgcolor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
              General Instructions for Candidates:
            </Typography>
            {activeInstructions.map((inst, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{ color: '#475569', display: 'block', lineHeight: 1.6 }}
              >
                {i + 1}. {inst}
              </Typography>
            ))}
          </Paper>

          {/* 🌟 RENDER SECTIONS & QUESTIONS REAL-TIME FOR 3 TYPES (MCQ, Fill in Blanks, True/False) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activeSections.map((section, sIdx) => {
              const cfgSec = sections[sIdx] || sections[0];
              const questionsList = section.questions || [];

              return (
                <Box key={section.id || sIdx}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}
                    >
                      {section.name || cfgSec.name} ({cfgSec.questionsToAttempt} × {cfgSec.marksPerQuestion} ={' '}
                      {cfgSec.questionsToAttempt * cfgSec.marksPerQuestion} Marks)
                    </Typography>
                    <Chip
                      label={
                        cfgSec.questionType === 'mcq'
                          ? 'Multiple Choice'
                          : cfgSec.questionType === 'fill_in_the_blanks'
                          ? 'Fill in the Blanks'
                          : 'True / False'
                      }
                      size="small"
                      sx={{ bgcolor: '#e5f3fb', color: '#0085db', fontWeight: 700 }}
                    />
                  </Box>

                  {cfgSec.instructions && (
                    <Typography
                      variant="body2"
                      sx={{ color: '#64748b', fontSize: '0.85rem', mb: 2, fontStyle: 'italic' }}
                    >
                      {cfgSec.instructions}
                    </Typography>
                  )}

                    {/* Questions List for this Section */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {questionsList.map((q, qIdx) => {
                      const isThisQuestionRegenerating = regeneratingKey === `${section.id || `sec-${sIdx + 1}`}-${q.questionNumber}`;
                      const isCurrentlyStreaming = Boolean((isGenerating || isThisQuestionRegenerating) && q.isStreamingActive);
                      const qType = q.questionType || cfgSec.questionType;

                      return (
                        <Paper
                          key={q.questionNumber || qIdx}
                          ref={isCurrentlyStreaming ? activeQuestionRef : null}
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: '14px',
                            border: isCurrentlyStreaming
                              ? '2px solid #0085db'
                              : isThisQuestionRegenerating
                              ? '2px solid #0085db'
                              : '1.5px solid #e2e8f0',
                            bgcolor: '#ffffff',
                            boxShadow: isCurrentlyStreaming
                              ? '0 0 20px rgba(0, 133, 219, 0.25)'
                              : isThisQuestionRegenerating
                              ? '0 0 20px rgba(0, 133, 219, 0.2)'
                              : 'none',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 2,
                              mb: 1.5,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                              <Chip
                                label={`Q${q.questionNumber || qIdx + 1}`}
                                size="small"
                                sx={{
                                  bgcolor: isCurrentlyStreaming || isThisQuestionRegenerating ? '#0085db' : '#e5f3fb',
                                  color: isCurrentlyStreaming || isThisQuestionRegenerating ? '#ffffff' : '#0085db',
                                  fontWeight: 800,
                                }}
                              />
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 700,
                                  color: '#0f172a',
                                  lineHeight: 1.5,
                                  flex: 1,
                                }}
                              >
                                {q.questionText || (
                                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                    Formulating question statement...
                                  </span>
                                )}
                                {isCurrentlyStreaming && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      width: '6px',
                                      height: '14px',
                                      backgroundColor: '#0085db',
                                      marginLeft: '4px',
                                      verticalAlign: 'middle',
                                      animation: 'blink 1s step-start infinite',
                                    }}
                                  />
                                )}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {isCurrentlyStreaming && (
                                <Chip
                                  label="⚡ Streaming Live..."
                                  size="small"
                                  sx={{
                                    bgcolor: '#e0f2fe',
                                    color: '#0085db',
                                    fontWeight: 800,
                                    fontSize: '0.68rem',
                                    height: '22px',
                                  }}
                                />
                              )}
                              {isThisQuestionRegenerating && (
                                <Chip
                                  label="⚡ Regenerating..."
                                  size="small"
                                  sx={{
                                    bgcolor: '#e0f2fe',
                                    color: '#0085db',
                                    fontWeight: 800,
                                    fontSize: '0.68rem',
                                    height: '22px',
                                  }}
                                />
                              )}
                              <Chip
                                label={`${q.marks || cfgSec.marksPerQuestion}M`}
                                size="small"
                                sx={{
                                  bgcolor: '#f1f5f9',
                                  color: '#475569',
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                }}
                              />
                              <Tooltip title="Regenerate this specific question with AI">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={isGenerating || Boolean(regeneratingKey)}
                                    onClick={() =>
                                      handleRegenerateSingleQuestion(
                                        section.id || `sec-${sIdx + 1}`,
                                        section.name || cfgSec.name,
                                        q
                                      )
                                    }
                                    sx={{
                                      color: isThisQuestionRegenerating ? '#0085db' : '#64748b',
                                      bgcolor: isThisQuestionRegenerating ? '#e0f2fe' : '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '8px',
                                      p: 0.6,
                                      '&:hover': {
                                        bgcolor: '#e0f2fe',
                                        color: '#0085db',
                                        borderColor: '#bae6fd',
                                      },
                                    }}
                                  >
                                    {isThisQuestionRegenerating ? (
                                      <CircularProgress size={16} thickness={5} sx={{ color: '#0085db' }} />
                                    ) : (
                                      <IconRefresh size={16} />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </Box>

                          {/* TYPE 1: Multiple Choice Questions (MCQ) */}
                          {qType === 'mcq' && q.options && q.options.length > 0 && (
                            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                              {q.options.map((opt, oIdx) => {
                                const optionLetter = String.fromCharCode(65 + oIdx);
                                const isCorrect =
                                  (showAnswers || !isGenerating) &&
                                  showAnswers &&
                                  (q.correctAnswer?.trim().toUpperCase() === optionLetter ||
                                    q.correctAnswer?.trim().toLowerCase() === opt.toLowerCase() ||
                                    opt.startsWith(q.correctAnswer || ''));

                                return (
                                  <Grid key={oIdx} size={{ xs: 12, sm: 6 }}>
                                    <Box
                                      sx={{
                                        p: 1.25,
                                        bgcolor: isCorrect ? '#e0f2fe' : '#f8fafc',
                                        borderRadius: '8px',
                                        border: isCorrect
                                          ? '1.5px solid #0085db'
                                          : '1px solid #e2e8f0',
                                        fontWeight: isCorrect ? 700 : 500,
                                        color: isCorrect ? '#006cb3' : '#1e293b',
                                        fontSize: '0.88rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      <span>{opt}</span>
                                      {isCorrect && (
                                        <Chip
                                          label="Correct Option"
                                          size="small"
                                          sx={{
                                            bgcolor: '#0085db',
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            height: '20px',
                                            fontSize: '0.68rem',
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          )}

                          {/* TYPE 2: True / False Statements */}
                          {qType === 'true_false' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1.5 }}>
                              {['True', 'False'].map((tfOption) => {
                                const isCorrect =
                                  showAnswers &&
                                  q.correctAnswer?.trim().toLowerCase().startsWith(tfOption.toLowerCase());

                                return (
                                  <Box
                                    key={tfOption}
                                    sx={{
                                      px: 3,
                                      py: 1,
                                      borderRadius: '8px',
                                      border: isCorrect ? '2px solid #0085db' : '1px solid #cbd5e1',
                                      bgcolor: isCorrect ? '#e0f2fe' : '#f8fafc',
                                      color: isCorrect ? '#006cb3' : '#334155',
                                      fontWeight: isCorrect ? 800 : 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                    }}
                                  >
                                    <span>{tfOption}</span>
                                    {isCorrect && (
                                      <Chip
                                        label="✓ Correct"
                                        size="small"
                                        sx={{
                                          bgcolor: '#0085db',
                                          color: '#ffffff',
                                          fontWeight: 800,
                                          height: '18px',
                                          fontSize: '0.65rem',
                                        }}
                                      />
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                          )}

                          {/* TYPE 3: Fill in the Blanks */}
                          {qType === 'fill_in_the_blanks' && (
                            <Box
                              sx={{
                                p: 1.5,
                                my: 1,
                                bgcolor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px dashed #94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 1,
                              }}
                            >
                              <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                                Candidate Input: [ ___________________________ ]
                              </Typography>
                              {showAnswers && q.correctAnswer && (
                                <Chip
                                  label={`Blank Key: "${q.correctAnswer}"`}
                                  size="small"
                                  sx={{
                                    bgcolor: '#e0f2fe',
                                    color: '#0085db',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    border: '1px solid #7dd3fc',
                                  }}
                                />
                              )}
                            </Box>
                          )}

                          {/* Reveal Answer Key / Explanation */}
                          {(showAnswers || isCurrentlyStreaming) && (
                            <Box sx={{ mt: 1.5 }}>
                              {showAnswers && qType !== 'mcq' && q.correctAnswer && qType !== 'fill_in_the_blanks' && (
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700, color: '#0085db', mb: 0.5 }}
                                >
                                  Answer Key: {q.correctAnswer}
                                </Typography>
                              )}
                              {(showAnswers || (isCurrentlyStreaming && q.explanation)) && q.explanation && (
                                <Alert
                                  severity="info"
                                  icon={<IconCheck size={18} />}
                                  sx={{
                                    py: 0.75,
                                    borderRadius: '8px',
                                    bgcolor: '#e5f3fb',
                                    color: '#006cb3',
                                    border: '1px solid #cbe6f7',
                                    fontSize: '0.84rem',
                                  }}
                                >
                                  <strong>Concept & Solution:</strong> {q.explanation}
                                </Alert>
                              )}
                            </Box>
                          )}
                        </Paper>
                      );
                    })}

                    {/* Placeholder for pending questions during generation */}
                    {isGenerating &&
                      questionsList.length < cfgSec.totalQuestions && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: '14px',
                            border: '1.5px dashed #cbd5e1',
                            bgcolor: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <CircularProgress size={18} sx={{ color: '#0085db' }} />
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                            Synthesizing Question {questionsList.length + 1} of {cfgSec.totalQuestions}...
                          </Typography>
                        </Paper>
                      )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card>
      )}

      {/* Initial state before generation */}
      {!isDisplayingPaper && (
        <Card
          elevation={0}
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '20px',
            border: '1.5px dashed #cbd5e1',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: '#e5f3fb',
              color: '#0085db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <IconSparkles size={28} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
            Ready to Generate Test Paper with Local AI
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 480, mx: 'auto', mb: 2.5 }}>
            Configure your unit scope, marks, and sections above, then click{' '}
            <strong>&quot;Generate Test Paper with Local AI&quot;</strong>. The examination paper UI
            will build dynamically in front of you in real-time as the AI sends each token.
          </Typography>
          <Button
            variant="contained"
            onClick={handleGenerate}
            startIcon={<IconSparkles size={18} />}
            sx={{
              bgcolor: '#0085db',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 3,
              py: 1,
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            Generate Test with Local AI
          </Button>
        </Card>
      )}
    </Box>
  );
}
