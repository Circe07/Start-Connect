
const { Router } = require("express");
const router = Router();
const { db, admin } = require("../firebase.js"); 
const authMiddleware = require("../middleware/auth.js"); 


//Serch
// GET /publicGroups
// GET /publicGroups?limit=X&startAfterId=Y
router.get("/publicGroups", async (req, res) => {
  try {
    // Obtenemos los parámetros de paginación de la query string
    const limit = parseInt(req.query.limit) || 10; // Número de grupos por página, por defecto 10
    const startAfterId = req.query.startAfterId; // ID del último grupo de la página anterior

    // Preparamos la consulta a Firestore
    let query = db.collection("groups")
                   .where("isPublic", "==", true);

    // La paginación basada en cursor requiere un ordenamiento consistente
    // Ordenamos por 'createdAt' descendente para obtener los más nuevos primero,
    // y luego por ID de documento como un desempate (garantiza un orden único).
    query = query.orderBy("createdAt", "desc")
                 .orderBy(admin.firestore.FieldPath.documentId()); // Ordena por ID de documento

    // Si se proporciona startAfterId, lo usamos para comenzar la siguiente página
    if (startAfterId) {
      const lastDocSnapshot = await db.collection("groups").doc(startAfterId).get();

      if (!lastDocSnapshot.exists) {
        // Si el documento de referencia no existe, significa que es un ID inválido
        // o que el documento fue eliminado. Podríamos devolver un error o
        // simplemente ignorar el startAfter y devolver la primera página.
        // Para este ejemplo, lanzaremos un error.
        return res.status(400).json({ message: "El ID de referencia para la paginación (startAfterId) no es válido o el grupo no existe." });
      }
      
      // startAfter requiere los valores de los campos de ordenamiento del último documento
      // En este caso, el valor de 'createdAt' y el ID del documento
      query = query.startAfter(lastDocSnapshot.data().createdAt, lastDocSnapshot.id);
    }

    // Aplicamos el límite a la consulta
    query = query.limit(limit);

    // Ejecutamos la consulta
    const publicGroupsSnapshot = await query.get();

    // Procesamos los resultados
    const publicGroups = [];
    publicGroupsSnapshot.forEach((doc) => {
      const groupData = doc.data();
      publicGroups.push({
        id: doc.id,
        name: groupData.name,
        description: groupData.description,
        city: groupData.city,
        ownerId: groupData.ownerId,
        memberCount: groupData.memberCount,
        isPublic: groupData.isPublic,
        createdAt: groupData.createdAt ? groupData.createdAt.toDate() : null,
        lastMessageAt: groupData.lastMessageAt || null,
      });
    });

    // Determinamos si hay más páginas
    const hasMore = publicGroupsSnapshot.docs.length === limit;
    const nextStartAfterId = hasMore ? publicGroups[publicGroups.length - 1].id : null;

    res.status(200).json({
      groups: publicGroups,
      nextStartAfterId: nextStartAfterId, // ID para la próxima página
      hasMore: hasMore, // Indicador de si hay más páginas
    });

  } catch (error) {
    console.error("Error al obtener los grupos públicos con paginación:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener los grupos públicos." });
  }
});

// GET /groups/:groupId
router.get("/groups/:groupId", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params; // Obtenemos el ID del grupo de los parámetros de la URL
    const userId = req.user.uid; // El ID del usuario autenticado

    // 1. Validar que el groupId no esté vacío
    if (!groupId) {
      return res.status(400).json({ message: "Se requiere un ID de grupo." });
    }

    const groupRef = db.collection("groups").doc(groupId);
    const groupDoc = await groupRef.get();

    // 2. Verificar si el grupo existe
    if (!groupDoc.exists) {
      return res.status(404).json({ message: "El grupo especificado no existe." });
    }

    const groupData = groupDoc.data();

    // 3. Verificar si el usuario autenticado es miembro del grupo
    const members = groupData.members || [];
    if (!members.includes(userId)) {
      // Si el grupo es público, podríamos decidir mostrar algunos detalles limitados
      // o simplemente denegar el acceso. Para este caso, denegamos el acceso completo.
      return res.status(403).json({ message: "No eres miembro de este grupo y no tienes permiso para ver sus detalles." });
    }

    // 4. Si el usuario es miembro, devolvemos todos los detalles del grupo
    const formattedGroup = {
      id: groupDoc.id,
      name: groupData.name,
      description: groupData.description,
      city: groupData.city,
      ownerId: groupData.ownerId,
      memberCount: groupData.memberCount,
      members: groupData.members, // Aquí incluimos la lista completa de miembros
      isPublic: groupData.isPublic,
      createdAt: groupData.createdAt ? groupData.createdAt.toDate() : null,
      lastMessageAt: groupData.lastMessageAt || null,
    };

    res.status(200).json({ group: formattedGroup });

  } catch (error) {
    console.error("Error al obtener los detalles del grupo:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener los detalles del grupo." });
  }
});

// GET /myGroups
router.get("/myGroups", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid; // Obtenemos el UID del usuario autenticado

    // 1. Consultar la colección 'groups' para encontrar documentos donde el array 'members' contenga el userId
    const groupsSnapshot = await db.collection("groups")
                                   .where("members", "array-contains", userId)
                                   .get();

    // 2. Procesar los resultados de la consulta
    const userGroups = [];
    groupsSnapshot.forEach((doc) => {
      const groupData = doc.data();
      userGroups.push({
        id: doc.id, // Incluimos el ID del documento como 'id' del grupo
        name: groupData.name,
        description: groupData.description,
        city: groupData.city,
        ownerId: groupData.ownerId,
        memberCount: groupData.memberCount,
        // No enviamos el array completo de 'members' en la lista general para evitar sobrecarga de datos,
        // pero se podría añadir si es necesario para el cliente.
        createdAt: groupData.createdAt ? groupData.createdAt.toDate() : null, // Convertir Firestore Timestamp a Date
        lastMessageAt: groupData.lastMessageAt || null, // Si es string vacío, que sea null o undefined
      });
    });

    // 3. Responder con la lista de grupos
    res.status(200).json({ groups: userGroups });

  } catch (error) {
    console.error("Error al obtener los grupos del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener los grupos." });
  }
});



//Update
// POST /createGroup
router.post("/createGroup", authMiddleware, async (req, res) => {
  try {
    // ... (código existente) ...

    await newGroupRef.set({
      name: name.trim(),
      description: description ? description.trim() : "",
      city: city ? city.trim() : "",
      ownerId: ownerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessageAt: "", // <-- Este es el valor que se guarda en DB
      members: [ownerId],
      memberCount: 1,
      isPublic: typeof isPublic === 'boolean' ? isPublic : true,
    });

    res.status(201).json({
      message: "Grupo creado exitosamente.",
      groupId: newGroupRef.id,
      group: {
        name: name.trim(),
        description: description ? description.trim() : "",
        city: city ? city.trim() : "",
        ownerId: ownerId,
        members: [ownerId],
        memberCount: 1,
        isPublic: typeof isPublic === 'boolean' ? isPublic : true,
        // createdAt y lastMessageAt se establecen en el servidor.
        // Para la respuesta inmediata, el cliente debería entender que createdAt
        // es un timestamp del servidor, y lastMessageAt es inicialmente null/empty string.
        // No podemos devolver el valor exacto de serverTimestamp() aquí.
        // Devolver `null` para lastMessageAt en la respuesta es consistente con su tratamiento.
        lastMessageAt: null, // <-- CAMBIO SUGERIDO: Devolver null en la respuesta para consistencia
      },
    });
  } catch (error) {
    // ... (código existente) ...
  }
});

// POST /joinGroup
router.post("/joinGroup", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.uid;
    console.log(`[joinGroup] Iniciando para userId: ${userId}, groupId: ${groupId}`); // LOG 1

    if (!groupId) {
      console.log("[joinGroup] Error: groupId faltante.");
      return res.status(400).json({ message: "Se requiere el ID del grupo para unirse." });
    }

    const groupRef = db.collection("groups").doc(groupId);

    await db.runTransaction(async (transaction) => {
      const groupDoc = await transaction.get(groupRef);
      console.log(`[joinGroup] groupDoc.exists: ${groupDoc.exists}`); // LOG 2

      if (!groupDoc.exists) {
        throw new Error("El grupo especificado no existe.");
      }

      const currentMembers = groupDoc.data().members || [];
      console.log(`[joinGroup] Miembros actuales: ${JSON.stringify(currentMembers)}`); // LOG 3
      console.log(`[joinGroup] ¿Usuario ya es miembro? ${currentMembers.includes(userId)}`); // LOG 4
      
      if (currentMembers.includes(userId)) {
        throw new Error("Ya eres miembro de este grupo.");
      }

      console.log("[joinGroup] Realizando actualización de memberCount y members..."); // LOG 5
      transaction.update(groupRef, {
        members: admin.firestore.FieldValue.arrayUnion(userId),
        memberCount: admin.firestore.FieldValue.increment(1),
      });
      console.log("[joinGroup] Actualización preparada en transacción."); // LOG 6
    });

    console.log("[joinGroup] Transacción completada exitosamente."); // LOG 7
    res.status(200).json({ message: "Te has unido al grupo exitosamente." });

  } catch (error) {
    console.error("[joinGroup] Error en el proceso de unión:", error); // LOG DE ERROR
    // ... (tu manejo de errores actual)
    const errorMessage = error.message.includes("no existe") ? "El grupo especificado no existe." :
                         error.message.includes("Ya eres miembro") ? "Ya eres miembro de este grupo." :
                         "Error interno del servidor al unirse al grupo.";
    const statusCode = error.message.includes("no existe") ? 404 :
                       error.message.includes("Ya eres miembro") ? 409 :
                       500;
    res.status(statusCode).json({ message: errorMessage });
  }
});

// POST /leaveGroup
router.post("/leaveGroup", authMiddleware, async (req, res) => {
  try {
    const { groupId, newOwnerId } = req.body; // newOwnerId es opcional, solo si el owner abandona
    const userId = req.user.uid; // El usuario que solicita abandonar el grupo

    // 1. Validación básica
    if (!groupId) {
      return res.status(400).json({ message: "Se requiere el ID del grupo para abandonar." });
    }

    const groupRef = db.collection("groups").doc(groupId);

    // Usamos una transacción para asegurar la consistencia
    await db.runTransaction(async (transaction) => {
      const groupDoc = await transaction.get(groupRef);

      // 2. Verificar si el grupo existe
      if (!groupDoc.exists) {
        throw new Error("El grupo especificado no existe.");
      }

      const groupData = groupDoc.data();
      const currentMembers = groupData.members || [];
      const ownerId = groupData.ownerId; // Obtenemos el ownerId

      // 3. Verificar si el usuario es miembro del grupo
      if (!currentMembers.includes(userId)) {
        throw new Error("No eres miembro de este grupo.");
      }

      // --- Lógica de Abandono del Propietario ---
      if (userId === ownerId) {
        // Caso A: El propietario es el ÚNICO miembro
        if (currentMembers.length === 1) {
          // Si el propietario es el único miembro, eliminamos el grupo.
          transaction.delete(groupRef);
          return res.status(200).json({ message: "Has abandonado el grupo exitosamente. El grupo ha sido eliminado ya que eras el único miembro." });
        } else {
          // Caso B: El propietario abandona, pero hay otros miembros.
          // Debe designar un nuevo propietario.
          if (!newOwnerId) {
            throw new Error("Como propietario, debes designar un nuevo propietario de entre los miembros restantes antes de abandonar el grupo.");
          }
          if (newOwnerId === userId) {
            throw new Error("No puedes designarte a ti mismo como nuevo propietario al abandonar. Debes seleccionar otro miembro.");
          }
          if (!currentMembers.includes(newOwnerId)) {
            throw new Error("El nuevo propietario designado debe ser un miembro actual del grupo.");
          }

          // Transferir la propiedad y luego eliminar al usuario actual de los miembros.
          transaction.update(groupRef, {
            ownerId: newOwnerId, // Nuevo propietario
            members: admin.firestore.FieldValue.arrayRemove(userId), // El propietario saliente se remueve
            memberCount: admin.firestore.FieldValue.increment(-1),
          });
        }
      } else {
        // --- Lógica de Abandono de un Miembro Regular ---
        transaction.update(groupRef, {
          members: admin.firestore.FieldValue.arrayRemove(userId),
          memberCount: admin.firestore.FieldValue.increment(-1),
        });
      }
    });

    // Si llegamos aquí, la transacción fue exitosa y no se eliminó el grupo (solo un propietario saliente lo haría)
    res.status(200).json({ message: "Has abandonado el grupo exitosamente." });

  } catch (error) {
    console.error("Error al abandonar el grupo:", error);

    // Manejo de errores adaptado
    const errorMessage = error.message.includes("no existe") ? "El grupo especificado no existe." :
                         error.message.includes("No eres miembro") ? "No eres miembro de este grupo." :
                         error.message.includes("Como propietario, debes designar") ? "Como propietario, debes designar un nuevo propietario de entre los miembros restantes antes de abandonar el grupo." :
                         error.message.includes("No puedes designarte a ti mismo") ? "No puedes designarte a ti mismo como nuevo propietario al abandonar. Debes seleccionar otro miembro." :
                         error.message.includes("El nuevo propietario designado debe ser un miembro actual") ? "El nuevo propietario designado debe ser un miembro actual del grupo." :
                         "Error interno del servidor al abandonar el grupo.";
    const statusCode = error.message.includes("no existe") ? 404 :
                       error.message.includes("No eres miembro") || errorMessage.includes("Como propietario") || errorMessage.includes("No puedes designarte") || errorMessage.includes("El nuevo propietario designado") ? 403 : // Prohibido o Bad Request en contexto
                       500;
    res.status(statusCode).json({ message: errorMessage });
  }
});

// POST /groups/:groupId/removeMember
router.post("/groups/:groupId/removeMember", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params; // ID del grupo de los parámetros de la URL
    const { memberIdToRemove } = req.body; // ID del miembro a eliminar del cuerpo de la solicitud
    const requestingUserId = req.user.uid; // El ID del usuario que hace la solicitud (debe ser el owner)

    // 1. Validaciones iniciales
    if (!groupId) {
      return res.status(400).json({ message: "Se requiere un ID de grupo." });
    }
    if (!memberIdToRemove) {
      return res.status(400).json({ message: "Se requiere el ID del miembro a eliminar." });
    }

    // Un propietario no puede "eliminarse" a sí mismo a través de esta función; debería usar 'leaveGroup'.
    if (requestingUserId === memberIdToRemove) {
      return res.status(400).json({ message: "No puedes eliminarte a ti mismo de un grupo. Usa la función 'leaveGroup' si deseas abandonar." });
    }

    const groupRef = db.collection("groups").doc(groupId);

    // Usamos una transacción para asegurar la consistencia de los datos
    await db.runTransaction(async (transaction) => {
      const groupDoc = await transaction.get(groupRef);

      // 2. Verificar si el grupo existe
      if (!groupDoc.exists) {
        throw new Error("El grupo especificado no existe.");
      }

      const groupData = groupDoc.data();
      const ownerId = groupData.ownerId;
      const currentMembers = groupData.members || [];

      // 3. Verificar si el usuario que solicita es el 'ownerId' del grupo
      if (requestingUserId !== ownerId) {
        throw new Error("No tienes permiso para eliminar miembros de este grupo. Solo el propietario puede hacerlo.");
      }

      // 4. Verificar si el 'memberIdToRemove' es realmente un miembro del grupo
      if (!currentMembers.includes(memberIdToRemove)) {
        throw new Error("El usuario especificado no es miembro de este grupo.");
      }

      // 5. Eliminar al miembro y decrementar el contador
      transaction.update(groupRef, {
        members: admin.firestore.FieldValue.arrayRemove(memberIdToRemove), // Elimina al miembro del array
        memberCount: admin.firestore.FieldValue.increment(-1), // Decrementa el contador
      });
    });

    res.status(200).json({ message: `Miembro ${memberIdToRemove} eliminado del grupo exitosamente.` });

  } catch (error) {
    console.error("Error al eliminar miembro del grupo:", error);

    // Manejo de errores adaptado
    const errorMessage = error.message.includes("no existe") ? "El grupo especificado no existe." :
                         error.message.includes("No tienes permiso") ? "No tienes permiso para realizar esta acción." :
                         error.message.includes("No puedes eliminarte") ? "No puedes eliminarte a ti mismo de un grupo." :
                         error.message.includes("no es miembro") ? "El usuario especificado no es miembro de este grupo." :
                         "Error interno del servidor al eliminar miembro.";
    const statusCode = error.message.includes("no existe") ? 404 :
                       error.message.includes("No tienes permiso") || error.message.includes("No puedes eliminarte") ? 403 : // Prohibido
                       error.message.includes("no es miembro") ? 400 : // Bad Request porque el memberId no es válido para esa acción
                       500;
    res.status(statusCode).json({ message: errorMessage });
  }
});

// POST /groups/:groupId/transferOwnership
router.post("/groups/:groupId/transferOwnership", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params; // ID del grupo de los parámetros de la URL
    const { newOwnerId } = req.body; // ID del nuevo propietario del cuerpo de la solicitud
    const requestingUserId = req.user.uid; // El ID del usuario que hace la solicitud (debe ser el owner actual)

    // 1. Validaciones iniciales
    if (!groupId) {
      return res.status(400).json({ message: "Se requiere un ID de grupo." });
    }
    if (!newOwnerId) {
      return res.status(400).json({ message: "Se requiere el ID del nuevo propietario." });
    }

    const groupRef = db.collection("groups").doc(groupId);

    // Usamos una transacción para asegurar la consistencia de los datos
    await db.runTransaction(async (transaction) => {
      const groupDoc = await transaction.get(groupRef);

      // 2. Verificar si el grupo existe
      if (!groupDoc.exists) {
        throw new Error("El grupo especificado no existe.");
      }

      const groupData = groupDoc.data();
      const currentOwnerId = groupData.ownerId;
      const members = groupData.members || [];

      // 3. Autorización: Solo el propietario actual puede transferir la propiedad
      if (requestingUserId !== currentOwnerId) {
        throw new Error("No tienes permiso para transferir la propiedad de este grupo. Solo el propietario actual puede hacerlo.");
      }

      // 4. El nuevo propietario debe ser un miembro actual del grupo
      if (!members.includes(newOwnerId)) {
        throw new Error("El nuevo propietario debe ser un miembro actual del grupo.");
      }

      // 5. Opcional: Evitar transferir la propiedad al mismo propietario actual
      if (newOwnerId === currentOwnerId) {
        throw new Error("El usuario especificado ya es el propietario del grupo.");
      }

      // 6. Realizar la transferencia de propiedad
      transaction.update(groupRef, {
        ownerId: newOwnerId,
      });
    });

    res.status(200).json({ message: `Propiedad del grupo ${groupId} transferida exitosamente a ${newOwnerId}.` });

  } catch (error) {
    console.error("Error al transferir la propiedad del grupo:", error);

    // Manejo de errores adaptado
    const errorMessage = error.message.includes("no existe") ? "El grupo especificado no existe." :
                         error.message.includes("No tienes permiso") ? "No tienes permiso para realizar esta acción." :
                         error.message.includes("nuevo propietario debe ser miembro") ? "El nuevo propietario debe ser un miembro actual del grupo." :
                         error.message.includes("ya es el propietario") ? "El usuario especificado ya es el propietario del grupo." :
                         "Error interno del servidor al transferir la propiedad del grupo.";
    const statusCode = error.message.includes("no existe") ? 404 :
                       error.message.includes("No tienes permiso") || error.message.includes("ya es el propietario") ? 403 : // Prohibido
                       error.message.includes("nuevo propietario debe ser miembro") ? 400 : // Bad Request porque el newOwnerId no es válido para esa acción
                       500;
    res.status(statusCode).json({ message: errorMessage });
  }
});

// PATCH /groups/:groupId
router.patch("/groups/:groupId", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params; // ID del grupo de los parámetros de la URL
    // Los campos a actualizar vendrán en el cuerpo de la solicitud
    const { name, description, city, isPublic } = req.body;
    const requestingUserId = req.user.uid; // El ID del usuario que hace la solicitud (debe ser el owner)

    // 1. Validaciones iniciales
    if (!groupId) {
      return res.status(400).json({ message: "Se requiere un ID de grupo." });
    }

    const groupRef = db.collection("groups").doc(groupId);

    // Usamos una transacción para asegurar la consistencia de los datos
    await db.runTransaction(async (transaction) => {
      const groupDoc = await transaction.get(groupRef);

      // 2. Verificar si el grupo existe
      if (!groupDoc.exists) {
        throw new Error("El grupo especificado no existe.");
      }

      const groupData = groupDoc.data();
      const currentOwnerId = groupData.ownerId;

      // 3. Autorización: Solo el propietario actual puede actualizar la información del grupo
      if (requestingUserId !== currentOwnerId) {
        throw new Error("No tienes permiso para actualizar la información de este grupo. Solo el propietario puede hacerlo.");
      }

      // 4. Construir el objeto de actualización con solo los campos proporcionados
      const updateData = {};
      if (name !== undefined) { // Permite string vacío si es intencional, pero no si no se provee el campo
        if (typeof name !== 'string' || name.trim() === "") {
          throw new Error("El nombre del grupo no puede estar vacío.");
        }
        updateData.name = name.trim();
      }
      if (description !== undefined) {
        if (typeof description !== 'string') {
          throw new Error("La descripción debe ser un texto.");
        }
        updateData.description = description.trim();
      }
      if (city !== undefined) {
        if (typeof city !== 'string') {
          throw new Error("La ciudad debe ser un texto.");
        }
        updateData.city = city.trim();
      }
      if (isPublic !== undefined) {
        if (typeof isPublic !== 'boolean') {
          throw new Error("isPublic debe ser un valor booleano (true/false).");
        }
        updateData.isPublic = isPublic;
      }

      // Si no hay datos para actualizar, no hacemos nada
      if (Object.keys(updateData).length === 0) {
        return res.status(200).json({ message: "No se proporcionaron campos válidos para actualizar." });
      }

      // 5. Realizar la actualización
      transaction.update(groupRef, updateData);
    });

    res.status(200).json({ message: `Información del grupo ${groupId} actualizada exitosamente.` });

  } catch (error) {
    console.error("Error al actualizar la información del grupo:", error);

    // Manejo de errores adaptado
    const errorMessage = error.message.includes("no existe") ? "El grupo especificado no existe." :
                         error.message.includes("No tienes permiso") ? "No tienes permiso para realizar esta acción." :
                         error.message.includes("nombre del grupo no puede estar vacío") ? "El nombre del grupo no puede estar vacío." :
                         error.message.includes("debe ser un texto") || error.message.includes("debe ser un valor booleano") ? error.message : // Mensaje de validación directo
                         "Error interno del servidor al actualizar el grupo.";
    const statusCode = error.message.includes("no existe") ? 404 :
                       error.message.includes("No tienes permiso") ? 403 :
                       error.message.includes("nombre del grupo no puede estar vacío") || error.message.includes("debe ser un texto") || error.message.includes("debe ser un valor booleano") ? 400 :
                       500;
    res.status(statusCode).json({ message: errorMessage });
  }
});

// ------------------------------------------
// 2. GESTIÓN DE PUBLICACIONES (POSTS)
// ------------------------------------------

// Ruta protegida: Crear una nueva publicación en el grupo
router.post("/:groupId/post/new", authMiddleware, async (req, res) => {
   try {
    const { groupId } = req.params;
     const { content, imageUrl } = req.body; // 'imageUrl' es opcional
     const userId = req.user.uid;

     // Validación básica
     if (!content) {
       return res.status(400).send("El contenido de la publicación es obligatorio.");
   }

    // 1. Verificación de Pertenencia (seguridad adicional)
    // Asegura que el usuario sea miembro antes de permitirle publicar
     const groupRef = db.collection("groups").doc(groupId);
     const groupDoc = await groupRef.get();
    if (!groupDoc.exists || !groupDoc.data().members.includes(userId)) {
        return res.status(403).send("No tienes permiso para publicar en este grupo.");
       }

       // 2. Referencia a la subcolección 'posts' y nuevo documento
     const newPostRef = db.collection("groups").doc(groupId).collection("posts").doc();
 
     // 3. Datos de la nueva publicación
     const postData = {
       content,
       imageUrl: imageUrl || null, // Guarda null si no se proporciona URL
       authorId: userId, // ID del autor
       likes: 0, // Contador inicial de 'Me Gusta'
      commentCount: 0, // Contador inicial de comentarios
      createdAt: FieldValue.serverTimestamp() // Marca de tiempo del servidor
   };

 // 4. Guardar la publicación y actualizar el contador del grupo (Transacción)
    // Usamos una transacción para asegurar que ambas operaciones ocurran o ninguna
    await db.runTransaction(async (transaction) => {
        transaction.set(newPostRef, postData); // Crear la publicación
        transaction.update(groupRef, {
            postCount: FieldValue.increment(1) // Incrementar el contador de posts en el grupo
        });
    });

 // 5. Respuesta exitosa
 res.status(201).json({ 
  message: "Publicación creada exitosamente.", 
  postId: newPostRef.id // Devuelve el ID de la nueva publicación
 });

 } catch (error) {
 console.error("Error al crear la publicación:", error);
 res.status(500).send("Error interno del servidor al crear la publicación.");
 }
});

//DELETE
// DELETE groups/:groupId
router.delete("/groups/:groupId", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params; // ID del grupo de los parámetros de la URL
    const requestingUserId = req.user.uid; // El ID del usuario que hace la solicitud (debe ser el owner)

    // 1. Validaciones iniciales
    if (!groupId) {
      return res.status(400).json({ message: "Se requiere un ID de grupo para eliminar." });
    }

    const groupRef = db.collection("groups").doc(groupId);
    const groupDoc = await groupRef.get();

    // 2. Verificar si el grupo existe
    if (!groupDoc.exists) {
      return res.status(404).json({ message: "El grupo especificado no existe." });
    }

    const groupData = groupDoc.data();
    const currentOwnerId = groupData.ownerId;

    // 3. Autorización: Solo el propietario actual puede eliminar el grupo
    if (requestingUserId !== currentOwnerId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este grupo. Solo el propietario puede hacerlo." });
    }

    // 4. Eliminar el documento del grupo de Firestore
    // Nota: Si tuvieras subcolecciones (e.g., 'messages'), la eliminación de un documento
    // no elimina automáticamente sus subcolecciones en Firestore. Deberías implementar
    // una eliminación recursiva si es necesario (ej. con Cloud Functions).
    // Para esta implementación básica, solo eliminamos el documento principal.
    await groupRef.delete();

    res.status(200).json({ message: `Grupo ${groupId} eliminado exitosamente.` });

  } catch (error) {
    console.error("Error al eliminar el grupo:", error);

    // Manejo de errores adaptado
    const errorMessage = error.message.includes("no existe") ? "El grupo especificado no existe." :
                         error.message.includes("No tienes permiso") ? "No tienes permiso para realizar esta acción." :
                         "Error interno del servidor al eliminar el grupo.";
    const statusCode = error.message.includes("no existe") ? 404 :
                       error.message.includes("No tienes permiso") ? 403 :
                       500;
    res.status(statusCode).json({ message: errorMessage });
  }
});


module.exports = router ;