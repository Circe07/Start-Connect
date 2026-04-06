/**
 * Module to seed provisional venues in the database
 * Author: Unai Villar
 */

const venues = [
    {
        id: "barcelona-padel-club",
        data: {
            name: "Barcelona Padel Club",
            location: "Barcelona, España",
            sports: ["padel"]
        },
        facilities: [
            { id: "padel1", name: "Pista Padel #1", sport: "padel", price: 12, openingHours: "09:00", closingHours: "22:00" },
            { id: "padel2", name: "Pista Padel #2", sport: "padel", price: 14, openingHours: "09:00", closingHours: "22:00" }
        ]
    },
    {
        id: "madrid-sports-center",
        data: {
            name: "Madrid Sports Center",
            location: "Madrid, España",
            sports: ["padel", "tenis", "futbol"]
        },
        facilities: [
            { id: "padelA", name: "Pista Padel A", sport: "padel", price: 15, openingHours: "08:00", closingHours: "23:00" },
            { id: "tenis1", name: "Pista Tenis 1", sport: "tenis", price: 20, openingHours: "09:00", closingHours: "21:00" },
            { id: "futbolIndoor", name: "Campo Fútbol Indoor", sport: "futbol", price: 50, openingHours: "10:00", closingHours: "23:00" }
        ]
    },
    {
        id: "valencia-tenis-club",
        data: {
            name: "Valencia Tenis Club",
            location: "Valencia, España",
            sports: ["tenis"]
        },
        facilities: [
            { id: "tenisA", name: "Pista Tenis A", sport: "tenis", price: 25, openingHours: "08:00", closingHours: "22:00" }
        ]
    }
];