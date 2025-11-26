// ! NO EJECTUAR A MENOS QUE SE AGREGEN MAS HOBBIES

const router = require("express").Router();
const hobbiesSeed = require("../../scripts/hobbiesSeed");
const venuesSeed = require("../../scripts/venuesSeed");
const { db } = require("../config/firebase");

router.get('/check', (req, res) => {
    res.status(200).json({ message: 'Rutas de admin funcionando correctamente' })
})

router.post("/seed-hobbies", async (req, res) => {
    try {
        const batch = db.batch();

        hobbiesSeed.forEach((hobby) => {
            const ref = db.collection("globalHobbies").doc(hobby.id);
            batch.set(ref, hobby);
        });

        await batch.commit();

        res.json({ success: true, message: "Hobbies cargados" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/seed-venues", async (req, res) => {
    try {
        for (const venue of venuesSeed) {
            const venueRef = db.collection("globalVenues").doc(venue.id);

            const venueData = { ...venue };
            delete venueData.facilities;
            await venueRef.set(venueData);

            for (const facility of venue.facilities) {
                const facilityRef = venueRef.collection("facilities").doc(facility.id);
                await facilityRef.set(facility);
            }
        }

        res.json({ success: true, message: "Venues y facilities cargados" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const { admin } = require("../config/firebase");

router.post("/make-admin", async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid) return res.status(400).json({ message: "UID es requerido" });

        await admin.auth().setCustomUserClaims(uid, { role: 'admin' });

        res.json({ success: true, message: `Usuario ${uid} es ahora Administrador.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
