const VALID_ELECTIVES = [
    "IT4030 - Internet of Things",
    "IT4040 - Database Administration",
    "IT4050 - Innovation Management & Entrepreneurship",
    "IT4060 - Machine Learning",
    "IT4090 - Cloud Computing",
    "IT4100 - Software Quality Assurance",
    "IT4110 - Computer Systems and Network Administration",
    "IT4120 - Knowledge Management",
    "IT4130 - Image Understanding & Processing"
];

const constructPrompt = (profile) => {
    const { strong, weak, career, gpa, specialization, credits, gradePoints } = profile;

    let prompt = `Act as a senior academic advisor for SLIIT IT undergraduate students.

Your task is to recommend EXACTLY 3 electives based strictly on the student's specialization and academic profile.

IMPORTANT RULES:
1. Only recommend electives from the provided elective list.
2. Do NOT invent new modules.
3. Recommend exactly 3 electives.
4. Provide clear reasoning for each recommendation.
5. If Cumulative GPA is below 2.5, avoid mathematically intensive modules.
6. If Cumulative GPA is above 3.0, you may recommend advanced/analytical modules.
7. Consider the student’s strengths and weaknesses carefully.
8. Keep the response structured and professional.
9. Follow the output format exactly.

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

${VALID_ELECTIVES.join('\n')}

--------------------------------------------------

Return the output STRICTLY in this format:

1. [Module Code] - [Elective Name]
Reason:

2. [Module Code] - [Elective Name]
Reason:

3. [Module Code] - [Elective Name]
Reason:

Do not include any introduction or conclusion.
Only return the 3 recommendations.
`;

    return prompt;
};

const profile = {
    strong: "OOP, Java",
    weak: "Math",
    career: "SE",
    gpa: 3.2,
    specialization: "IT",
    credits: 90,
    gradePoints: 300
};

console.log(constructPrompt(profile));
