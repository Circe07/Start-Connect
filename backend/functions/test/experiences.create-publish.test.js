jest.mock('../src/config/firebase', () => {
  const docData = {
    titulo: 'Partido',
    descripcion: 'Desc',
    deporte_vertical: 'padel',
    ciudad: 'Madrid',
    club: 'Club',
    direccion: 'Dir',
    fecha: '2026-01-01',
    hora_inicio: '10:00',
    hora_fin: '11:00',
    nivel_permitido: 'medio',
    plazas_totales: 10,
    plazas_disponibles: 10,
    precio: 10,
    politica_cancelacion: '24h',
    instrucciones: 'Traer pala',
  };

  const experienceDoc = {
    id: 'exp-1',
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue({ exists: true, data: () => docData }),
    update: jest.fn().mockResolvedValue(undefined),
  };

  return {
    FieldValue: { serverTimestamp: () => 'ts' },
    db: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => experienceDoc),
      })),
    },
    __mocks: { experienceDoc },
  };
});

const {
  createExperience,
  publishExperience,
} = require('../src/controllers/experiences.controller');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('experiences controller', () => {
  it('creates draft experience', async () => {
    const req = {
      body: {
        titulo: 'Partido',
        deporte_vertical: 'padel',
        ciudad: 'Madrid',
        fecha: '2026-01-01',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        plazas_totales: 10,
      },
    };
    const res = mockRes();

    await createExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('publishes valid experience', async () => {
    const req = { params: { id: 'exp-1' } };
    const res = mockRes();

    await publishExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
