const crypto = require("crypto");
const { admin, db, FieldValue } = require("../config/firebase");
const Post = require("../models/post.model");
const { fetchUserProfile } = require("../utils/userProfiles");

const postsCollection = () => db.collection("posts");
const usersCollection = () => db.collection("users");
const storageBucket = () => admin.storage().bucket();
const postRef = (postId) => postsCollection().doc(postId);
const postLikesRef = (postId, userId) => postRef(postId).collection("likes").doc(userId);
const postCommentsRef = (postId) => postRef(postId).collection("comments");
const postSharesRef = (postId) => postRef(postId).collection("shares");

const MAX_MEDIA_ITEMS = 5;
const MAX_MEDIA_BYTES = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const extensionFromMime = (mimeType = "") => {
  switch (mimeType.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
    case "image/heif":
      return "heic";
    default:
      return "jpg";
  }
};

const toMillis = (value) => {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value._seconds === "number") {
    const seconds = value._seconds * 1000;
    const nanos = value._nanoseconds ? value._nanoseconds / 1e6 : 0;
    return seconds + nanos;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

const serializePostDoc = (doc) => {
  const data = doc.data() || {};
  return {
    id: doc.id,
    authorId: data.authorId,
    authorProfile: data.authorProfile || null,
    caption: data.caption || "",
    media: Array.isArray(data.media) ? data.media : [],
    likeCount: data.likeCount || 0,
    commentCount: data.commentCount || 0,
    shareCount: data.shareCount || 0,
    tags: Array.isArray(data.tags) ? data.tags : [],
    location: data.location || null,
    visibility: data.visibility || "public",
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
};

const serializeCommentDoc = (doc) => {
  const data = doc.data() || {};
  return {
    id: doc.id,
    userId: data.userId,
    authorProfile: data.authorProfile || null,
    content: data.content || "",
    createdAt: toMillis(data.createdAt),
  };
};

const resolveViewerLikes = async (userId, docs = []) => {
  if (!userId || !Array.isArray(docs) || docs.length === 0) {
    return {};
  }

  const likeChecks = await Promise.all(
    docs.map((doc) => doc.ref.collection("likes").doc(userId).get())
  );

  return likeChecks.reduce((acc, likeDoc, index) => {
    const postDoc = docs[index];
    if (postDoc?.id) {
      acc[postDoc.id] = likeDoc.exists;
    }
    return acc;
  }, {});
};

const ensurePostDoc = async (postId) => {
  const doc = await postRef(postId).get();
  if (!doc.exists) {
    const error = new Error("post_not_found");
    error.status = 404;
    throw error;
  }
  return doc;
};

const extractBase64Payload = (item) => {
  if (!item) {
    const error = new Error("invalid_media");
    error.status = 400;
    throw error;
  }

  if (typeof item === "string") {
    const match = item.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      const bad = new Error("invalid_media_format");
      bad.status = 400;
      throw bad;
    }
    return { mimeType: match[1], base64: match[2] };
  }

  const dataUrl = typeof item.dataUrl === "string" ? item.dataUrl : null;
  if (dataUrl) {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      const bad = new Error("invalid_media_format");
      bad.status = 400;
      throw bad;
    }
    return { mimeType: match[1], base64: match[2] };
  }

  const base64 = typeof item.base64 === "string" ? item.base64 : null;
  const mimeType = typeof item.mimeType === "string" ? item.mimeType : null;

  if (!base64 || !mimeType) {
    const bad = new Error("invalid_media_payload");
    bad.status = 400;
    throw bad;
  }

  return { mimeType, base64 };
};

const uploadMediaItem = async (userId, index, item) => {
  const { mimeType, base64 } = extractBase64Payload(item);
  const normalizedMime = mimeType.toLowerCase();

  if (!SUPPORTED_MIME_TYPES.has(normalizedMime)) {
    const error = new Error("unsupported_media_type");
    error.status = 400;
    throw error;
  }

  const sanitizedBase64 = base64
    .replace(/^data:[^;]+;base64,/, "")
    .replace(/\s/g, "");
  const buffer = Buffer.from(sanitizedBase64, "base64");

  if (!buffer.length) {
    const error = new Error("empty_media");
    error.status = 400;
    throw error;
  }

  if (buffer.length > MAX_MEDIA_BYTES) {
    const error = new Error("media_too_large");
    error.status = 400;
    throw error;
  }

  const extension = extensionFromMime(normalizedMime);
  const fileName = `posts/${userId}/${Date.now()}_${index}_${crypto.randomUUID()}.${extension}`;
  const bucket = storageBucket();
  const file = bucket.file(fileName);

  await file.save(buffer, {
    resumable: false,
    metadata: {
      contentType: normalizedMime,
      metadata: {
        owner: userId,
      },
    },
  });

  await file.setMetadata({
    cacheControl: "public,max-age=31536000",
  });

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: "2100-01-01",
  });

  return {
    url: signedUrl,
    storagePath: fileName,
    contentType: normalizedMime,
    size: buffer.length,
  };
};

exports.listPosts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const cursorId = req.query.cursor;

    let query = postsCollection().orderBy("createdAt", "desc").limit(limit);

    if (cursorId) {
      const cursorDoc = await postsCollection().doc(cursorId).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.get();
    const viewerLikeMap = await resolveViewerLikes(req.user?.uid, snapshot.docs);
    const posts = snapshot.docs.map((doc) => ({
      ...serializePostDoc(doc),
      viewerHasLiked: Boolean(viewerLikeMap[doc.id]),
    }));
    const nextCursor =
      snapshot.docs.length === limit
        ? snapshot.docs[snapshot.docs.length - 1].id
        : null;

    res.status(200).json({ success: true, posts, nextCursor });
  } catch (error) {
    console.error("Error listPosts:", error);
    res.status(500).json({ message: "Error al obtener las publicaciones." });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(400).json({ message: "Debes indicar la publicación" });
    }

    const doc = await postRef(postId).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "La publicación no existe" });
    }
    const post = serializePostDoc(doc);

    if (req.user?.uid) {
      const likeSnap = await doc.ref.collection("likes").doc(req.user.uid).get();
      post.viewerHasLiked = likeSnap.exists;
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("Error getPost:", error);
    res.status(500).json({ message: "Error al obtener la publicación." });
  }
};

exports.createPost = async (req, res) => {
  try {
    const userId = req.user.uid;
    const caption =
      typeof req.body?.caption === "string" ? req.body.caption.trim() : "";
    const location = req.body?.location || null;
    const tags = Array.isArray(req.body?.tags) ? req.body.tags : [];
    const visibility =
      typeof req.body?.visibility === "string" ? req.body.visibility : "public";
    const media = Array.isArray(req.body?.media) ? req.body.media : [];

    if (media.length === 0) {
      return res
        .status(400)
        .json({ message: "Debes adjuntar al menos una imagen." });
    }

    if (media.length > MAX_MEDIA_ITEMS) {
      return res.status(400).json({
        message: `Solo puedes subir ${MAX_MEDIA_ITEMS} imágenes por publicación.`,
      });
    }

    const authorProfile = await fetchUserProfile(userId);
    const uploadedMedia = [];

    for (let index = 0; index < media.length; index += 1) {
      const uploaded = await uploadMediaItem(userId, index, media[index]);
      uploadedMedia.push(uploaded);
    }

    const post = new Post(null, {
      authorId: userId,
      authorProfile,
      caption,
      media: uploadedMedia,
      tags,
      location,
      visibility,
    });

    const docRef = await postsCollection().add(post.toFirestore(FieldValue));
    const stored = await docRef.get();

    res.status(201).json({ success: true, post: serializePostDoc(stored) });
  } catch (error) {
    if (error.status && error.status >= 400 && error.status < 500) {
      return res
        .status(error.status)
        .json({ message: error.message || "No se pudo crear la publicación." });
    }

    console.error("Error createPost:", error);
    res.status(500).json({ message: "Error al crear la publicación." });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Debes indicar la publicación" });
    }

    const docRef = postsCollection().doc(postId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "La publicación no existe" });
    }

    const post = Post.fromFirestore(doc);

    if (post.authorId !== userId) {
      return res
        .status(403)
        .json({ message: "No puedes eliminar esta publicación" });
    }

    const mediaItems = Array.isArray(post.media) ? post.media : [];

    await docRef.delete();

    await Promise.all(
      mediaItems
        .filter((item) => item?.storagePath)
        .map((item) =>
          storageBucket()
            .file(item.storagePath)
            .delete({ ignoreNotFound: true })
        )
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deletePost:", error);
    res.status(500).json({ message: "Error al eliminar la publicación." });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId } = req.params;

    const likeRef = postLikesRef(postId, userId);
    const docRef = postRef(postId);

    let liked = false;
    let nextLikeCount = 0;

    await db.runTransaction(async (t) => {
      const postDoc = await t.get(docRef);
      if (!postDoc.exists) {
        throw new Error("post_not_found");
      }

      const likeSnapshot = await t.get(likeRef);
      const currentLikeCount = Number(postDoc.data().likeCount) || 0;

      if (likeSnapshot.exists) {
        liked = false;
        nextLikeCount = Math.max(0, currentLikeCount - 1);
        t.delete(likeRef);
      } else {
        liked = true;
        nextLikeCount = currentLikeCount + 1;
        t.set(likeRef, {
          userId,
          postId,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      t.update(docRef, { likeCount: nextLikeCount });
    });

    res.status(200).json({ success: true, liked, likeCount: nextLikeCount });
  } catch (error) {
    if (error.message === "post_not_found") {
      return res.status(404).json({ message: "La publicación no existe." });
    }
    console.error("Error toggleLike:", error);
    res.status(500).json({ message: "Error al actualizar el like." });
  }
};

exports.addComment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId } = req.params;
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";

    if (!content) {
      return res.status(400).json({ message: "El comentario no puede estar vacío." });
    }

    const authorProfile = await fetchUserProfile(userId);
    const commentRef = postCommentsRef(postId).doc();
    const docRef = postRef(postId);
    let nextCommentCount = 0;

    await db.runTransaction(async (t) => {
      const postDoc = await t.get(docRef);
      if (!postDoc.exists) {
        throw new Error("post_not_found");
      }

      const commentData = {
        postId,
        userId,
        authorProfile,
        content,
        createdAt: FieldValue.serverTimestamp(),
      };

      t.set(commentRef, commentData);

      const currentCount = Number(postDoc.data().commentCount) || 0;
      nextCommentCount = currentCount + 1;
      t.update(docRef, { commentCount: nextCommentCount });
    });

    const storedComment = await commentRef.get();
    res.status(201).json({
      success: true,
      comment: serializeCommentDoc(storedComment),
      commentCount: nextCommentCount,
    });
  } catch (error) {
    if (error.message === "post_not_found") {
      return res.status(404).json({ message: "La publicación no existe." });
    }
    console.error("Error addComment:", error);
    res.status(500).json({ message: "Error al agregar el comentario." });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    await ensurePostDoc(postId);

    const snapshot = await postCommentsRef(postId)
      .orderBy("createdAt", "asc")
      .limit(limit)
      .get();

    const comments = snapshot.docs.map(serializeCommentDoc);
    res.status(200).json({ success: true, comments });
  } catch (error) {
    if (error.status === 404 || error.message === "post_not_found") {
      return res.status(404).json({ message: "La publicación no existe." });
    }
    console.error("Error getComments:", error);
    res.status(500).json({ message: "Error al obtener los comentarios." });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId, commentId } = req.params;

    const commentRef = postCommentsRef(postId).doc(commentId);
    const docRef = postRef(postId);

    let nextCommentCount = 0;

    await db.runTransaction(async (t) => {
      const postDoc = await t.get(docRef);
      if (!postDoc.exists) {
        throw new Error("post_not_found");
      }

      const commentDoc = await t.get(commentRef);
      if (!commentDoc.exists) {
        throw new Error("comment_not_found");
      }

      const postData = postDoc.data() || {};
      const commentData = commentDoc.data() || {};
      const isCommentAuthor = commentData.userId === userId;
      const isPostAuthor = postData.authorId === userId;

      if (!isCommentAuthor && !isPostAuthor) {
        throw new Error("forbidden");
      }

      const currentCount = Number(postData.commentCount) || 0;
      nextCommentCount = Math.max(0, currentCount - 1);

      t.delete(commentRef);
      t.update(docRef, { commentCount: nextCommentCount });
    });

    res.status(200).json({ success: true, commentCount: nextCommentCount });
  } catch (error) {
    if (error.message === "post_not_found") {
      return res.status(404).json({ message: "La publicación no existe." });
    }
    if (error.message === "comment_not_found") {
      return res.status(404).json({ message: "El comentario no existe." });
    }
    if (error.message === "forbidden") {
      return res.status(403).json({ message: "No puedes eliminar este comentario." });
    }
    console.error("Error deleteComment:", error);
    res.status(500).json({ message: "Error al eliminar el comentario." });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId } = req.params;
    const {
      context = "external",
      note = "",
      targetUserId = null,
    } = req.body || {};

    const shareRef = postSharesRef(postId).doc();
    const docRef = postRef(postId);
    let shareCount = 0;

    await db.runTransaction(async (t) => {
      const postDoc = await t.get(docRef);
      if (!postDoc.exists) {
        throw new Error("post_not_found");
      }

      const currentShareCount = Number(postDoc.data().shareCount) || 0;
      shareCount = currentShareCount + 1;

      t.set(shareRef, {
        userId,
        context,
        targetUserId: targetUserId || null,
        note: typeof note === "string" && note.trim() ? note.trim() : null,
        createdAt: FieldValue.serverTimestamp(),
      });

      t.update(docRef, { shareCount });
    });

    res.status(201).json({ success: true, shareId: shareRef.id, shareCount });
  } catch (error) {
    if (error.message === "post_not_found") {
      return res.status(404).json({ message: "La publicación no existe." });
    }
    console.error("Error sharePost:", error);
    res.status(500).json({ message: "Error al compartir la publicación." });
  }
};
