const router = require("express").Router();
const hobbiesSeed = require("../../scripts/hobbiesSeed");
const { db } = require("../config/firebase");

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

module.exports = router;
