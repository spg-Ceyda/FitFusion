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

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --------------------------
// Middleware zur Token-Verifizierung
// --------------------------
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Kein Token vorhanden" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Token ungültig" });
        }
        req.user = decoded; // Den User zur Anfrage hinzufügen
        next();
    });
};

// --------------------------
// User Endpoints
// --------------------------

// 1. Benutzer erstellen
app.post('/users', async (req, res) => {
    const { UserName, Email, Password, ProfilePicture } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(Password, 10);

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

// 2. Alle Benutzer abrufen (geschützt)
app.get('/users', verifyToken, async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------------
// WorkoutPost Endpoints
// --------------------------
app.post('/workoutPosts', verifyToken, async (req, res) => {
    const { title, description, image, userId } = req.body;

    try {
        const workoutPost = await prisma.workoutPost.create({
            data: {
                title,
                description,
                image,
                user: {
                    connect: { id: userId },
                },
            },
        });
        res.status(201).json(workoutPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/workoutPosts', async (req, res) => {
    try {
        const workoutPosts = await prisma.workoutPost.findMany({
            include: { user: true },
        });
        res.json(workoutPosts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------------
// Workout Endpoints
// --------------------------
app.post('/workouts', verifyToken, async (req, res) => {
    const { name, userId } = req.body;

    try {
        const workout = await prisma.workout.create({
            data: {
                name,
                user: {
                    connect: { id: userId },
                },
            },
        });
        res.status(201).json(workout);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/workouts/:userId', verifyToken, async (req, res) => {
    const userId = req.params.userId;

    try {
        const workouts = await prisma.workout.findMany({
            where: { userId },
            include: { exercises: true },
        });
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------------
// Exercise Endpoints
// --------------------------
app.post('/exercises', verifyToken, async (req, res) => {
    const { name, description, sets, reps, weight, workoutId } = req.body;

    try {
        const exercise = await prisma.exercise.create({
            data: {
                name,
                description,
                sets,
                reps,
                weight,
                workouts: {
                    connect: { id: workoutId },
                },
            },
        });
        res.status(201).json(exercise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/exercises/:workoutId', verifyToken, async (req, res) => {
    const workoutId = req.params.workoutId;

    try {
        const exercises = await prisma.exercise.findMany({
            where: { workoutId },
        });
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------------
// UserSearch Endpoints
// --------------------------
app.get('/searchUsers', verifyToken, async (req, res) => {
    const searchQuery = req.query.q || ""; // Suchparameter
    const userId = req.user.id; // Aktuell eingeloggter Benutzer

    try {
        const users = await prisma.user.findMany({
            where: {
                id: { notIn: [userId] }, // Hier wurde `not` zu `notIn` geändert!
                UserName: { contains: searchQuery, mode: "insensitive" }
            },
            select: { id: true, UserName: true, ProfilePicture: true }
        });


        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------------
// Follower Endpoints
// --------------------------

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


// --------------------------
// Benutzeranmeldung mit JWT
// --------------------------
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

        // Token erstellen
        const token = jwt.sign({ id: user.id, username: user.UserName }, SECRET_KEY, { expiresIn: "1h" });

        res.status(200).json({ message: 'Anmeldung erfolgreich!', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------------
// Geschützte Route testen
// --------------------------
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: "Zugriff gewährt!", user: req.user });
});

// --------------------------
// Server starten
// --------------------------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
