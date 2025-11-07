const { Router } = require("express");
const router = Router();
const { db, admin } = require("../config/firebase.js");
const authMiddleware = require("../middleware/auth.js");
const { Transaction } = require("firebase-admin/firestore");

const FieldValue = admin.firestore.FieldValue;

// Check
router.get("/check", (_, res) => {
  return res.status(200).send("Rutas de Groups funcionando correctamente");
});

const groupsRef = () => db.collection("groups");

/* ===========================
   GET /groups/public
   Listar grupos públicos con paginación
=========================== */
router.get("/public", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const startAfterId = req.query.startAfterId;

    let query = groupsRef()
      .where("isPublic", "==", true)
      .orderBy("createdAt", "desc");

    if (startAfterId) {
      const lastDoc = await groupsRef().doc(startAfterId).get();
      if (lastDoc.exists && lastDoc.data().createdAt instanceof admin.firestore.Timestamp) {
        query = query.startAfter(lastDoc.data().createdAt);
      }
    }

    const snapshot = await query.limit(limit).get();

    const groups = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof admin.firestore.Timestamp
          ? data.createdAt.toDate()
          : null,
      };
    });

    return res.status(200).json({
      groups,
      hasMore: snapshot.size === limit,
      nextStartAfterId: snapshot.size === limit ? snapshot.docs.at(-1).id : null,
    });
  } catch (error) {
    console.error("Error en /public:", error);
    return res.status(500).json({ message: error.message || "Error interno." });
  }
});

/* ===========================
   GET /myGroups
   Obtener grupos del usuario autenticado
=========================== */
router.get("/myGroups", authMiddleware, async (req, res) => {

  try {
    const userId = req.user.uid;
    console.log("UID autenticado:", userId);

    const snapshot = await groupsRef()
      .where("members", "array-contains", userId)
      .get();

    if (snapshot.empty) {
      console.log("No hay grupos para el usuario:", userId);
      return res.statusCode(200).json({ groups: [] });
    }

    const groups = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        city: data.city || "",
        ownerId: data.ownerId || "",
        memberCount: data.memberCount || 0,
        isPublic: !!data.isPublic,
        createdAt: data.createdAt instanceof admin.firestore.Timestamp
          ? data.createdAt.toDate()
          : null,
      };
    });

    res.status(200).json({ groups });
  } catch (error) {
    console.error("Error en /myGroups", error);
    res.status(500).json({ message: "Error interno del servidor al obtener los grupos" });
  }
});

/* ===========================
   GET /groups/:groupId
   Obtener detalles de un grupo
=========================== */
router.get("/:groupId", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    const groupDoc = await groupsRef().doc(groupId).get();
    if (!groupDoc.exists)
      return res.status(404).json({ message: "El grupo no existe." });

    const data = groupDoc.data();
    if (!data.members.includes(userId))
      return res.status(403).json({ message: "No eres miembro de este grupo." });

    res.status(200).json({
      group: {
        id: groupDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || null,
      },
    });
  } catch (error) {
    console.error("Error al obtener grupo:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});



/* ===========================
   POST /create-group
   Crear nuevo grupo
=========================== */
router.post("/create-group", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, description, city, isPublic } = req.body;

    if (!name?.trim())
      return res.status(400).json({ message: "El nombre del grupo es obligatorio." });

    const newGroupRef = groupsRef().doc();
    const groupData = {
      name: name.trim(),
      description: description?.trim() || "",
      city: city?.trim() || "",
      ownerId: userId,
      members: [userId],
      memberCount: 1,
      isPublic: typeof isPublic === "boolean" ? isPublic : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessageAt: null,
    };

    await newGroupRef.set(groupData);

    res.status(201).json({
      message: "Grupo creado exitosamente.",
      groupId: newGroupRef.id,
      group: { id: newGroupRef.id, ...groupData },
    });
  } catch (error) {
    console.error("Error al crear grupo:", error);
    res.status(500).json({ message: "Error interno al crear grupo." });
  }
});

/* ===========================
   POST /:groupId/join
   Unirse a un grupo
=========================== */
router.post("/:groupId/join", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    await db.runTransaction(async (transaction) => {
      const groupDoc = await transaction.get(groupsRef().doc(groupId));
      if (!groupDoc.exists) throw new Error("not_found");

      const members = groupDoc.data().members || [];
      if (members.includes(userId)) throw new Error("already_member");

      transaction.update(groupsRef().doc(groupId), {
        members: FieldValue.arrayUnion(userId),
        memberCount: FieldValue.increment(1),
      });
    });

    res.status(200).json({ message: "Te has unido al grupo." });
  } catch (error) {
    const map = {
      not_found: [404, "El grupo no existe."],
      already_member: [409, "Ya eres miembro de este grupo."],
    };
    const [code, msg] = map[error.message] || [500, "Error interno al unirse al grupo."];
    res.status(code).json({ message: msg });
  }
});

/* ===========================
   POST /:groupId/leave
   Abandonar un grupo
=========================== */
router.post("/:groupId/leave", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newOwnerId } = req.body;
    const userId = req.user.uid;

    await db.runTransaction(async (transaction) => {
      const groupDoc = await transaction.get(groupsRef().doc(groupId));
      if (!groupDoc.exists) throw new Error("not_found");

      const data = groupDoc.data();
      const members = data.members || [];

      if (!members.includes(userId)) throw new Error("not_member");

      if (data.ownerId === userId) {
        if (members.length === 1) return transaction.delete(groupsRef().doc(groupId));
        if (!newOwnerId || !members.includes(newOwnerId) || newOwnerId === userId)
          throw new Error("invalid_transfer");

        transaction.update(groupsRef().doc(groupId), {
          ownerId: newOwnerId,
          members: FieldValue.arrayRemove(userId),
          memberCount: FieldValue.increment(-1),
        });
      } else {
        transaction.update(groupsRef().doc(groupId), {
          members: FieldValue.arrayRemove(userId),
          memberCount: FieldValue.increment(-1),
        });
      }
    });

    res.status(200).json({ message: "Has abandonado el grupo exitosamente." });
  } catch (error) {
    const map = {
      not_found: [404, "El grupo no existe."],
      not_member: [403, "No eres miembro de este grupo."],
      invalid_transfer: [400, "Debes designar un nuevo propietario válido."],
    };
    const [code, msg] = map[error.message] || [500, "Error interno al abandonar el grupo."];
    res.status(code).json({ message: msg });
  }
});

/* ===========================
   POST /:groupId/new-post
  Crear publicacion en un grupo
=========================== */

router.post("/:groupId/new-post", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, imageUrl } = req.body;
    const userId = req.user.uid;

    if (!content?.trim())
      return res.status(400).json({ message: "El contenido es obligatorio." });

    const groupRef = groupsRef().doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists)
      return res.status(404).json({ message: "El grupo no existe." });

    const groupData = groupDoc.data();
    if (!groupData.members.includes(userId))
      return res.status(403).json({ message: "No tienes permiso para publicar en este grupo." });

    const newPostRef = groupRef.collection("posts").doc();
    const postData = {
      content: content.trim(),
      imageUrl: imageUrl || null,
      authorId: userId,
      likes: 0,
      commentCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.runTransaction(async (transaction) => {
      transaction.set(newPostRef, postData);
      transaction.update(groupRef, {
        postCount: admin.firestore.FieldValue.increment(1),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.status(201).json({
      message: "Publicación creada correctamente.",
      postId: newPostRef.id,
    });

  } catch (error) {
    console.error("Error al crear publicación:", error);
    return res.status(500).json({
      message: "Error interno al crear la publicación.",
      error: error.message,
    });
  }
});

/* ===========================
   PATCH /:groupId
   Actualizar datos del grupo
=========================== */
router.patch("/:groupId", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, city, isPublic } = req.body;
    const userId = req.user.uid;

    await db.runTransaction(async (transaction) => {
      const groupDoc = await transaction.get(groupsRef().doc(groupId));
      if (!groupDoc.exists) throw new Error("not_found");

      if (groupDoc.data().ownerId !== userId) throw new Error("unauthorized");

      const updateData = {};
      if (name !== undefined) {
        if (!name.trim()) throw new Error("invalid_name");
        updateData.name = name.trim();
      }
      if (description !== undefined) updateData.description = description.trim();
      if (city !== undefined) updateData.city = city.trim();
      if (isPublic !== undefined) updateData.isPublic = !!isPublic;

      transaction.update(groupsRef().doc(groupId), updateData);
    });

    res.status(200).json({ message: "Grupo actualizado correctamente." });
  } catch (error) {
    const map = {
      not_found: [404, "El grupo no existe."],
      unauthorized: [403, "No tienes permiso para actualizar este grupo."],
      invalid_name: [400, "El nombre del grupo no puede estar vacío."],
    };
    const [code, msg] = map[error.message] || [500, "Error interno al actualizar grupo."];
    res.status(code).json({ message: msg });
  }
});

// PATCH /groups/:groupId/transfer-owner
router.patch("/:groupId/transfer-owner", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newOwnerId } = req.body;
    const userId = req.user.uid;

    if (!newOwnerId)
      return res.status(400).json({ message: "Se requiere el ID del nuevo propietario." });

    const groupRef = groupsRef().doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists)
      return res.status(404).json({ message: "El grupo no existe." });

    const data = groupDoc.data();

    if (data.ownerId !== userId)
      return res.status(403).json({ message: "Solo el propietario actual puede transferir el grupo." });

    if (!data.members.includes(newOwnerId))
      return res.status(400).json({ message: "El nuevo propietario debe ser miembro del grupo." });

    if (newOwnerId === userId)
      return res.status(400).json({ message: "Ya eres el propietario del grupo." });

    await groupRef.update({ ownerId: newOwnerId });

    res.status(200).json({ message: `Propiedad del grupo transferida a ${newOwnerId}.` });
  } catch (error) {
    console.error("Error al transferir la propiedad del grupo:", error);
    res.status(500).json({ message: "Error interno al transferir la propiedad." });
  }
});

// DELETE /groups/:groupId/remove-member/:memberId
router.delete("/:groupId/remove-member/:memberId", authMiddleware, async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.uid;

    const groupRef = groupsRef().doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists)
      return res.status(404).json({ message: "El grupo no existe." });

    const data = groupDoc.data();

    if (data.ownerId !== userId)
      return res.status(403).json({ message: "Solo el propietario puede eliminar miembros." });

    if (!data.members.includes(memberId))
      return res.status(400).json({ message: "El usuario no es miembro del grupo." });

    if (memberId === userId)
      return res.status(400).json({ message: "No puedes eliminarte a ti mismo. Usa el endpoint /leave." });

    await groupRef.update({
      members: FieldValue.arrayRemove(memberId),
      memberCount: FieldValue.increment(-1),
    });

    res.status(200).json({ message: `Miembro ${memberId} eliminado correctamente.` });
  } catch (error) {
    console.error("Error al eliminar miembro:", error);
    res.status(500).json({ message: "Error interno al eliminar miembro del grupo." });
  }
});


/* ===========================
   DELETE /:groupId
   Eliminar grupo
=========================== */
router.delete("/:groupId", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    const groupDoc = await groupsRef().doc(groupId).get();
    if (!groupDoc.exists)
      return res.status(404).json({ message: "El grupo no existe." });

    if (groupDoc.data().ownerId !== userId)
      return res.status(403).json({ message: "Solo el propietario puede eliminar el grupo." });

    await groupsRef().doc(groupId).delete();
    res.status(200).json({ message: `Grupo ${groupId} eliminado exitosamente.` });
  } catch (error) {
    console.error("Error al eliminar grupo:", error);
    res.status(500).json({ message: "Error interno al eliminar grupo." });
  }
});

/* ===========================
   DELETE /:groupId/post/:postId
   Eliminar post
=========================== */
router.delete("/:groupId/post/:postId", authMiddleware, async (req, res) => {
  try {
    const { groupId, postId } = req.params;
    const userId = req.user.uid;

    const groupRef = groupsRef().doc(groupId);
    const postRef = groupRef.collection("posts").doc(postId);

    const groupDoc = await groupRef.get();
    if (!groupDoc.exists)
      return res.status(404).json({ message: "El grupo no existe." });

    const postDoc = await postRef.get();
    if (!postDoc.exists)
      return res.status(404).json({ message: "La publicación no existe." });

    if (postDoc.data().authorId !== userId)
      return res.status(403).json({ message: "No tienes permiso para eliminar esta publicación." });

    await db.runTransaction(async (transaction) => {
      transaction.delete(postRef);
      transaction.update(groupRef, {
        postCount: admin.firestore.FieldValue.increment(-1),
      });
    });

    return res.status(200).json({ message: "Publicación eliminada exitosamente." });

  } catch (error) {
    console.error("Error al eliminar publicación:", error);
    return res.status(500).json({
      message: "Error interno al eliminar la publicación.",
      error: error.message,
    });
  }
});

module.exports = router;
