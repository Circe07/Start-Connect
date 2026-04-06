/**
 * Seed groups for Barcelona (MVP Groups/Chat)
 */

module.exports = [
  {
    id: "bcn-padel-group-001",
    data: {
      userId: "seed",
      name: "Pádel Barcelona",
      description: "Quedadas de pádel para todos los niveles.",
      sport: "padel",
      level: "intermedio",
      city: "Barcelona",
      location: "Eixample",
      isPublic: true,
      maxMembers: 10,
      members: [{ userId: "seed", role: "admin", joinedAt: new Date() }],
      memberIds: ["seed"],
      createdAt: new Date(),
      postCount: 0,
    }
  },
  {
    id: "bcn-running-group-001",
    data: {
      userId: "seed",
      name: "Running BCN",
      description: "Grupo para correr en Barcelona.",
      sport: "running",
      level: "todos",
      city: "Barcelona",
      location: "Gràcia",
      isPublic: true,
      maxMembers: 30,
      members: [{ userId: "seed", role: "admin", joinedAt: new Date() }],
      memberIds: ["seed"],
      createdAt: new Date(),
      postCount: 0,
    }
  }
];

