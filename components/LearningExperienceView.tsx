import React, { useState, useMemo } from "react";
import { Card } from "./common/Card";
import { Button } from "./common/Button";
import { Select } from "./common/Select";
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon";
import type { Translations } from "../types";
import { generateMCQs } from "../services/geminiService";
import { Spinner } from "./common/Spinner";

interface LearningExperienceViewProps {
  onBack: () => void;
  t: Translations;
  stageCode: string;
  stageName?: string;
}

interface MCQ {
  question: string;
  options: string[];
  answer: string;
}

export default function LearningExperienceView({ onBack, t, stageCode, stageName }: LearningExperienceViewProps) {
  // === STATIC DATA ===
  const activities = [
    { id: "intro", title: "تمهيد عن مرحلة البناء", type: "intro", status: "done" },
    { id: "content", title: "مادة علمية: قيادة التغيير", type: "content", status: "in-progress" },
    { id: "task", title: "نشاط تطبيقي: خريطة أصحاب المصلحة", type: "task", status: "not-started" },
    { id: "reflection", title: "انعكاس مهني", type: "reflection", status: "not-started" },
    { id: "assessment", title: "تقييم قصير", type: "assessment", status: "not-started" },
    { id: "upload", title: "رفع المخرجات", type: "upload", status: "not-started" },
  ];

  const [selected, setSelected] = useState(activities[1]);
  const [comments, setComments] = useState<any[]>([]);
  const [role, setRole] = useState("");
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);

  // === NEW STATE FOR MCQs ===
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [isGeneratingMcqs, setIsGeneratingMcqs] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, 'correct' | 'incorrect' | null>>({});

  // === COMPUTED METRICS ===
  const total = activities.length;
  const done = activities.filter((a) => a.status === "done").length;
  const progress = useMemo(() => Math.round((done / total) * 100), [done, total]);
  const commentCount = comments.length;

  // === HANDLERS ===
  const handleSelect = (item: any) => setSelected(item);
  const handleSubmit = () => {
    if (!note.trim()) return;
    const newComment = {
      id: Date.now(),
      role,
      mood,
      text: note,
      time: new Date().toLocaleString("ar-SA"),
    };
    setComments([newComment, ...comments]);
    setNote("");
    setMood("");
    setRole("");
  };

  // === NEW HANDLERS FOR MCQs ===
  const handleGenerateMcqs = async () => {
    setIsGeneratingMcqs(true);
    setMcqs([]); // Clear previous questions
    setUserAnswers({});
    setFeedback({});
    try {
      const generatedQuestions = await generateMCQs("قيادة التغيير", "ar");
      setMcqs(generatedQuestions);
    } catch (error) {
      console.error("Failed to generate questions:", error);
    } finally {
      setIsGeneratingMcqs(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setFeedback(prev => ({ ...prev, [questionIndex]: null }));
  };

  const checkAnswer = (questionIndex: number) => {
    const correctAnswer = mcqs[questionIndex].answer;
    const userAnswer = userAnswers[questionIndex];
    if (userAnswer === correctAnswer) {
      setFeedback(prev => ({ ...prev, [questionIndex]: 'correct' }));
    } else {
      setFeedback(prev => ({ ...prev, [questionIndex]: 'incorrect' }));
    }
  };


  // === STYLES ===
  const statusIcon: {[key: string]: string} = {
    done: "✅",
    "in-progress": "⏳",
    "not-started": "•",
  };

   const roleOptions = [
    { value: "", label: "أُعلّق بصفتي..." },
    { value: "مرشح", label: "مرشح" },
    { value: "مستشار", label: "مستشار" },
    { value: "مسؤول مؤسسة", label: "مسؤول مؤسسة" },
  ];

  // === COMPONENT RENDER ===
  return (
    <div className="flex flex-col gap-4 bg-gray-900 text-white min-h-screen animate-fade-in-up">
      <div className="p-6 pb-0">
        <Button onClick={onBack} variant="secondary">
          <ArrowLeftIcon />
          {t.backToTimeline}
        </Button>
      </div>
      <div className="flex flex-row gap-4 p-6 pt-2 flex-grow">
        {/* === SIDEBAR === */}
        <div className="w-72 flex flex-col bg-gray-800 rounded-2xl p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-center">أنشطة الوحدة</h2>
          {activities.map((a) => (
            <div
              key={a.id}
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer mb-2 transition ${
                selected.id === a.id ? "bg-gray-700" : "bg-transparent hover:bg-gray-700/50"
              }`}
              onClick={() => handleSelect(a)}
            >
              <span>{a.title}</span>
              <span>{statusIcon[a.status]}</span>
            </div>
          ))}
        </div>

        {/* === MAIN CONTENT === */}
        <div className="flex-1 flex flex-col gap-4">
          {/* === HEADER === */}
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold mb-1">{selected.title}</h1>
              <span className="text-sm bg-gray-700 px-3 py-1 rounded-full">
                تابع لمرحلة: {stageName || stageCode}
              </span>
            </div>

            {/* === METRICS BADGES === */}
            <div className="flex gap-3 text-sm">
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full">
                <span>📈</span>
                <span>التقدّم: {progress}%</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full">
                <span>💬</span>
                <span>التعليقات: {commentCount}</span>
              </div>
            </div>
          </div>

          {/* CONTENT AREA */}
          <Card>
              {selected.type === "content" && (
                <div className="flex flex-col gap-4">
                  <div className="p-6 bg-gray-700/50 rounded-lg text-center">
                    منطقة عرض المادة (Placeholder)
                  </div>
                  
                  {/* === NEW MCQ GENERATION SECTION === */}
                  <div className="pt-4 border-t border-gray-700">
                    <Button 
                      onClick={handleGenerateMcqs} 
                      disabled={isGeneratingMcqs}
                      className="w-full sm:w-auto"
                    >
                      {isGeneratingMcqs && <Spinner />}
                      {isGeneratingMcqs ? 'جاري توليد الأسئلة...' : '✨ توليد أسئلة اختيار من متعدد'}
                    </Button>

                    {mcqs.length > 0 && (
                      <div className="mt-6 space-y-6">
                        {mcqs.map((mcq, index) => (
                          <div key={index} className="p-4 bg-gray-900/50 rounded-lg">
                            <p className="font-semibold text-gray-200 mb-3">{index + 1}. {mcq.question}</p>
                            <div className="space-y-2">
                              {mcq.options.map((option, optionIndex) => (
                                <label key={optionIndex} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name={`question-${index}`} 
                                    value={option}
                                    checked={userAnswers[index] === option}
                                    onChange={() => handleAnswerSelect(index, option)}
                                    className="h-4 w-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                            <div className="mt-4 flex items-center gap-4">
                               <Button 
                                  onClick={() => checkAnswer(index)} 
                                  variant="secondary" 
                                  size="sm"
                                  disabled={!userAnswers[index]}
                                >
                                  تحقق من الإجابة
                                </Button>
                                {feedback[index] === 'correct' && <p className="text-sm font-semibold text-green-500">إجابة صحيحة!</p>}
                                {feedback[index] === 'incorrect' && <p className="text-sm font-semibold text-red-500">إجابة خاطئة، حاول مرة أخرى.</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selected.type === "task" && (
                <div className="flex flex-col gap-4">
                  <p>نفّذ النشاط التالي: ارسم خريطة لأصحاب المصلحة في مشروعك القيادي.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">إرسال المهمة</Button>
                </div>
              )}

              {selected.type === "reflection" && (
                <div className="flex flex-col gap-4">
                  <p>اكتب انعكاسك حول ما تعلمته في هذه المرحلة:</p>
                  <textarea
                    className="bg-gray-900 rounded-lg p-3 min-h-[120px] border border-gray-700 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="أفكاري حول هذه التجربة..."
                  />
                </div>
              )}

              {selected.type === "upload" && (
                <div className="flex flex-col gap-4 items-start">
                  <input type="file" className="text-sm text-gray-300 file:me-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600 cursor-pointer" />
                  <Button className="bg-green-600 hover:bg-green-700">رفع المخرج</Button>
                </div>
              )}

              {selected.type === "assessment" && (
                <div className="flex flex-col gap-4">
                  <p>تقييم سريع:</p>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="radio" name="q" id={`q${i}`} className="h-4 w-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500" />
                      <label htmlFor={`q${i}`}>سؤال {i}</label>
                    </div>
                  ))}
                </div>
              )}
               {selected.type === 'intro' && (
                  <div className="text-center">
                      <h3 className="text-xl font-bold text-primary-400">مقدمة عن مرحلة البناء والتطوير</h3>
                      <p className="mt-4 text-gray-300">في هذه المرحلة، ستركز على تطوير الكفاءات القيادية الأساسية من خلال مجموعة من الأنشطة التفاعلية والمهام التطبيقية. استعد لرحلة تعلم مكثفة ستساهم في صقل مهاراتك وتجهيزك للمسؤوليات القادمة.</p>
                  </div>
              )}
          </Card>

          {/* === INTERACTION === */}
          <Card>
              <h2 className="text-lg font-semibold mb-4">التفاعل على هذا النشاط</h2>

              <textarea
                className="bg-gray-900 rounded-lg p-3 min-h-[100px] w-full border border-gray-700 focus:ring-primary-500 focus:border-primary-500"
                placeholder="أكتب ملاحظاتك..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <div className="flex flex-wrap gap-4 items-center mt-3">
                <div className="w-48">
                   <Select
                      options={roleOptions}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  {["😀", "🙂", "😐", "😕", "☹️"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`text-2xl transition-all ${mood === m ? "opacity-100 scale-125" : "opacity-50 hover:opacity-100"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 ms-auto" onClick={handleSubmit}>
                  إرسال
                </Button>
              </div>

              {/* COMMENTS LIST */}
              <div className="flex flex-col gap-2 mt-4 max-h-60 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>{c.role || "مشارك"}</span>
                      <span>{c.time}</span>
                    </div>
                    <p className="text-gray-200">{c.text}</p>
                    <span className="text-lg">{c.mood}</span>
                  </div>
                ))}
              </div>
          </Card>

          {/* === QUICK RATING === */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm">قيّم فائدة هذا النشاط:</span>
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setRating(r)}
                className={`w-8 h-8 rounded-full border transition-colors ${
                  rating >= r ? "bg-blue-600 border-blue-500" : "bg-transparent border-gray-600 hover:bg-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}