// functions/src/models/contact.model.js

class Contact {
    constructor(id, userId, data = {}) {
        if (typeof data !== "object" || data === null) data = {}; // Asegura que data es un objeto

        this.id = id || null; // ID del contacto (documento)
        this.userId = userId; // UID del usuario dueño (autenticado)

        // Información básica del contacto
        this.name = data.name || ""; // Nombre del contacto
        this.username = data.username || ""; // Opcional: apodo o nombre en la app
        this.email = data.email || ""; // Correo electrónico
        this.phone = data.phone || ""; // Teléfono de contacto
        this.address = data.address || ""; // Ciudad o dirección

        // Información deportes
        this.sport = data.sport || ""; // Deporte que practica (pádel, tenis, fútbol...)
        this.level = data.level || ""; // Nivel (principiante, intermedio, avanzado)
        this.availability = data.availability || ""; // Días u horarios en los que suele hacer deporte

        // Estado de la relación
        this.isFriend = data.isFriend || false; // Si ya es amigo en la app
        this.notes = data.notes || ""; // Observaciones o notas personales

        // Metadatos
        this.createdAt = data.createdAt || new Date(); // Fecha de creación
        this.updatedAt = data.updatedAt || null; // Fecha de última actualización
    }


    static fromFirestore(doc) {
        const data = doc.data();
        return new Contact(doc.id, data.userId, data);
    }

    toFirestore() {
        return {
            userId: this.userId,
            name: this.name,
            username: this.username,
            email: this.email,
            phone: this.phone,
            address: this.address,
            sport: this.sport,
            level: this.level,
            availability: this.availability,
            isFriend: this.isFriend,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

module.exports = Contact;
