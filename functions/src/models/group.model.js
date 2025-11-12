// functions/src/models/group.model.js

class Group {
    constructor(id, userId, data = {}) {
        if (typeof data !== "object" || data === null) data = {}; // Asegura que data es un objeto

        // Identificadores
        this.id = id || null; // ID del grupo (documento)
        this.userId = userId; // UID del usuario dueño (autenticado)

        // Información básica del grupo
        this.name = data.name || ""; // Nombre del grupo
        this.description = data.description || ""; // Descripción del grupo
        this.sport = data.sport || ""; // Deporte del grupo (pádel, tenis, fútbol...)
        this.level = data.level || ""; // Nivel del grupo (principiante, intermedio, avanzado)
        this.city = data.city || ""; // Ciudad o zona del grupo
        this.location = data.location || null; // Ubicación específica del grupo

        // Configuración del grupo
        this.isPublic = data.isPublic ?? true; // Si el grupo es público o privado

        // Miembros del grupo y límites
        this.members = Array.isArray(data.members) ? data.members : []; // Lista de UIDs de miembros
        this.maxMembers = data.maxMembers || 10; // Número máximo de miembros permitidos

        // Metadatos
        this.createdAt = data.createdAt || new Date(); // Fecha de creación
        this.updatedAt = data.updatedAt || null; // Fecha de última actualización
    }

    static fromFirestore(doc) {
        const data = doc.data();
        return new Group(doc.id, data.userId, data);
    }

    toFirestore() {
        return {
            userId: this.userId,
            name: this.name,
            description: this.description,
            sport: this.sport,
            level: this.level,
            city: this.city,
            location: this.location,
            isPublic: this.isPublic,
            members: this.members,
            maxMembers: this.maxMembers,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

module.exports = Group;