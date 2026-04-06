/**
 * Seed activities for Barcelona (MVP Discover)
 */

module.exports = [
  {
    id: "bcn-padel-morning-001",
    data: {
      title: "Pádel por la mañana",
      city: "Barcelona",
      zone: "Eixample",
      interests: ["padel"],
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      capacity: 4,
      location: { lat: 41.38879, lng: 2.15899 }
    }
  },
  {
    id: "bcn-running-evening-001",
    data: {
      title: "Running al atardecer",
      city: "Barcelona",
      zone: "Gràcia",
      interests: ["running"],
      startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      capacity: 12,
      location: { lat: 41.40361, lng: 2.15744 }
    }
  },
  {
    id: "bcn-tenis-weekend-001",
    data: {
      title: "Tenis fin de semana",
      city: "Barcelona",
      zone: "Sants-Montjuïc",
      interests: ["tenis"],
      startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      capacity: 2,
      location: { lat: 41.37306, lng: 2.14962 }
    }
  }
];

