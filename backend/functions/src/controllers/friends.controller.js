const { db, FieldValue } = require("../config/firebase");

const friendsCollection = () => db.collection("friends");
const usersCollection = () => db.collection("users");

const buildParticipantProfiles = async (participantIds = []) => {
  const entries = await Promise.all(
    participantIds.map(async (uid) => {
      if (!uid) return null;
      try {
        const snap = await usersCollection().doc(uid).get();
        if (!snap.exists) {
          return [uid, { userId: uid }];
        }

        const data = snap.data();

        return [
          uid,
          {
            userId: uid,
            name: data.name || data.username || data.email || "Usuario",
            username: data.username || "",
            photo: data.photo || data.profile_img_path || "",
            bio: data.bio || data.description || "",
          },
        ];
      } catch (error) {
        console.error("Error fetching participant profile", error);
        return [uid, { userId: uid }];
      }
    })
  );

  return entries.reduce((acc, entry) => {
    if (entry) {
      const [uid, profile] = entry;
      acc[uid] = profile;
    }
    return acc;
  }, {});
};

const makeFriendshipId = (ids = []) => ids.slice().sort().join("__");

const timestampToMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }
  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }
  if (typeof value._seconds === "number") {
    const seconds = value._seconds * 1000;
    const nanos = value._nanoseconds ? value._nanoseconds / 1e6 : 0;
    return seconds + nanos;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const buildFriendSummary = (userId, doc) => {
  const data = doc.data() || {};
  const participantIds = data.participantIds || [];
  const targetId = participantIds.find((id) => id !== userId) || userId;
  const participantProfiles = data.participantProfiles || {};

  return {
    id: doc.id,
    friendId: targetId,
    profile: participantProfiles[targetId] || { userId: targetId },
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
};

exports.listFriends = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await friendsCollection()
      .where("participantIds", "array-contains", userId)
      .get();

    const friends = snapshot.docs
      .map((doc) => buildFriendSummary(userId, doc))
      .sort((a, b) => timestampToMillis(b.createdAt) - timestampToMillis(a.createdAt));

    res.status(200).json({ success: true, friends });
  } catch (error) {
    console.error("Error listFriends:", error);
    res.status(500).json({ message: "Error al obtener los amigos." });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const userId = req.user.uid;
    const rawFriendId = req.body?.friendId;
    const friendId = typeof rawFriendId === "string" ? rawFriendId.trim() : "";

    if (!friendId) {
      return res.status(400).json({ message: "Debes indicar el usuario a agregar." });
    }

    if (friendId === userId) {
      return res.status(400).json({ message: "No puedes agregarte como amigo." });
    }

    const friendDoc = await usersCollection().doc(friendId).get();
    if (!friendDoc.exists) {
      return res.status(404).json({ message: "El usuario no existe." });
    }

    const participantIds = [userId, friendId];
    const participantHash = makeFriendshipId(participantIds);
    const friendshipRef = friendsCollection().doc(participantHash);
    const existing = await friendshipRef.get();

    if (existing.exists) {
      return res.status(200).json({
        success: true,
        friend: buildFriendSummary(userId, existing),
      });
    }

    const participantProfiles = await buildParticipantProfiles(participantIds);

    await friendshipRef.set({
      participantIds,
      participantHash,
      participantProfiles,
      initiatedBy: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const stored = await friendshipRef.get();

    res.status(201).json({
      success: true,
      friend: buildFriendSummary(userId, stored),
    });
  } catch (error) {
    console.error("Error addFriend:", error);
    res.status(500).json({ message: "Error al agregar amigo." });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.uid;
    const friendId = (req.params.friendId || "").trim();

    if (!friendId) {
      return res.status(400).json({ message: "Debes indicar el amigo a eliminar." });
    }

    const participantHash = makeFriendshipId([userId, friendId]);
    const friendshipRef = friendsCollection().doc(participantHash);
    const existing = await friendshipRef.get();

    if (!existing.exists) {
      return res.status(404).json({ message: "La amistad no existe." });
    }

    await friendshipRef.delete();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error removeFriend:", error);
    res.status(500).json({ message: "Error al eliminar amigo." });
  }
};
