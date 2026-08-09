const { GoogleGenAI } = require("@google/genai")
const { Type } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.NUMBER,
    },
    technicalQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          severity: {
            type: Type.STRING,
            enum: ["low", "medium", "high"],
          },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          focus: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
    title: { type: Type.STRING }
  },
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};



async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

  const prompt = `
You are an experienced Senior Software Engineer and Technical Hiring Manager.

Your task is to generate a comprehensive interview preparation report for the candidate.

Analyze the candidate's resume, self-description, and the job description carefully before generating the report.

The output MUST strictly follow the provided JSON schema.

===========================
FIELD DESCRIPTIONS
===========================

1. matchScore
- A number between 0 and 100.
- Represents how well the candidate matches the job description.
- Consider:
    • Technical skills
    • Projects
    • Work experience
    • Education
    • Communication skills
    • Missing technologies
    • Overall job fit

2. technicalQuestions
Generate 5-10 realistic technical interview questions.

For each question:

question
- A realistic technical interview question that an interviewer is likely to ask.
- Questions should be directly related to the job description and the candidate's experience.

intention
- Explain WHY the interviewer is asking this question.
- Mention the exact skill being evaluated.
- Example:
    "To evaluate the candidate's understanding of REST API design and scalability."

answer
- Explain how the candidate should answer.
- Include:
    • important concepts
    • expected depth
    • practical examples
    • best practices
    • common mistakes to avoid

The answer should help the candidate prepare for the interview rather than simply giving a one-line solution.

------------------------------------------------

3. behavioralQuestions

Generate 5 realistic behavioral interview questions.

For each question:

question
- A realistic HR or behavioral interview question.

intention
- Explain what personality trait or soft skill the interviewer is trying to evaluate.

Examples:
- Leadership
- Ownership
- Teamwork
- Conflict Resolution
- Communication
- Adaptability
- Problem Solving

answer
- Explain how the candidate should answer.
- Encourage STAR Method whenever appropriate.
- Mention:
    Situation
    Task
    Action
    Result

Also mention what interviewers usually expect.

------------------------------------------------

4. skillGaps

Identify genuine weaknesses in the candidate's profile.

Do NOT invent fake weaknesses.

Each skill gap should contain:

skill
- The missing or weak skill.

severity
One of:
- low
- medium
- high

Severity should indicate how much this missing skill affects the candidate's chances for this specific job.

Examples:
- Docker
- Kubernetes
- Redis
- System Design
- AWS
- CI/CD
- Testing

------------------------------------------------

5. preparationPlan

Generate a preparation plan for the next 7 days.

Each day must contain:

day
- Day number starting from 1.

focus
- Main topic to study that day.

Examples:
- Data Structures
- Node.js
- MongoDB
- Authentication
- System Design
- Mock Interview
- HR Preparation

tasks
Generate at least 4 practical tasks.

Each task should be actionable.

Good examples:

- Solve 5 Medium LeetCode questions on Trees.
- Build a JWT Authentication API.
- Read MongoDB Aggregation documentation.
- Watch one System Design interview.
- Practice explaining your FeastPaaji project.
- Revise Express Middleware.
- Conduct one mock interview.

Avoid vague tasks like:
- Study Node.js
- Practice coding

------------------------------------------------

 6. title

 the title of the job for which interview is generated

------------------------------------------------

GENERAL INSTRUCTIONS

- Tailor every section specifically to the candidate.
- Use the resume, self-description and job description.
- Never generate generic interview questions.
- Mention technologies present in the resume whenever possible.
- If the candidate lacks an important technology from the job description, mention it in skill gaps.
- Be specific.
- Be practical.
- Be detailed.
- Do not leave any array empty.
- Every generated field should provide value.
- Every answer should be complete and interview-ready.

===========================
Candidate Resume
===========================

${resume}

===========================
Self Description
===========================

${selfDescription}

===========================
Job Description
===========================

${jobDescription}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    return JSON.parse(response.text);


  } catch (err) {
    console.error(err);
  }
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" })

  const pdfBuffer = await page.pdf({ format: "A4" })
  await browser.close()
  return pdfBuffer
}

const resumePdfResponseSchema = {
  type: Type.OBJECT,
  properties: {
    html: {
      type: Type.STRING,
    },
  },
  required: ["html"],
};

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

  const prompt = `Generate a resume for a candidate with the below details.
                  Resume:${resume}
                  Self Description:${selfDescription}
                  Job Description:${jobDescription}

                  the response should be single field "html" which contains the html content of the resume which can be converted to pdf using any library like puppeteer
                  The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                  The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                  you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                  The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                  The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumePdfResponseSchema,
    },
  });

  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);
  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf, generatePdfFromHtml }