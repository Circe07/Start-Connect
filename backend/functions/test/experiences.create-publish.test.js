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
  const centerDoc = {
    get: jest.fn().mockResolvedValue({ exists: true }),
  };

  return {
    FieldValue: { serverTimestamp: () => 'ts' },
    db: {
      collection: jest.fn((name) => {
        if (name === 'centers') {
          return {
            doc: jest.fn(() => centerDoc),
          };
        }
        return {
          doc: jest.fn(() => experienceDoc),
        };
      }),
    },
    __mocks: { experienceDoc, centerDoc },
  };
});

const {
  createExperience,
  publishExperience,
} = require('../src/controllers/experiences.controller');
const { __mocks } = require('../src/config/firebase');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('experiences controller', () => {
  beforeEach(() => {
    __mocks.centerDoc.get.mockResolvedValue({ exists: true });
  });

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

  it('creates draft experience with center_id when center exists', async () => {
    const req = {
      body: {
        titulo: 'Partido Centro',
        deporte_vertical: 'padel',
        ciudad: 'Madrid',
        fecha: '2026-01-01',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        plazas_totales: 10,
        center_id: 'center-1',
      },
    };
    const res = mockRes();

    await createExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        experience: expect.objectContaining({ center_id: 'center-1' }),
      })
    );
  });

  it('rejects create experience when center_id does not exist', async () => {
    __mocks.centerDoc.get.mockResolvedValueOnce({ exists: false });
    const req = {
      body: {
        titulo: 'Partido Centro',
        deporte_vertical: 'padel',
        ciudad: 'Madrid',
        fecha: '2026-01-01',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        plazas_totales: 10,
        center_id: 'center-missing',
      },
    };
    const res = mockRes();

    await createExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'center_id no existe' })
    );
  });
});
