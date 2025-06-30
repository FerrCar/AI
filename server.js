require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (/^come stai\?$/i.test(userMessage)) {
    return res.json({ reply: 'Bene, grazie! E tu come stai?' });
  }

  try {
    console.log('Chiave usata:', process.env.OPENROUTER_API_KEY);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Chatbot IA Locale'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: "system",
            content: "Sei un assistente che risponde solo in italiano. Non usare inglese.Sei un assistente esperto in educazione civica. Rispondi solo a domande che riguardano educazione civica. Se una domanda non riguarda questo ambito, rispondi sempre con: 'non è mia competenza rispondere a questa domanda!'"
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore OpenRouter:', data);
      return res.status(500).json({ error: data.error?.message || 'Errore dal modello AI.' });
    }

    const botReply = data.choices?.[0]?.message?.content || "Nessuna risposta 😕";
    res.json({ reply: botReply });

  } catch (err) {
    console.error('Errore di rete:', err);
    res.status(500).json({ error: 'Errore di rete o server.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server attivo su http://localhost:${PORT}`));
