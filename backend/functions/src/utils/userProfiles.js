const { db } = require("../config/firebase");

const usersCollection = () => db.collection("users");

/**
 * Fetches the minimal public profile for a user so it can be embedded into other documents.
 * Falls back to placeholder values when the user document has not been created yet.
 */
const fetchUserProfile = async (userId) => {
  if (!userId) {
    return { userId: null, name: "Usuario" };
  }

  try {
    const snap = await usersCollection().doc(userId).get();
    if (!snap.exists) {
      return { userId, name: "Usuario" };
    }

    const data = snap.data() || {};
    return {
      userId,
      name: data.name || data.username || data.email || "Usuario",
      username: data.username || "",
      photo: data.photo || data.profile_img_path || "",
      bio: data.bio || data.description || "",
    };
  } catch (error) {
    console.error("fetchUserProfile error", error);
    return { userId, name: "Usuario" };
  }
};

module.exports = { fetchUserProfile };
