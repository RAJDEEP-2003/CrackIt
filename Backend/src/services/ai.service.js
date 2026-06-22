const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    atsScore: z.number().describe("A score between 0 and 100 indicating how well the resume keywords match the job description keywords, like an ATS system would calculate"),
    presentKeywords: z.array(z.string()).describe("Important keywords from the job description that ARE present in the resume"),
    missingKeywords: z.array(z.string()).describe("Important keywords from the job description that are NOT present in the resume"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


 const prompt = `Generate an interview report for a candidate with the following details:
    Resume: ${resume}
    Self Description: ${selfDescription}
    Job Description: ${jobDescription}

    Also calculate:
    1. matchScore: How well the candidate's SKILLS and EXPERIENCE match the job requirements (0-100)
    2. atsScore: How well the resume KEYWORDS match the job description keywords, like an ATS system would calculate (0-100). Extract exact technical keywords, tools, frameworks, and skills from the job description and check if they appear in the resume.
    3. presentKeywords: List of important keywords from job description that ARE in the resume
    4. missingKeywords: List of important keywords from job description that are NOT in the resume
`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `You are a professional resume writer. Generate a highly polished, ATS-optimized resume in HTML format for a candidate applying to a specific job.

Candidate Details:
- Resume/Experience: ${resume}
- Self Description: ${selfDescription}
- Target Job Description: ${jobDescription}

STRICT HTML REQUIREMENTS:
1. Use only inline CSS styles - no external stylesheets
2. Use a clean single-column layout for maximum ATS compatibility
3. Font: Arial or Helvetica, 11px body text
4. Use these exact section order: Contact Info, Summary, Skills, Experience, Education, Awards/Publications
5. Section headers must be uppercase, bold, with a bottom border line
6. Use bullet points (•) for experience descriptions
7. Keep to 1-2 pages maximum
8. NO tables, NO columns, NO text boxes - ATS cannot parse these
9. NO images or icons
10. Black text on white background only

HTML STRUCTURE TO FOLLOW:
<html>
<body style="font-family: Arial, sans-serif; font-size: 11px; color: #000; margin: 0; padding: 20px; max-width: 800px;">
  <!-- Name as H1, centered -->
  <!-- Contact info centered on one line -->
  <!-- Horizontal rule -->
  <!-- SUMMARY section -->
  <!-- SKILLS section - comma separated keywords -->
  <!-- EXPERIENCE section - reverse chronological -->
  <!-- EDUCATION section -->
  <!-- AWARDS section if applicable -->
</body>
</html>

CONTENT RULES:
- Tailor every bullet point to match keywords from the job description
- Quantify achievements wherever possible (e.g. "Reduced load time by 40%")
- Use action verbs: Developed, Designed, Led, Implemented, Optimized
- Include relevant technical keywords from the job description in the Skills section
- Do NOT fabricate experience or credentials not present in the original resume
- Write in a natural human tone, not AI-sounding

Return ONLY a JSON object: {"html": "<your complete HTML here>"}`
                    

    const response = await ai.models.generateContent({
        model:  "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

async function evaluateAnswer({ question, userAnswer, jobDescription }) {
    const evaluationSchema = z.object({
        score: z.number().describe("Score between 1 and 10 for the answer"),
        feedback: z.string().describe("Detailed feedback on the answer"),
        strengths: z.array(z.string()).describe("What the candidate did well"),
        improvements: z.array(z.string()).describe("What the candidate should improve"),
        modelAnswer: z.string().describe("An ideal answer for this question")
    })

    const prompt = `You are an expert technical interviewer. Evaluate this interview answer:

Question: ${question}
Candidate's Answer: ${userAnswer}
Job Context: ${jobDescription}

Score the answer from 1-10 and provide constructive feedback.`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(evaluationSchema),
        }
    })

    return JSON.parse(response.text)
}

module.exports = { generateInterviewReport, generateResumePdf, evaluateAnswer }