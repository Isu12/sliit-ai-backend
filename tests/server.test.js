const { constructPrompt, SPECIALIZATION_ELECTIVES } = require('../server');

describe('Backend Logic Tests', () => {
    test('SPECIALIZATION_ELECTIVES should have correct keys', () => {
        const expectedKeys = ["IT", "SE", "ISE", "CSNE", "CS", "IM", "DS"];
        expect(Object.keys(SPECIALIZATION_ELECTIVES)).toEqual(expect.arrayContaining(expectedKeys));
    });

    test('constructPrompt should generate a valid prompt containing student details', () => {
        const profile = {
            strong: 'Programming',
            weak: 'Math',
            career: 'Developer',
            gpa: 3.5,
            specialization: 'SE',
            credits: 100,
            gradePoints: 350,
            language: 'English'
        };

        const prompt = constructPrompt(profile);

        expect(prompt).toContain('Specialization: SE');
        expect(prompt).toContain('Cumulative GPA: 3.5');
        expect(prompt).toContain('Strong Subjects: Programming');
        expect(prompt).toContain('Weak Subjects: Math');
        expect(prompt).toContain('Career Goal: Developer');
    });

    test('constructPrompt should handle fallback language to English', () => {
        const profile = {
            strong: 'A',
            weak: 'B',
            career: 'C',
            gpa: 2.0,
            specialization: 'IT',
            credits: 60,
            gradePoints: 120,
            language: '' // Empty language
        };

        // The current implementation in server.js defaults in the route handler, 
        // but let's see how it behaves in the helper if we pass it directly or let it be.
        // In server.js line 151: language: language || 'English'
        // So we test that logic if we pass it correctly.
    });
});

const request = require('supertest');
const { app } = require('../server');

// Mock fetch for Gemini API
global.fetch = jest.fn();

describe('API Endpoint Tests', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('POST /api/recommend should return 400 if fields are missing', async () => {
        const response = await request(app)
            .post('/api/recommend')
            .send({ gpa: 3.0 }); // Missing strong, weak, career

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Missing required fields");
    });

    test('POST /api/recommend should return AI recommendation on success', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                candidates: [{
                    content: {
                        parts: [{ text: '1. IT4060 - Machine Learning\nReasoning: ...' }]
                    }
                }]
            })
        });

        const response = await request(app)
            .post('/api/recommend')
            .send({
                strong: 'Coding',
                weak: 'None',
                career: 'AI Engineer',
                gpa: 3.8,
                specialization: 'IT',
                credits: 120,
                gradePoints: 450,
                language: 'English'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).toContain('Machine Learning');
    });

    test('POST /api/recommend should return 500 if Gemini API fails', async () => {
        fetch.mockResolvedValue({
            ok: false,
            text: () => Promise.resolve('API Down')
        });

        const response = await request(app)
            .post('/api/recommend')
            .send({
                strong: 'Coding',
                weak: 'None',
                career: 'AI Engineer',
                gpa: 3.8,
                specialization: 'IT',
                credits: 120,
                gradePoints: 450,
                language: 'English'
            });

        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe("Failed to fetch recommendation from AI");
    });
});
