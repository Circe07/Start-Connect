const { db } = require('../../config/firebase');
const Group = require('../../models/group.model');
const Message = require('../../models/message.model');
const { AppError } = require('../../shared/AppError');

function groupsRef() {
  return db.collection('groups');
}

function createFirestoreGroupRepository() {
  return {
    async listPublicGroups({ limit = 10, startAfterId }) {
      let query = groupsRef().where('isPublic', '==', true).orderBy('createdAt', 'desc');

      if (startAfterId) {
        const lastDoc = await groupsRef().doc(startAfterId).get();
        if (lastDoc.exists) query = query.startAfter(lastDoc.data().createdAt);
      }

      const snapshot = await query.limit(Number(limit) || 10).get();
      const groups = snapshot.docs.map((doc) => Group.fromFirestore(doc));
      return {
        groups,
        hasMore: snapshot.size === (Number(limit) || 10),
        nextStartAfterId: snapshot.size === (Number(limit) || 10) ? snapshot.docs.at(-1).id : null,
      };
    },

    async joinGroup({ groupId, uid }) {
      try {
        await db.runTransaction(async (t) => {
          const docRef = groupsRef().doc(groupId);
          const doc = await t.get(docRef);
          if (!doc.exists)
            throw new AppError({ message: 'El grupo no existe', code: 'NOT_FOUND', status: 404 });
          const group = Group.fromFirestore(doc);
          if (group.members.some((m) => m.userId === uid))
            throw new AppError({
              message: 'Ya eres miembro del grupo',
              code: 'CONFLICT',
              status: 409,
            });
          if (group.members.length >= (group.maxMembers || 10))
            throw new AppError({
              message: 'El grupo está completo',
              code: 'CONFLICT',
              status: 409,
            });
          const newMember = { userId: uid, role: 'member', joinedAt: new Date() };
          t.update(docRef, {
            members: [...group.members, newMember],
            memberIds: [
              ...(group.memberIds || group.members.map((m) => m.userId).filter(Boolean)),
              uid,
            ],
          });
        });
        return { message: 'Te has unido al grupo correctamente.' };
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError({ message: 'Error interno.', code: 'INTERNAL_ERROR', status: 500 });
      }
    },

    async sendMessage({ groupId, uid, content }) {
      const groupRef = groupsRef().doc(groupId);
      const groupDoc = await groupRef.get();
      if (!groupDoc.exists)
        throw new AppError({ message: 'El grupo no existe.', code: 'NOT_FOUND', status: 404 });
      const group = Group.fromFirestore(groupDoc);
      if (!group.members.some((m) => m.userId === uid)) {
        throw new AppError({
          message: 'No eres miembro de este grupo.',
          code: 'FORBIDDEN',
          status: 403,
        });
      }
      const messageRef = await groupRef
        .collection('messages')
        .add(new Message(null, uid, content, 'text', new Date()).toFirestore());
      return { message: 'Mensaje enviado.', messageId: messageRef.id };
    },

    async getMessages({ groupId, uid, limit = 20, startAfterId }) {
      const groupRef = groupsRef().doc(groupId);
      const groupDoc = await groupRef.get();
      if (!groupDoc.exists)
        throw new AppError({ message: 'El grupo no existe.', code: 'NOT_FOUND', status: 404 });
      const group = Group.fromFirestore(groupDoc);
      if (!group.members.some((m) => m.userId === uid)) {
        throw new AppError({
          message: 'No eres miembro de este grupo.',
          code: 'FORBIDDEN',
          status: 403,
        });
      }
      let query = groupRef
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(Number(limit) || 20);
      if (startAfterId) {
        const lastDoc = await groupRef.collection('messages').doc(startAfterId).get();
        if (lastDoc.exists) query = query.startAfter(lastDoc);
      }
      const snapshot = await query.get();
      const messages = snapshot.docs.map((doc) => Message.fromFirestore(doc));
      return {
        messages,
        hasMore: snapshot.size === (Number(limit) || 20),
        nextStartAfterId: snapshot.size === (Number(limit) || 20) ? snapshot.docs.at(-1).id : null,
      };
    },
  };
}

module.exports = { createFirestoreGroupRepository };
