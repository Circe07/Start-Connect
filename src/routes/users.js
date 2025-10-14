const { db } = require("../firebase.js");
const { Router } = require("express");
const router = Router();
const admin = require("firebase-admin"); 
const authMiddleware = require("../middleware/auth.js"); 

console.log("🔥 Conectado al proyecto:", admin.app().options.credential.projectId);

// Ruta GET / (posiblemente pública, o protegida si solo usuarios autenticados pueden ver contactos)
router.get("/users", async (req, res) => {
  try {
    const querySnapshot = await db.collection("contacts").get();
    const contacts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(contacts);
    res.send(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener los contactos.");
  }
});

// Rutas protegidas - Añade authMiddleware antes de la lógica de la ruta
router.post("/new-contact", authMiddleware, async (req, res) => {
  console.log(req.body);
  try {
    // Ahora puedes acceder a req.user para obtener el UID del usuario, etc.
    // console.log("Usuario autenticado UID:", req.user.uid); 
    const { firstname, lastname, email, phone } = req.body;
    const contactData = { /* ... tus campos ... */ };
    await db.collection("contacts").add(contactData);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear el contacto.");
  }
});

router.patch("/update-contact/:id", authMiddleware, async (req, res) => {
  try {
    // console.log("Usuario autenticado UID:", req.user.uid); 
    const { id } = req.params;
    const { firstname, lastname, email, phone } = req.body;
    const contactData = { /* ... tus campos ... */ };

    if (Object.keys(contactData).length === 0) {
      return res.status(400).send("No se proporcionaron datos para actualizar.");
    }
    await db.collection("contacts").doc(id).update(contactData);
    res.status(200).send("Contacto actualizado exitosamente.");
  } catch (error) {
    console.error("Error al actualizar el contacto:", error);
    res.status(500).send("Error al actualizar el contacto.");
  }
});

router.delete("/delete-contact/:id", authMiddleware, async (req, res) => {
  try {
    // console.log("Usuario autenticado UID:", req.user.uid); 
    await db.collection("contacts").doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar el contacto.");
  }
});


module.exports = router;
