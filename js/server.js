// Importiere benötigte Pakete
const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || "geheime-schluessel";

// Middleware für CORS und JSON-Parsing
app.use(cors());
app.use(bodyParser.json());

// Middleware zur Überprüfung des JWT-Tokens
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Kein Token vorhanden" });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Token ungültig" });
        }
        req.user = decoded; // Userdaten aus dem Token an die Anfrage anhängen
        next();
    });
};

// ----------- User Endpoints -----------

// Benutzer registrieren
app.post('/users', async (req, res) => {
    const { UserName, Email, Password, ProfilePicture } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(Password, 10); // Passwort hashen
        const user = await prisma.user.create({
            data: {
                UserName,
                Email,
                Password: hashedPassword,
                ProfilePicture,
            },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Alle Benutzer abrufen (außer sich selbst, geschützt)
app.get('/users', verifyToken, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                NOT: { id: req.user.id } // Eigenen User ausschließen
            },
            select: {
                id: true,
                UserName: true,
                Email: true,
                ProfilePicture: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json([]);
    }
});

// ----------- User-Suche -----------

// Benutzer nach Name suchen (geschützt)
app.get('/searchUsers', verifyToken, async (req, res) => {
    const query = req.query.q;
    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Suchbegriff fehlt" });
    }
    try {
        const users = await prisma.user.findMany({
            where: {
                UserName: {
                    contains: query,
                },
            },
            select: {
                id: true,
                UserName: true,
                ProfilePicture: true,
            },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Fehler bei der Benutzersuche" });
    }
});

// Eigene Userdaten abrufen (geschützt)
app.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, UserName: true, ProfilePicture: true }
        });
        if (!user) {
            return res.status(404).json({ error: "Benutzer nicht gefunden." });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ----------- Follower Endpoints -----------

// Einem Benutzer folgen (geschützt)
app.post('/follow', verifyToken, async (req, res) => {
    const { followUserId } = req.body;
    const userId = req.user.id;
    if (userId === followUserId) {
        return res.status(400).json({ error: "Du kannst dir nicht selbst folgen." });
    }
    try {
        const existingFollow = await prisma.follower.findFirst({
            where: {
                followerId: userId,
                followingId: followUserId
            }
        });
        if (existingFollow) {
            return res.status(400).json({ error: "Du folgst diesem Benutzer bereits." });
        }
        await prisma.follower.create({
            data: {
                followerId: userId,
                followingId: followUserId
            }
        });
        res.json({ message: "Erfolgreich gefolgt!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Liste der gefolgten Benutzer abrufen (geschützt)
app.get('/following', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const following = await prisma.follower.findMany({
            where: { followerId: userId },
            select: { followingId: true }
        });
        res.json(following);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ----------- Login & Auth -----------

// Benutzer-Login, gibt JWT zurück
app.post('/login', async (req, res) => {
    const { UserName, Password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { UserName },
        });
        if (!user) {
            return res.status(401).json({ error: 'Benutzername ungültig.' });
        }
        const isValidPassword = await bcrypt.compare(Password, user.Password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Passwort ungültig.' });
        }
        // JWT erstellen
        const token = jwt.sign({ id: user.id, username: user.UserName }, SECRET_KEY, { expiresIn: "1h" });
        res.status(200).json({ message: 'Anmeldung erfolgreich!', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test-Route für geschützten Zugriff
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: "Zugriff gewährt!", user: req.user });
});

// ----------- Serverstart -----------

// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
