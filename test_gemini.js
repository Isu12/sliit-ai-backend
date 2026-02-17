const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyA7Fo2GT4AIbYC64BsEZMGjQCmTnukR5MA";

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash-lite-preview-02-05",
    "models/gemini-2.0-flash-lite-001" // Trying full name as seen in list
];

async function testModel(model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.replace('models/', '')}:generateContent?key=${API_KEY}`;
    // Handle models that might already have 'models/' prefix logic in my code
    // Actually the API expects `models/ID`. If ID already has it, fine.
    // Normalized URL:
    const normalizedModel = model.startsWith('models/') ? model : `models/${model}`;
    const fullUrl = `https://generativelanguage.googleapis.com/v1beta/${normalizedModel}:generateContent?key=${API_KEY}`;

    console.log(`Testing ${normalizedModel}...`);
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });

        if (response.ok) {
            console.log(`SUCCESS: ${model}`);
            return true;
        } else {
            console.log(`FAILED: ${model} - Status: ${response.status} - ${(await response.text()).substring(0, 100)}`);
        }
    } catch (e) {
        console.log(`ERROR: ${model} - ${e.message}`);
    }
    return false;
}

(async () => {
    for (const model of models) {
        if (await testModel(model)) break;
    }
})();
