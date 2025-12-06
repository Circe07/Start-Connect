class Center {
    constructor(id, data = {}) {
        this.id = id || null;
        this.name = data.name || "";
        this.description = data.description || "";
        this.address = data.address || "";

        // Ubicación geoespacial
        this.location = {
            lat: data.location?.lat || null,
            lng: data.location?.lng || null
        };

        // Lista de servicios (ej. ["Padel", "Gym", "Sauna"])
        this.services = Array.isArray(data.services) ? data.services : [];

        // Precios (puede ser un objeto complejo o texto simple)
        this.prices = data.prices || {};

        // Redes Sociales
        this.socialMedia = {
            instagram: data.socialMedia?.instagram || "",
            facebook: data.socialMedia?.facebook || "",
            twitter: data.socialMedia?.twitter || "", // Ahora X
            website: data.socialMedia?.website || ""
        };

        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || null;
    }

    static fromFirestore(doc) {
        const data = doc.data();
        return new Center(doc.id, data);
    }

    toFirestore() {
        return {
            name: this.name,
            description: this.description,
            address: this.address,
            location: this.location,
            services: this.services,
            prices: this.prices,
            socialMedia: this.socialMedia,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Center;
