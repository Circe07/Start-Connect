// /functions/src/controllers/groupRequests.controller.js

const { db } = require("../config/firebase");
const GroupRequest = require("../models/groupRequest.model");
const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;

const groupRequestsRef = () => db.collection("groupRequests");

/* ==========================
   GET /group-requests/:groupId
   Obtener solicitudes de un grupo (solo admin)
========================== */
exports.sendRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    const existing = await groupRequestsRef()
      .where("groupId", "==", groupId)
      .where("userId", "==", userId)
      .get();

    if (!existing.empty) {
      return res.status(400).json({
        success: false,
        message: 'Ya has enviado una solicitud para este grupo. Espera a que el propietario acepte tu solicitud.'
      });
    }

    const newReq = new GroupRequest(null, {
      groupId,
      userId,
      status: 'pending',
      createdAt: new Date(),
    });

    const docRef = await groupRequestsRef().add(newReq.toFirestore());

    res.status(201).json({
      success: true,
      message: 'Solicitud enviada correctamente',
      requestId: docRef.id,
    });
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al enviar la solicitud', error: error.message });
  }
};

/* ==========================
   GET /group-requests/:groupId
   Obtener solicitudes de un grupo (solo admin)
========================== */
exports.getGroupRequests = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    const groupDoc = await db.collection('groups').doc(groupId).get();

    if (!groupDoc.exists) {
      return res.status(404).json({ message: 'El grupo no existe.' });
    };

    if (groupDoc.data().ownerId !== userId) {
      return res.status(403).json({ message: 'Solo el propietario del grupo puede ver las solicitudes.' });
    };

    const snapshot = await groupRequestsRef()
      .where("groupId", "==", groupId)
      .get();

    const requests = snapshot.docs.map((doc) => GroupRequest.fromFirestore(doc));
    res.status(200).json({ requests });
  } catch (error) {
    console.error('Error al obtener las solicitudes del grupo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las solicitudes del grupo', error: error.message });
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
    if (!requestDoc.exists) {
      return res.status(404).json({ message: 'La solicitud no existe.' });
    };

    const request = GroupRequest.fromFirestore(requestDoc);
    const groupRef = db.collection('groups').doc(request.groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      return res.status(404).json({ message: 'El grupo no existe.' });
    };

    if (groupDoc.data().ownerId !== userId) {
      return res.status(403).json({ message: 'Solo el propietario del grupo puede aprobar las solicitudes.' });
    };

    await groupRequestsRef().doc(requestId).update({
      status: 'accepted',
      updateAt: new Date()
    });

    await groupRef.update({
      members: admin.firestore.FieldValue.arrayUnion({
        userId: request.userId,
        role: 'member',
        joinedAt: new Date()
      }),
      membersId: admin.firestore.FieldValue.arrayUnion(request.userId),
    });
    res.status(201).json({ message: 'Solicitud aprobada correctamente.' });
  } catch (error) {
    console.error('Error al aprobar la solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al aprobar la solicitud', error: error.message });
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
    if (!requestDoc.exists) {
      return res.status(404).json({ message: 'La solicitud no existe.' });
    };

    const request = GroupRequest.fromFirestore(requestDoc);
    const groupDoc = await db.collection('groups').doc(request.groupId).get();

    if (!groupDoc.exists) {
      return res.status(404).json({ message: 'El grupo no existe.' });
    };

    if (groupDoc.data().ownerId !== userId) {
      return res.status(403).json({ message: 'Solo el propietario del grupo puede rechazar las solicitudes.' });
    };

    await groupRequestsRef().doc(requestId).update({
      status: 'rejected',
      updateAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud rechazada correctamente.'
    });
  } catch (error) {
    console.error('Error al rechazar la solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al rechazar la solicitud', error: error.message });
  }
};