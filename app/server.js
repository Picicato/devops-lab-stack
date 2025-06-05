const express = require('express');
const path = require('path');
const { Kafka } = require('kafkajs');

const app = express();
const PORT = 3000;

app.use(express.json()); // 👈 pour lire les JSON POST

// Kafka setup
const kafka = new Kafka({
  clientId: 'snake-game',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

(async () => {
  await producer.connect();
})();

// Route API pour recevoir les logs
app.post('/api/log', async (req, res) => {
  const event = req.body;

  console.log('➡️  Event reçu depuis le Snake:', event); // 👈 Ajoute ceci

  await producer.send({
    topic: 'snake-events',
    messages: [
      { value: JSON.stringify(event) },
    ],
  });

  res.sendStatus(200);
});

// Servir le front
app.use(express.static(path.join(__dirname, 'src')));

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
