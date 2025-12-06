// /functions/src/controllers/groupRequests.controller.js

const { db, FieldValue } = require("../config/firebase");
const GroupRequest = require("../models/groupRequest.model");

const groupRequestsRef = () => db.collection("groupRequests");

/* ==========================
   POST /group-requests/:groupId
========================== */
exports.sendRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    const groupDoc = await db.collection("groups").doc(groupId).get();

    if (!groupDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "El grupo no existe."
      });
    };

    const group = groupDoc.data();

    const alreadyMember = group.members?.some(
      (m) => m.userId === userId || m === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "Ya eres miembro de este grupo."
      });
    };

    const existing = await groupRequestsRef()
      .where("groupId", "==", groupId)
      .where("userId", "==", userId)
      .get();

    if (!existing.empty) {
      return res.status(400).json({
        success: false,
        message: "Ya has enviado una solicitud para este grupo."
      });
    }

    const newReq = new GroupRequest(null, {
      groupId,
      userId,
      status: "pending",
      createdAt: new Date(),
    });

    const docRef = await groupRequestsRef().add(newReq.toFirestore());

    res.status(201).json({
      success: true,
      message: "Solicitud enviada correctamente",
      requestId: docRef.id,
    });
  } catch (error) {
    console.error("Error al enviar la solicitud:", error);
    res.status(500).json({ message: "Error al enviar la solicitud" });
  }
};

/* ==========================
   GET /group-requests/:groupId
========================== */
exports.getGroupRequests = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    const groupDoc = await db.collection("groups").doc(groupId).get();

    if (!groupDoc.exists) {
      return res.status(404).json({ message: "El grupo no existe." });
    }

    if (groupDoc.data().userId !== userId) {
      return res.status(403).json({ message: "No autorizado." });
    }

    const snapshot = await groupRequestsRef()
      .where("groupId", "==", groupId)
      .get();

    const requests = snapshot.docs.map((doc) => GroupRequest.fromFirestore(doc));

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({ message: "Error al obtener solicitudes" });
  }
};

/* ==========================
   PATCH /group-requests/:requestId/approve
========================== */
exports.approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.uid;

    const requestDoc = await groupRequestsRef().doc(requestId).get();
    if (!requestDoc.exists) return res.status(404).json({ message: "Solicitud no existe" });

    const request = GroupRequest.fromFirestore(requestDoc);

    const groupRef = db.collection("groups").doc(request.groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists)
      return res.status(404).json({ message: "Grupo no existe" });

    if (groupDoc.data().userId !== userId)
      return res.status(403).json({ message: "No autorizado" });

    await groupRequestsRef().doc(requestId).delete();

    await groupRef.update({
      members: FieldValue.arrayUnion({
        userId: request.userId,
        role: "member",
        joinedAt: new Date(),
      }),
      membersId: FieldValue.arrayUnion(request.userId),
    });

    res.json({ message: "Solicitud aprobada correctamente." });
  } catch (error) {
    console.error("Error al aprobar solicitud:", error);
    res.status(500).json({ message: "Error al aprobar solicitud" });
  }
};

/* ==========================
   PATCH /group-requests/:requestId/reject
========================== */
exports.rejectedRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.uid;

    const requestDoc = await groupRequestsRef().doc(requestId).get();
    if (!requestDoc.exists) return res.status(404).json({ message: "Solicitud no existe" });

    const request = GroupRequest.fromFirestore(requestDoc);
    const groupDoc = await db.collection("groups").doc(request.groupId).get();

    if (!groupDoc.exists) return res.status(404).json({ message: "Grupo no existe" });

    if (groupDoc.data().userId !== userId)
      return res.status(403).json({ message: "No autorizado" });

    await groupRequestsRef().doc(requestId).delete();
    res.json({ message: "Solicitud rechazada correctamente." });

  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
    res.status(500).json({ message: "Error al rechazar solicitud" });
  }
};
