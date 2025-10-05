const { db } = require("../firebase.js");

const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
  try {
    const querySnapshot = await db.collection("contacts").get();
    const contacts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render("index", { contacts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener los contactos.");
  }
});

router.post("/new-contact", async (req, res) => {
  try {
    const { firstname, lastname, email, phone } = req.body;
    await db.collection("contacts").add({
      firstname,
      lastname,
      email,
      phone,
    });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear el contacto.");
  }
});

router.get("/delete-contact/:id", async (req, res) => {
  try {
    await db.collection("contacts").doc(req.params.id).delete();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar el contacto.");
  }
});

router.get("/edit-contact/:id", async (req, res) => {
  try {
    const doc = await db.collection("contacts").doc(req.params.id).get();
    // Lo ideal es redirigir a la página principal y manejar la edición en el frontend
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener el contacto para edición.");
  }
});

router.post("/update-contact/:id", async (req, res) => {
  try {
    const { firstname, lastname, email, phone } = req.body;
    const { id } = req.params;
    await db.collection("contacts").doc(id).update({ firstname, lastname, email, phone });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar el contacto.");
  }
});

module.exports = router;
