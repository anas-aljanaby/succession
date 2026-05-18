import { GoogleGenAI, Type } from "@google/genai";
import type { Language, Organization, ReflectionLog, ChatMessage, User, UserRole, BehavioralIndicators } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateSuccessionPlan = async (
  role: string,
  competencies: string,
  candidate: string,
  language: Language,
  organization: Organization
): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve("AI functionality is disabled. Please configure your API key.");
    }
  
  const langDetectionInstruction = "Analyze the language of the **Input Details** (which will be in either English or Arabic). Your entire response, including all text and markdown formatting, MUST be in the detected language. For example, if the input is primarily Arabic, respond entirely in Arabic. If the input is primarily English, respond entirely in English.";

  const stagesInstruction = `Structure your response by using the following stage names as Markdown H2 (##) headings, in this exact order: ${organization.stages.map(s => `"${s.name}"`).join(', ')}. Under each heading, list the actionable development goals as bullet points. Each bullet point will be parsed as a milestone for that stage.`;

  const systemInstructionEN = "You are a Succession-Planning AI for multi-tenant organizations, managed by a consulting house. Your purpose is to design, run, and monitor leadership succession journeys. Support Arabic.";
  const systemInstructionAR = "أنت ذكاء اصطناعي لتخطيط التعاقب الوظيفي، مخصص للمؤسسات متعددة المستأجرين وتديرك شركة استشارية. هدفك هو تصميم وتشغيل ومراقبة رحلات التعاقب القيادي. تدعم اللغة العربية.";


  const prompt = `
    **Role:** Succession Planning AI Consultant

    **Task:** Generate a comprehensive and actionable 12-month succession development plan in Markdown format.

    **Organizational Context:**
    - **Sector:** ${organization.sector}
    - **Maturity Level:** ${organization.maturity_level}
    - This context should influence the tone and strategic focus of the plan. For example, a plan for an 'Emerging' organization might focus more on foundational leadership skills, while an 'Advanced' one might focus on global strategy and innovation.

    **System Instructions:**
    - ${language === 'ar' ? systemInstructionAR : systemInstructionEN}
    - ${langDetectionInstruction}

    **Input Details:**
    - **Target Role:** ${role}
    - **Key Competencies Required:** ${competencies}
    - **Potential Successor:** ${candidate}

    **Output Requirements:**
    - Create a structured 12-month plan.
    - ${stagesInstruction}
    - For each stage, list 2-3 specific, measurable, and actionable development goals or projects.
    - Include a mix of on-the-job training, mentorship opportunities, and formal learning.
    - The tone should be professional, strategic, and encouraging.
    - Do not use a main heading for the plan, start directly with the first stage H2 heading.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Error generating succession plan:", error);
    return language === 'ar' 
      ? "حدث خطأ أثناء إنشاء الخطة. يرجى المحاولة مرة أخرى."
      : "An error occurred while generating the plan. Please try again.";
  }
};


export const summarizeReflections = async (
  notes: string[],
  stageName: string,
  language: Language
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI functionality is disabled. Please configure your API key.");
  }

  const prompt = `
    **Role:** AI Analyst for Succession Planning

    **Task:** Analyze a collection of reflection notes from a specific stage of a succession journey. Summarize the recurring themes, key concerns, and overall sentiment.

    **Context:**
    - **Journey Stage:** ${stageName}
    - The notes are from various stakeholders (e.g., HR, managers, candidates) involved in this stage.

    **Input Notes:**
    ${notes.map(note => `- "${note}"`).join('\n')}

    **Output Requirements:**
    - Your entire response MUST be in ${language === 'ar' ? 'Arabic' : 'English'}.
    - Provide a concise summary (2-4 sentences).
    - Identify 2-3 main recurring themes or topics mentioned in the notes as bullet points.
    - Do not repeat the notes verbatim. Synthesize the information.
    - Use Markdown for formatting (e.g., bullet points for themes).
    - Start the response directly with the summary, no preamble.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing reflections:", error);
    return language === 'ar' 
      ? "حدث خطأ أثناء تلخيص التأملات. يرجى المحاولة مرة أخرى."
      : "An error occurred while summarizing reflections. Please try again.";
  }
};

export const getChatbotResponse = async (
  history: ChatMessage[],
  user: User,
  activeRole: UserRole | null,
  organization: Organization | undefined,
  language: Language
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI functionality is disabled. Please configure your API key.");
  }
  
  const formattedHistory = history.map(m => `${m.sender === 'user' ? 'User' : 'Advisor'}: ${m.text}`).join('\n');

  const prompt = `
    **Persona:** You are "Mustafa Al-Mosul", an expert AI succession planning advisor. Your tone is professional, insightful, and helpful.

    **User Context:**
    - **Name:** ${user.name}
    - **Current Role:** ${activeRole}
    - **Current Organization View:** ${organization?.name || 'Global View'}

    **System Instructions:**
    - Your entire response MUST be in ${language === 'ar' ? 'Arabic' : 'English'}.
    - Keep your answers concise and to the point.
    - Use the provided chat history to understand the flow of the conversation.
    - Base your answers on the user's context. For example, if they ask about "the organization", refer to "${organization?.name}".
    - Do not break character. You are Mustafa Al-Mosul.

    **Chat History:**
    ${formattedHistory}

    **New User Question:**
    ${history[history.length - 1].text}

    **Your Response (as Mustafa Al-Mosul):**
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    return language === 'ar' 
      ? "عذراً، لقد واجهت خطأ. يرجى المحاولة مرة أخرى."
      : "Sorry, I encountered an error. Please try again.";
  }
};

export const generateOrgLevelInsightSummary = async (
  notes: string[],
  orgName: string,
  language: Language
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI functionality is disabled.");
  }

  const prompt = `
    **Role:** AI Organizational Analyst for a consulting house.

    **Task:** Analyze the following reflection logs from the past 24 hours for the organization "${orgName}". Synthesize them into a single, concise insight.

    **Input Reflection Logs:**
    ${notes.map(note => `- "${note}"`).join('\n')}

    **Output Requirements:**
    - Your entire response MUST be in ${language === 'ar' ? 'Arabic' : 'English'}.
    - The output MUST be a single, concise string (max 40 words).
    - Identify the top 1-2 patterns or themes.
    - Determine the overall tone (e.g., positive, concerned, mixed).
    - Provide one actionable recommendation based on the patterns.
    - Example Format (English): "Positive tone in development stages; collaboration is a key pattern. Recommendation: Assign more team-based projects."
    - Example Format (Arabic): "نبرة إيجابية في مراحل التطوير؛ التعاون هو نمط رئيسي. توصية: قم بتعيين المزيد من المشاريع القائمة على الفريق."
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Error generating daily summary:", error);
    return language === 'ar' 
      ? "خطأ في إنشاء الملخص اليومي."
      : "Error generating daily summary.";
  }
};

export const generateGapAnalysis = async (
  expected: string,
  actual: string,
  language: Language
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI functionality is disabled.");
  }

  const prompt = `
    **Role:** AI Succession Planning Analyst.
    **Task:** Analyze the gap between expected and actual results for a succession plan stage.
    **System Instructions:** Your entire response MUST be in ${language === 'ar' ? 'Arabic' : 'English'}.

    **Input Data:**
    - **Expected Results:** "${expected}"
    - **Actual Results:** "${actual}"

    **Output Requirements:**
    - Provide a concise (3-5 sentences) analysis of the gap.
    - Identify key areas of alignment and divergence.
    - Suggest one potential reason for any significant gaps.
    - The tone should be objective and analytical.
    - Start the response directly with the analysis, no preamble.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Error generating gap analysis:", error);
    return language === 'ar' 
      ? "حدث خطأ أثناء توليد تحليل الفجوة."
      : "Error generating gap analysis.";
  }
};

export const generateBehavioralInsight = async (
  indicators: BehavioralIndicators,
  logs: ReflectionLog[],
  candidateName: string,
  language: Language
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI functionality is disabled.");
  }

  const formattedIndicators = Object.entries(indicators)
    .map(([key, value]) => `- ${key}: ${value}/100`)
    .join('\n');
  
  const formattedLogs = logs.slice(0, 5).map(log => `- (${log.sentiment}): "${log.note}"`).join('\n');

  const prompt = `
    **Role:** AI Leadership Coach.
    **Task:** Analyze behavioral data and reflection logs for a leadership candidate to provide an actionable insight.

    **Candidate Name:** ${candidateName}

    **Input Data:**
    1.  **Behavioral Indicator Scores (out of 100):**
        ${formattedIndicators}
    2.  **Recent Reflection Logs:**
        ${formattedLogs || "No recent logs."}

    **Output Requirements:**
    - Your entire response MUST be in ${language === 'ar' ? 'Arabic' : 'English'}.
    - The response should be concise (3-4 sentences).
    - **Part 1: Synthesis:** Synthesize the quantitative scores with the qualitative log data. Identify one key strength and one primary area for development.
    - **Part 2: Actionable Recommendation:** Provide one concrete, actionable recommendation for the candidate to focus on.
    - The tone should be constructive, insightful, and encouraging.
    - Start the response directly with the analysis, no preamble.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Error generating behavioral insight:", error);
    return language === 'ar' 
      ? "حدث خطأ أثناء توليد الرؤى السلوكية."
      : "Error generating behavioral insight.";
  }
};


interface MCQ {
  question: string;
  options: string[];
  answer: string;
}

export const generateMCQs = async (
  topic: string,
  language: Language
): Promise<MCQ[]> => {
  if (!API_KEY) {
    console.warn("API key not configured, MCQ generation is disabled.");
    return Promise.resolve([]);
  }

  const prompt = language === 'ar'
    ? `أنشئ 3 أسئلة اختيار من متعدد حول موضوع "${topic}". يجب أن يكون لكل سؤال 4 خيارات وإجابة واحدة صحيحة. يجب أن تكون الإجابة الصحيحة واحدة من الخيارات.`
    : `Generate 3 multiple-choice questions about the topic "${topic}". Each question should have 4 options and one correct answer. The correct answer must be one of the options.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING }
            },
            required: ['question', 'options', 'answer']
          }
        },
      },
    });

    const jsonText = response.text.trim();
    const mcqs = JSON.parse(jsonText);
    return mcqs;

  } catch (error) {
    console.error("Error generating MCQs:", error);
    return [];
  }
};

export const generateNextStageRecommendations = async (
  candidateName: string,
  currentStageName: string,
  nextStageName: string,
  lessonsLearned: string,
  language: Language
): Promise<string[]> => {
  if (!API_KEY) {
    return Promise.resolve(language === 'ar'
      ? ["تم تعطيل وظائف الذكاء الاصطناعي."]
      : ["AI functionality is disabled."]);
  }

  const prompt = `
    **Role:** AI Leadership Coach & Succession Planner.
    **Task:** Generate 2-3 actionable recommendations for a leadership candidate transitioning to their next development stage.

    **Context:**
    - **Candidate:** ${candidateName}
    - **Completed Stage:** "${currentStageName}"
    - **Next Stage:** "${nextStageName}"
    - **Candidate's Reflections (Lessons Learned) from Completed Stage:** "${lessonsLearned || 'No specific lessons were recorded.'}"

    **Output Requirements:**
    - Your entire response MUST be in ${language === 'ar' ? 'Arabic' : 'English'}.
    - Analyze the lessons learned to inform your recommendations.
    - Create 2-3 concise, forward-looking recommendations as bullet points.
    - The recommendations should guide the candidate on what to focus on in the *next stage*.
    - The tone should be constructive and encouraging.
    - **Format:** Respond ONLY with a JSON array of strings. Example: ["First recommendation.", "Second recommendation."]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    const jsonText = response.text.trim();
    const recommendations = JSON.parse(jsonText);
    return recommendations;

  } catch (error) {
    console.error("Error generating next stage recommendations:", error);
    return language === 'ar'
      ? ["حدث خطأ أثناء توليد التوصيات."]
      : ["An error occurred while generating recommendations."];
  }
};