const Group = require("../models/group.model.js");
const { db, FieldValue } = require("../config/firebase.js");
const Message = require("../models/message.model.js");



// Referencia a la colección
const groupsRef = () => db.collection("groups");


/* ==========================================================
GET /groups/public
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
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc.data().createdAt);
            }
        }

        const snapshot = await query.limit(limit).get();
        const groups = snapshot.docs.map(doc => Group.fromFirestore(doc));

        res.status(200).json({
            groups,
            hasMore: snapshot.size === limit,
            nextStartAfterId: snapshot.size === limit ? snapshot.docs.at(-1).id : null
        });
    } catch (error) {
        console.error("Error en /public:", error);
        res.status(500).json({ message: "Error interno." });
    }
};



/* ==========================================================
GET /my-groups
========================================================== */
exports.getMyGroups = async (req, res) => {
    try {
        const userId = req.user.uid;

        // FIX: no funciona array-contains con objetos
        const allGroups = await groupsRef().get();
        const groups = allGroups.docs
            .map(doc => Group.fromFirestore(doc))
            .filter(g => g.members.some(m => m.userId === userId));

        res.status(200).json({ groups });
    } catch (error) {
        console.error("Error en /myGroups:", error);
        res.status(500).json({ message: "Error interno." });
    }
};



/* ==========================================================
GET /groups/:id
========================================================== */
exports.getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const doc = await groupsRef().doc(id).get();
        if (!doc.exists) return res.status(404).json({ message: "El grupo no existe." });

        const group = Group.fromFirestore(doc);

        const isMember = group.members.some(m => m.userId === userId);

        if (!isMember && !group.isPublic)
            return res.status(403).json({ message: "No eres miembro de este grupo." });

        res.status(200).json({ group });

    } catch (error) {
        console.error("Error getGroupById:", error);
        res.status(500).json({ message: "Error interno." });
    }
};



/* ==========================================================
POST /groups
========================================================== */
exports.createGroup = async (req, res) => {
    try {
        const userId = req.user.uid;
        const data = req.body;

        if (!data.name?.trim()) {
            return res.status(400).json({ message: "El nombre del grupo es obligatorio." });
        }

        const newGroup = new Group(null, userId, {
            name: data.name.trim(),
            description: data.description,
            sport: data.sport,
            level: data.level,
            city: data.city,
            location: data.location,
            isPublic: data.isPublic ?? true,
            members: [{ userId, role: "admin", joinedAt: new Date() }],
            maxMembers: data.maxMembers || 10,
        });

        const ref = groupsRef().doc();
        await ref.set(newGroup.toFirestore());

        res.status(201).json({
            message: "Grupo creado correctamente",
            groupId: ref.id,
            group: newGroup.toFirestore(),
        });

    } catch (error) {
        console.error("Error createGroup:", error);
        res.status(500).json({ message: "Error interno." });
    }
};



/* ==========================================================
POST /groups/:id/join
========================================================== */
exports.joinGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        await db.runTransaction(async t => {
            const doc = await t.get(groupsRef().doc(id));
            if (!doc.exists) throw new Error("not_found");

            const group = Group.fromFirestore(doc);

            if (group.members.some(m => m.userId === userId))
                throw new Error("already_member");

            const newMember = {
                userId,
                role: "member",
                joinedAt: new Date()
            };

            t.update(groupsRef().doc(id), {
                members: [...group.members, newMember]
            });
        });

        res.status(200).json({ message: "Te has unido al grupo correctamente." });

    } catch (error) {
        const codes = {
            not_found: [404, "El grupo no existe"],
            already_member: [409, "Ya eres miembro del grupo"]
        };
        const [code, msg] = codes[error.message] || [500, "Error interno"];
        res.status(code).json({ message: msg });
    }
};



/* ==========================================================
POST /groups/:id/leave
========================================================== */
exports.leaveGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        await db.runTransaction(async t => {
            const doc = await t.get(groupsRef().doc(id));
            if (!doc.exists) throw new Error("not_found");

            const group = Group.fromFirestore(doc);

            if (!group.members.some(m => m.userId === userId))
                throw new Error("not_member");

            // FIX: ownerId → userId
            if (group.userId === userId && group.members.length === 1) {
                t.delete(groupsRef().doc(id));
                return;
            }

            if (group.userId === userId)
                throw new Error("owner_must_transfer");

            const updated = group.members.filter(m => m.userId !== userId);

            t.update(groupsRef().doc(id), { members: updated });
        });

        res.status(200).json({ message: "Has salido del grupo correctamente." });

    } catch (error) {
        const map = {
            not_found: [404, "El grupo no existe"],
            not_member: [403, "No eres miembro"],
            owner_must_transfer: [400, "Debes transferir el grupo antes"]
        };
        const [code, msg] = map[error.message] || [500, "Error interno"];
        res.status(code).json({ message: msg });
    }
};



/* ==========================================================
POST /groups/:id/post
========================================================== */
exports.newPost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const { content, imageUrl } = req.body;

        if (!content?.trim())
            return res.status(400).json({ message: "El contenido es obligatorio" });
        if (!imageUrl)
            return res.status(400).json({ message: "La imagen es obligatoria" });

        const groupRef = groupsRef().doc(id);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists)
            return res.status(404).json({ message: "El grupo no existe" });

        const group = Group.fromFirestore(groupDoc);

        if (!group.members.some(m => m.userId === userId))
            return res.status(403).json({ message: "No puedes publicar aquí" });

        const postRef = groupRef.collection("posts").doc();

        const postData = {
            content: content.trim(),
            imageUrl: imageUrl || null,
            authorId: userId,
            likes: 0,
            commentCount: 0,
            createdAt: FieldValue.serverTimestamp(),
        };

        await db.runTransaction(async t => {
            t.set(postRef, postData);
            t.update(groupRef, {
                postCount: FieldValue.increment(1),
                lastMessageAt: FieldValue.serverTimestamp(),
            });
        });

        res.status(201).json({ message: "Post creado", postId: postRef.id });

    } catch (error) {
        console.error("Error newPost:", error);
        res.status(500).json({ message: "Error interno", error: error.message });
    }
};



/* ==========================================================
PATCH /groups/:id/transfer-owner/:newOwnerId
========================================================== */
exports.transferOwner = async (req, res) => {
    try {
        const { id, newOwnerId } = req.params;
        const userId = req.user.uid;

        const doc = await groupsRef().doc(id).get();
        if (!doc.exists) return res.status(404).json({ message: "Grupo no existe" });

        const group = Group.fromFirestore(doc);

        if (group.userId !== userId)
            return res.status(403).json({ message: "No eres el propietario" });

        if (!group.members.some(m => m.userId === newOwnerId))
            return res.status(400).json({ message: "Debe ser miembro" });

        if (newOwnerId === userId)
            return res.status(400).json({ message: "Ya eres propietario" });

        await groupsRef().doc(id).update({ userId: newOwnerId });

        res.status(200).json({ message: "Propiedad transferida" });

    } catch (error) {
        console.error("Error transferOwner:", error);
        res.status(500).json({ message: "Error interno" });
    }
};



/* ==========================================================
PATCH /groups/:id
========================================================== */
exports.updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const data = req.body;

        await db.runTransaction(async t => {
            const doc = await t.get(groupsRef().doc(id));
            if (!doc.exists) throw new Error("not_found");

            const group = Group.fromFirestore(doc);

            if (group.userId !== userId)
                throw new Error("unauthorized");

            const updateData = {};

            if (data.name) updateData.name = data.name.trim();
            if (data.description) updateData.description = data.description.trim();
            if (data.city) updateData.city = data.city.trim();
            if (data.isPublic !== undefined) updateData.isPublic = !!data.isPublic;

            t.update(groupsRef().doc(id), updateData);
        });

        res.status(200).json({ message: "Grupo actualizado" });

    } catch (error) {
        console.error("Error updateGroup:", error);
        res.status(500).json({ message: "Error interno" });
    }
};



/* ==========================================================
DELETE /groups/:id/remove-member/:memberId
========================================================== */
exports.removeMember = async (req, res) => {
    try {
        const { id, memberId } = req.params;
        const userId = req.user.uid;

        const doc = await groupsRef().doc(id).get();
        if (!doc.exists) return res.status(404).json({ message: "Grupo no existe" });

        const group = Group.fromFirestore(doc);

        if (group.userId !== userId)
            return res.status(403).json({ message: "Solo el propietario puede eliminar" });

        // FIX: verificar por objeto
        if (!group.members.some(m => m.userId === memberId))
            return res.status(400).json({ message: "No es miembro" });

        const updated = group.members.filter(m => m.userId !== memberId);

        await groupsRef().doc(id).update({
            members: updated
        });

        res.status(200).json({ message: "Miembro eliminado" });

    } catch (error) {
        console.error("Error removeMember:", error);
        res.status(500).json({ message: "Error interno" });
    }
};



/* ==========================================================
DELETE /groups/:id
========================================================== */
exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const doc = await groupsRef().doc(id).get();
        if (!doc.exists) return res.status(404).json({ message: "Grupo no existe" });

        if (doc.data().userId !== userId)
            return res.status(403).json({ message: "No tienes permiso" });

        await groupsRef().doc(id).delete();

        res.status(200).json({ message: "Grupo eliminado" });

    } catch (error) {
        console.error("Error deleteGroup:", error);
        res.status(500).json({ message: "Error interno" });
    }
};



/* ==========================================================
DELETE /groups/:id/post/:postId
========================================================== */
exports.deletePost = async (req, res) => {
    try {
        const { id, postId } = req.params;
        const userId = req.user.uid;

        const groupRef = groupsRef().doc(id);
        const postRef = groupRef.collection("posts").doc(postId);

        const groupDoc = await groupRef.get();
        if (!groupDoc.exists)
            return res.status(404).json({ message: "El grupo no existe." });

        const postDoc = await postRef.get();
        if (!postDoc.exists)
            return res.status(404).json({ message: "La publicación no existe." });

        if (postDoc.data().authorId !== userId)
            return res.status(403).json({ message: "No tienes permiso para eliminar esta publicación." });

        await db.runTransaction(async (t) => {
            t.delete(postRef);
            t.update(groupRef, {
                postCount: FieldValue.increment(-1),
            });
        });

        res.status(200).json({ message: "Publicación eliminada." });

    } catch (error) {
        console.error("Error deletePost:", error);
        res.status(500).json({ message: "Error interno", error: error.message });
    }
};

/* ==========================================================
POST /groups/:id/messages
========================================================== */
exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ message: "El contenido del mensaje es obligatorio." });
        }

        const groupRef = groupsRef().doc(id);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists) {
            return res.status(404).json({ message: "El grupo no existe." });
        }

        const group = Group.fromFirestore(groupDoc);

        // Verificar si el usuario es miembro del grupo
        const isMember = group.members.some(m => m.userId === userId);
        if (!isMember) {
            return res.status(403).json({ message: "No eres miembro de este grupo." });
        }

        const newMessage = new Message(null, {
            groupId: id,
            userId: userId,
            content: content.trim(),
            createdAt: FieldValue.serverTimestamp(),
        });

        const messageRef = await groupRef.collection("messages").add(newMessage.toFirestore());

        res.status(201).json({
            message: "Mensaje enviado.",
            messageId: messageRef.id,
            data: newMessage
        });

    } catch (error) {
        console.error("Error sendMessage:", error);
        res.status(500).json({ message: "Error interno." });
    }
};

/* ==========================================================
GET /groups/:id/messages
========================================================== */
exports.getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const limit = parseInt(req.query.limit) || 20;
        const startAfterId = req.query.startAfterId;

        const groupRef = groupsRef().doc(id);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists) {
            return res.status(404).json({ message: "El grupo no existe." });
        }

        const group = Group.fromFirestore(groupDoc);

        // Verificar si el usuario es miembro del grupo
        const isMember = group.members.some(m => m.userId === userId);
        if (!isMember) {
            return res.status(403).json({ message: "No eres miembro de este grupo." });
        }

        let query = groupRef.collection("messages")
            .orderBy("createdAt", "desc")
            .limit(limit);

        if (startAfterId) {
            const lastDoc = await groupRef.collection("messages").doc(startAfterId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        const messages = snapshot.docs.map(doc => Message.fromFirestore(doc));

        res.status(200).json({
            messages,
            hasMore: snapshot.size === limit,
            nextStartAfterId: snapshot.size === limit ? snapshot.docs.at(-1).id : null
        });

    } catch (error) {
        console.error("Error getMessages:", error);
        res.status(500).json({ message: "Error interno." });
    }
};

/* ==========================================================
DELETE /groups/:id/messages/:messageId
========================================================== */
exports.deleteMessage = async (req, res) => {
    try {
        const { id, messageId } = req.params;
        const userId = req.user.uid;

        const groupRef = groupsRef().doc(id);
        const messageRef = groupRef.collection("messages").doc(messageId);

        const [groupDoc, messageDoc] = await Promise.all([
            groupRef.get(),
            messageRef.get()
        ]);

        if (!groupDoc.exists) {
            return res.status(404).json({ message: "El grupo no existe." });
        }

        if (!messageDoc.exists) {
            return res.status(404).json({ message: "El mensaje no existe." });
        }

        const group = Group.fromFirestore(groupDoc);
        const message = Message.fromFirestore(messageDoc);

        // Permitir borrar si es el autor del mensaje O el dueño del grupo
        const isAuthor = message.userId === userId;
        const isGroupOwner = group.userId === userId;

        if (!isAuthor && !isGroupOwner) {
            return res.status(403).json({ message: "No tienes permiso para eliminar este mensaje." });
        }

        await messageRef.delete();

        res.status(200).json({ message: "Mensaje eliminado correctamente." });

    } catch (error) {
        console.error("Error deleteMessage:", error);
        res.status(500).json({ message: "Error interno." });
    }
};
