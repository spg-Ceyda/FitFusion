// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors'); // Füge dies hinzu
const bcrypt = require('bcrypt'); // Importiere bcrypt für Passwort-Hashing

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;


// Middleware
app.use(cors()); // Aktiviere CORS
app.use(bodyParser.json());

// --------------------------
// User Endpoints
// --------------------------

// 1. Benutzer erstellen
app.post('/users', async (req, res) => {
    const { UserName, Email, Password, ProfilePicture } = req.body;

    try {


        const hashedPassword = await bcrypt.hash(Password, 10); // Passwort hashen

        const user = await prisma.user.create({
            data: {
                UserName,
                Email,
                Password: hashedPassword, // Gehashtes Passwort speichern
                ProfilePicture,
            },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Alle Benutzer abrufen
app.get('/users', async (req, res) => {
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

// 3. WorkoutPost erstellen
app.post('/workoutPosts', async (req, res) => {
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

// 4. Alle WorkoutPosts abrufen
app.get('/workoutPosts', async (req, res) => {
    try {
        const workoutPosts = await prisma.workoutPost.findMany({
            include: { user: true }, // Benutzerdaten zusammen abrufen
        });
        res.json(workoutPosts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------------
// Workout Endpoints
// --------------------------

// 5. Workout erstellen
app.post('/workouts', async (req, res) => {
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

// 6. Alle Workouts eines Benutzers abrufen
app.get('/workouts/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const workouts = await prisma.workout.findMany({
            where: { userId },
            include: { exercises: true }, // Übungen mit einbeziehen
        });
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------------
// Exercise Endpoints
// --------------------------

// 7. Exercise erstellen
app.post('/exercises', async (req, res) => {
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

// 8. Alle Übungen eines Workouts abrufen
app.get('/exercises/:workoutId', async (req, res) => {
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
// Follower Endpoints
// --------------------------

// 9. Follower hinzufügen
app.post('/followers', async (req, res) => {
    const { followerId } = req.body;

    try {
        const follower = await prisma.follower.create({
            data: {
                follower: {
                    connect: { id: followerId },
                },
            },
        });
        res.status(201).json(follower);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 10. Alle Follower eines Benutzers abrufen
app.get('/followers/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const followers = await prisma.follower.findMany({
            where: { followerId: userId },
            include: { follower: true }, // Benutzerdaten mit einbeziehen
        });
        res.json(followers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Benutzeranmeldung
app.post('/login', async (req, res) => {
    const { UserName, Password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { UserName },
        });

        if (!user) {
            return res.status(401).json({ error: 'Benutzername ungültig.' });
        }
        console.log(Password);
        const isValidPassword = await bcrypt.compare(Password, user.Password); // Passwort überprüfen

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Passwort ungültig.' });
        }

        res.status(200).json({ message: 'Anmeldung erfolgreich!', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
