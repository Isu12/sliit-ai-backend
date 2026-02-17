const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyA7Fo2GT4AIbYC64BsEZMGjQCmTnukR5MA";
const model = "models/gemini-2.0-flash-lite-001";
const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${API_KEY}`;

(async () => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Body: ${text.substring(0, 200)}`);
    } catch (e) {
        console.error(e);
    }
})();
