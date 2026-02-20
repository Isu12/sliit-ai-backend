require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Key from .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using gemini-2.5-flash as found via testing script
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Valid Electives List per Specialization
const SPECIALIZATION_ELECTIVES = {
    "IT": [
        "IT4110 - Computer Systems and Network Administration",
        "IT4060 - Machine Learning",
        "IT4100 - Software Quality Assurance",
        "IE4040 - Information Assurance and Security",
        "IT4130 - Image Understanding & Processing"
    ],
    "SE": [
        "IT4130 - Image Understanding & Processing",
        "IT4060 - Machine Learning",
        "SE4020 - Mobile Application Design & Development"
    ],
    "ISE": [
        "IE4040 - Information Assurance and Security",
        "IT4100 - Software Quality Assurance",
        "IE4151 - Human Resource Information Systems"
    ],
    "CSNE": [
        "IE4010 - Information Security Management",
        "IE4080 - Software Defined Networks",
        "IE4040 - Information Assurance and Security"
    ],
    "CS": [
        "IE4012 - Offensive Hacking: Tactical and Strategic",
        "IE4022 - Security Economic Analysis"
    ],
    "IM": [
        "IT4130 - Image Understanding & Processing",
        "IT4060 - Machine Learning",
        "SE4020 - Mobile Application Design & Development"
    ],
    "DS": [
        "IT4021 - Internet of Things and Big Data Analytics",
        "IT4031 - Visual Analytics and User Experience Design",
        "IT4011 - Database Administration and Storage Systems",
        "IT4041 - Introduction to Information Security Analytics"
    ]
};

// Helper to construct the prompt
const constructPrompt = (profile) => {
    const { strong, weak, career, gpa, specialization, credits, gradePoints, language } = profile;

    // Get electives for the specialization; fallback to IT if not found
    const electives = SPECIALIZATION_ELECTIVES[specialization];

    let prompt = `Act as a senior academic advisor for SLIIT IT undergraduate students specifically for their year 4 semester 1.

Your task is to recommend EXACTLY 1 elective based strictly on the student's specialization and academic profile.

IMPORTANT RULES:
1. Only recommend electives from the provided elective list.
2. Do NOT invent new modules.
3. Recommend exactly 1 elective.
4. Provide a COMPREHENSIVE, MULTI-PARAGRAPH (Minimum 3 paragraphs) justification.
   - Paragraph 1: Analyze how the module aligns with their specific strengths.
   - Paragraph 2: Explain how this module bridges the gap in their weaknesses or targets their specific career goal.
   - Paragraph 3: Discuss the academic rigor or relevance of the module to their GPA and specialization.
   - Be incredibly detailed, professional, and persuasive. Aim for at least 150-200 words of reasoning.
5. If Cumulative GPA is below 2.5, avoid mathematically intensive modules.
6. If Cumulative GPA is above 3.0, you may recommend advanced/analytical modules.
7. Consider the student’s strengths and weaknesses carefully.
8. Keep the response structured and professional.
9. Follow the output format exactly.
10. YOU MUST PROVIDE THE ENTIRE REASONING IN ${language.toUpperCase()}.
11. However, keep Module Codes and Module Names (e.g., IT4060 - Machine Learning) in English for technical accuracy.

--------------------------------------------------

Student Academic Profile:

Specialization: ${specialization}
Cumulative Credits: ${credits}
Cumulative Grade Points: ${gradePoints}
Cumulative GPA: ${gpa}

Strong Subjects: ${strong}
Weak Subjects: ${weak}
Career Goal: ${career}

--------------------------------------------------

Available Electives for ${specialization} specialization:

${electives.join('\n')}

--------------------------------------------------

Return the output STRICTLY in this format (Example: "1. IT4030 - Internet of Things"):

1. [Module Code] - [Elective Name]
Reasoning: [Provide a comprehensive, three-paragraph justification here. Do not use bullet points; use full paragraphs.]

Do not include any introduction or conclusion.
Only return the 1 recommendation with its lengthy, detailed reasoning.
`;

    return prompt;
};

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// POST /api/recommend
app.post('/api/recommend', async (req, res) => {
    try {
        const { strong, weak, career, gpa, specialization, credits, gradePoints, language } = req.body;

        if (!strong || !weak || !career || gpa === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const prompt = constructPrompt({ strong, weak, career, gpa, specialization, credits, gradePoints, language: language || 'English' });

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            return res.status(500).json({ error: "Failed to fetch recommendation from AI" });
        }

        const data = await response.json();
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No recommendation generated.";

        res.json({ answer: aiText });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
