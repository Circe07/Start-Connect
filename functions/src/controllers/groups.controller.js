const { db, admin } = require("../config/firebase.js");
const Group = require("../models/group.model.js");
const FieldValue = admin.firestore.FieldValue;

const groupsRef = () => db.collection("groups");

/* ==========================================================
   GET /groups/public → Listar grupos públicos con paginación
========================================================== */
exports.getPublicGroups = async (req, res) => {
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
        const groups = snapshot.docs.map((doc) => Group.fromFirestore(doc));

        return res.status(200).json({
            groups,
            hasMore: snapshot.size === limit,
            nextStartAfterId: snapshot.size === limit ? snapshot.docs.at(-1).id : null,
        });
    } catch (error) {
        console.error("Error en /public:", error);
        return res.status(500).json({ message: error.message || "Error interno." });
    }
};

/* ==========================================================
   GET /my-groups → Obtener grupos del usuario autenticado
========================================================== */
exports.getMyGroups = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await groupsRef().where("members", "array-contains", userId).get();

        if (snapshot.empty) return res.status(200).json({ groups: [] });

        const groups = snapshot.docs.map((doc) => Group.fromFirestore(doc));
        res.status(200).json({ groups });
    } catch (error) {
        console.error("Error en /myGroups", error);
        res.status(500).json({ message: "Error interno al obtener los grupos" });
    }
};

/* ==========================================================
   GET /groups/:id → Obtener detalles de un grupo
========================================================== */
exports.getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const groupDoc = await groupsRef().doc(id).get();
        if (!groupDoc.exists)
            return res.status(404).json({ message: "El grupo no existe." });

        const group = Group.fromFirestore(groupDoc);
        const isMember = group.members.some((m) => m.userId === userId || m === userId);

        if (!isMember && !group.isPublic)
            return res.status(403).json({ message: "No eres miembro de este grupo." });

        res.status(200).json({ group });
    } catch (error) {
        console.error("Error al obtener grupo:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

/* ==========================================================
   POST /groups → Crear nuevo grupo
========================================================== */
exports.createGroup = async (req, res) => {
    try {
        const userId = req.user.uid;
        const data = req.body;

        if (!data.name?.trim())
            return res.status(400).json({ message: "El nombre del grupo es obligatorio." });

        const newGroup = new Group(null, userId, {
            name: data.name,
            description: data.description,
            sport: data.sport,
            level: data.level,
            city: data.city,
            location: data.location,
            isPublic: data.isPublic ?? true,
            members: [{ userId, role: "admin", joinedAt: new Date() }],
            maxMembers: data.maxMembers || 10,
        });

        const newGroupRef = groupsRef().doc();
        await newGroupRef.set(newGroup.toFirestore());

        res.status(201).json({
            message: "Grupo creado exitosamente.",
            groupId: newGroupRef.id,
            group: { id: newGroupRef.id, ...newGroup },
        });
    } catch (error) {
        console.error("Error al crear grupo:", error);
        res.status(500).json({ message: "Error interno al crear grupo." });
    }
};

/* ==========================================================
   POST /groups/:id/join → Unirse a un grupo
========================================================== */
exports.joinGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        await db.runTransaction(async (transaction) => {
            const groupDoc = await transaction.get(groupsRef().doc(id));
            if (!groupDoc.exists) throw new Error("not_found");

            const group = Group.fromFirestore(groupDoc);
            const alreadyMember = group.members.some((m) => m.userId === userId || m === userId);
            if (alreadyMember) throw new Error("already_member");

            transaction.update(groupsRef().doc(id), {
                members: FieldValue.arrayUnion({ userId, role: "member", joinedAt: new Date() }),
            });
        });

        res.status(200).json({ message: "Te has unido al grupo correctamente." });
    } catch (error) {
        const map = {
            not_found: [404, "El grupo no existe."],
            already_member: [409, "Ya eres miembro de este grupo."],
        };
        const [code, msg] = map[error.message] || [500, "Error interno al unirse al grupo."];
        res.status(code).json({ message: msg });
    }
};

/* ==========================================================
   POST /groups/:id/leave → Abandonar un grupo
========================================================== */
exports.leaveGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        await db.runTransaction(async (transaction) => {
            const groupDoc = await transaction.get(groupsRef().doc(id));
            if (!groupDoc.exists) throw new Error("not_found");

            const group = Group.fromFirestore(groupDoc);
            const memberExists = group.members.some((m) => m.userId === userId || m === userId);
            if (!memberExists) throw new Error("not_member");

            // Si es el propietario y es el único miembro → eliminar el grupo
            if (group.ownerId === userId && group.members.length === 1) {
                transaction.delete(groupsRef().doc(id));
                return;
            }

            // Si es propietario pero hay más miembros → error
            if (group.ownerId === userId)
                throw new Error("owner_must_transfer");

            transaction.update(groupsRef().doc(id), {
                members: FieldValue.arrayRemove(userId),
            });
        });

        res.status(200).json({ message: "Has salido del grupo correctamente." });
    } catch (error) {
        const map = {
            not_found: [404, "El grupo no existe."],
            not_member: [403, "No eres miembro de este grupo."],
            owner_must_transfer: [400, "El propietario debe transferir el grupo antes de salir."],
        };
        const [code, msg] = map[error.message] || [500, "Error interno al salir del grupo."];
        res.status(code).json({ message: msg });
    }
};

/* ==========================================================
   POST /groups/:id/post → Crear publicación
========================================================== */
exports.newPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, imageUrl } = req.body;
        const userId = req.user.uid;

        if (!content?.trim())
            return res.status(400).json({ message: "El contenido es obligatorio." });

        const groupRef = groupsRef().doc(id);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists)
            return res.status(404).json({ message: "El grupo no existe." });

        const group = Group.fromFirestore(groupDoc);
        const isMember = group.members.some((m) => m.userId === userId || m === userId);
        if (!isMember)
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
                postCount: FieldValue.increment(1),
                lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        res.status(201).json({ message: "Publicación creada correctamente.", postId: newPostRef.id });
    } catch (error) {
        console.error("Error al crear publicación:", error);
        res.status(500).json({ message: "Error interno al crear la publicación.", error: error.message });
    }
};

/* ==========================================================
   PATCH /groups/:groupId/transfer-owner/:newOwnerId
========================================================== */
exports.transferOwner = async (req, res) => {
    try {
        const { groupId, newOwnerId } = req.params;
        const userId = req.user.uid;

        const groupRef = groupsRef().doc(groupId);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists)
            return res.status(404).json({ message: "El grupo no existe." });

        const group = Group.fromFirestore(groupDoc);
        if (group.ownerId !== userId)
            return res.status(403).json({ message: "Solo el propietario actual puede transferir el grupo." });

        const isMember = group.members.some((m) => m.userId === newOwnerId || m === newOwnerId);
        if (!isMember)
            return res.status(400).json({ message: "El nuevo propietario debe ser miembro del grupo." });

        if (newOwnerId === userId)
            return res.status(400).json({ message: "Ya eres el propietario del grupo." });

        await groupRef.update({ ownerId: newOwnerId });

        res.status(200).json({ message: `Propiedad del grupo transferida a ${newOwnerId}.` });
    } catch (error) {
        console.error("Error al transferir la propiedad del grupo:", error);
        res.status(500).json({ message: "Error interno al transferir la propiedad." });
    }
};

/* ==========================================================
   PATCH /groups/:id → Actualizar grupo
========================================================== */
exports.updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const { name, description, city, isPublic } = req.body;

        await db.runTransaction(async (transaction) => {
            const groupDoc = await transaction.get(groupsRef().doc(id));
            if (!groupDoc.exists) throw new Error("not_found");

            const group = Group.fromFirestore(groupDoc);
            if (group.ownerId !== userId) throw new Error("unauthorized");

            const updateData = {};
            if (name) updateData.name = name.trim();
            if (description) updateData.description = description.trim();
            if (city) updateData.city = city.trim();
            if (isPublic !== undefined) updateData.isPublic = !!isPublic;
            updateData.updatedAt = new Date();

            transaction.update(groupsRef().doc(id), updateData);
        });

        res.status(200).json({ message: "Grupo actualizado correctamente." });
    } catch (error) {
        console.error("Error al actualizar grupo:", error);
        res.status(500).json({ message: "Error interno al actualizar el grupo." });
    }
};



// DELETE /groups/:groupId/remove-member/:memberId
exports.removeMember = async (req, res) => {
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
};


/* ===========================
   DELETE /:groupId
   Eliminar grupo
=========================== */
exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.uid;

        const groupDoc = await groupsRef().doc(groupId).get();
        if (!groupDoc.exists)
            return res.status(404).json({ message: "El grupo no existe." });

        if (groupDoc.data().ownerId !== userId)
            return res.status(403).json({ message: "Solo el propietario puede eliminar el grupo." });

        await groupsRef().doc(groupId).delete();
        res.status(204).json({ message: `Grupo ${groupId} eliminado exitosamente.` });
    } catch (error) {
        console.error("Error al eliminar grupo:", error);
        res.status(500).json({ message: "Error interno al eliminar grupo." });
    }
};

/* ===========================
   DELETE /:groupId/post/:postId
   Eliminar post
=========================== */
exports.deletePost = async (req, res) => {
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

        return res.status(204).json({ message: "Publicación eliminada exitosamente." });

    } catch (error) {
        console.error("Error al eliminar publicación:", error);
        return res.status(500).json({
            message: "Error interno al eliminar la publicación.",
            error: error.message,
        });
    }
};
