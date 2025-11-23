const { db } = require("../src/config/firebase");
const hobbiesSeed = require("./hobbiesSeed");

const sendHobbies = async () => {
    try {
        const batch = db.batch();

        hobbiesSeed.forEach((hobby) => {
            const hobbyRef = db.collection("hobbies").doc(hobby.id);
            batch.set(hobbyRef, hobby);
        });

        await batch.commit();

        console.log("Hobbies cargados correctamente");
    } catch (error) {
        console.error("Error al cargar los hobbies:", error);
    }
};

sendHobbies();