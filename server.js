const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const dbFile = path.join(__dirname, 'messages.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) console.error('Erreur ouverture DB', err.message);
    else console.log('Connecté à la base de données SQLite.');
});

db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send', (req, res) => {
    const { content } = req.body;
    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Le message est vide.' });
    }

    const query = `INSERT INTO messages (content) VALUES (?)`;
    db.run(query, [content], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur.' });
        }
        res.json({ success: true, messageId: this.lastID });
    });
});

app.get('/api/messages', (req, res) => {
    db.all(`SELECT * FROM messages ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur.' });
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
