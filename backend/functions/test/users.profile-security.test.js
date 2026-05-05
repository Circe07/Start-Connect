const { pickPublicUserFields } = require('../src/domain/users/publicProfile');

describe('pickPublicUserFields', () => {
  test('returns only public keys', () => {
    const data = {
      name: 'A',
      username: 'u',
      photo: 'p',
      email: 'secret@x.com',
      telefono_whatsapp: '+999',
      fuente_adquisicion: 'x',
    };
    expect(pickPublicUserFields(data)).toEqual({
      name: 'A',
      username: 'u',
      photo: 'p',
    });
  });
});

describe('users.controller profile security', () => {
  let usersController;
  let mockGet;
  let mockUpdate;
  let mockDoc;

  beforeEach(() => {
    jest.resetModules();
    mockGet = jest.fn();
    mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockDoc = jest.fn(() => ({
      get: mockGet,
      update: mockUpdate,
    }));
    jest.doMock('../src/config/firebase', () => ({
      db: {
        collection: jest.fn(() => ({
          doc: mockDoc,
        })),
      },
    }));
    usersController = require('../src/controllers/users.controller');
  });

  test('getUserProfile returns full doc for self', async () => {
    const full = {
      name: 'Self',
      email: 'e@e.com',
      telefono_whatsapp: '111',
      fuente_adquisicion: 'web',
    };
    mockGet.mockResolvedValue({ exists: true, data: () => full });

    const req = { user: { uid: 'same-id' }, params: { uid: 'same-id' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await usersController.getUserProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(full);
  });

  test('getUserProfile returns public subset for other user', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        name: 'Other',
        username: 'o',
        photo: 'url',
        bio: 'hi',
        email: 'secret@test.com',
        telefono_whatsapp: '600',
        zona: 'Madrid',
      }),
    });

    const req = { user: { uid: 'viewer' }, params: { uid: 'other' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await usersController.getUserProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({
      name: 'Other',
      username: 'o',
      photo: 'url',
      bio: 'hi',
    });
    expect(res.json.mock.calls[0][0].email).toBeUndefined();
  });

  test('getUserProfile 404 when missing', async () => {
    mockGet.mockResolvedValue({ exists: false });

    const req = { user: { uid: 'a' }, params: { uid: 'b' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    await usersController.getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateMyProfile does not pass email or fecha_registro to Firestore', async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({}) });

    const req = {
      user: { uid: 'u1' },
      body: {
        name: 'Ok',
        email: 'hijack@test.com',
        fecha_registro: '2020-01-01',
      },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await usersController.updateMyProfile(req, res);

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const payload = mockUpdate.mock.calls[0][0];
    expect(payload.email).toBeUndefined();
    expect(payload.fecha_registro).toBeUndefined();
    expect(payload.name).toBe('Ok');
  });

  test('getMyProfile 500 does not expose internal error message', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGet.mockRejectedValue(new Error('firestore_internal_xyz'));

    const req = { user: { uid: 'u1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    try {
      await usersController.getMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      const body = res.json.mock.calls[0][0];
      expect(JSON.stringify(body)).not.toContain('firestore_internal_xyz');
      expect(body.success).toBe(false);
      expect(body.code).toBe('INTERNAL_ERROR');
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
