const pdfCoApiKey = '2236.ishika@gmail.com_2fkiyS4dBYMRZyegK7kR5RpwstQCSEpcSmdmXHF9plsMC3xXjgxQYTkw1cVWSRfT'; // Replace with your PDF.co API key
const openAiApiKey = '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'; // Replace with your OpenAI API key

document.getElementById('convertBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('pdfFile');
    if (!fileInput.files.length) {
        alert('Please upload a PDF file');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Convert PDF to text using PDF.co
    const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
        method: 'POST',
        headers: {
            'x-api-key': pdfCoApiKey
        },
        body: formData
    });

    const result = await response.json();
    const extractedText = result.body; // Extracted text from PDF
    document.getElementById('pdfText').textContent = extractedText;
});

document.getElementById('generateFlashcardsBtn').addEventListener('click', async () => {
    const text = document.getElementById('pdfText').value;
    if (!text) {
        alert('Please extract text from a PDF first');
        return;
    }

    // Generate flashcards using OpenAI API
    const prompt = `Create flashcards in the format of a question followed by an answer from the following text: \n\n${text}\n\nFlashcards:`;

    const data = {
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 500,
        n: 1,
        stop: null,
        temperature: 0.7
    };

    const openAiResponse = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify(data)
    });

    const openAiResult = await openAiResponse.json();
    const flashcardsText = openAiResult.choices[0].text;
    displayFlashcards(flashcardsText);
});

function displayFlashcards(flashcardsText) {
    const flashcardsContainer = document.getElementById('flashcards');
    flashcardsContainer.innerHTML = ''; // Clear previous flashcards

    const flashcards = flashcardsText.split('\n').filter(card => card.trim() !== '');
    flashcards.forEach(card => {
        const flashcardElement = document.createElement('div');
        flashcardElement.classList.add('flashcard');
        flashcardElement.textContent = card;
        flashcardsContainer.appendChild(flashcardElement);
    });
}
