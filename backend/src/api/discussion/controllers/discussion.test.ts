import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockSuperFind = jest.fn<(ctx: any) => Promise<any>>();
const mockFindMany = jest.fn<(params: any) => Promise<any[]>>();

const mockDbQuery = jest.fn((_uid: string) => ({
  findMany: mockFindMany,
}));

const mockCreate = jest.fn<(params: any) => Promise<any>>();
const mockFindOne = jest.fn<(params: any) => Promise<any>>();

const mockDocuments = jest.fn((_uid: string) => ({
  findOne: mockFindOne,
  create: mockCreate,
}));

jest.mock('@strapi/strapi', () => ({
  factories: {
    createCoreController: jest.fn(
      (
        _uid: string,
        controllerFactory: (args: { strapi: unknown }) => Record<string, any>,
      ) => {
        const baseController = {
          find: mockSuperFind,
        };

        const customController = controllerFactory({
          strapi: {
            documents: mockDocuments,
            db: {
              query: mockDbQuery,
            },
            log: {
              error: jest.fn(),
            },
          },
        });

        Object.setPrototypeOf(customController, baseController);

        return customController;
      },
    ),
  },
}));

import controller from './discussion';

describe('Discussion Controller - create', () => {
  const create = (controller as any).create;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when the user is not authenticated', async () => {
    const ctx = {
      state: {
        user: null,
      },
      unauthorized: jest.fn((message: string) => ({
        status: 401,
        message,
      })),
    };

    const result = await create(ctx);

    expect(ctx.unauthorized).toHaveBeenCalledWith(
      'Authentication required to publish a discussion.',
    );

    expect(mockCreate).not.toHaveBeenCalled();

    expect(result).toEqual({
      status: 401,
      message: 'Authentication required to publish a discussion.',
    });
  });

  it('returns 400 when the title contains fewer than 10 characters', async () => {
    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            title: 'Short',
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Test content' }],
              },
            ],
            category: 'valid-category-document-id',
            type: 'discussion',
          },
        },
      },
      badRequest: jest.fn((message: string, details?: unknown) => ({
        status: 400,
        message,
        details,
      })),
    };

    const result = await create(ctx);

    expect(ctx.badRequest).toHaveBeenCalledWith(
      'Title must contain at least 10 characters.',
      {
        message: 'Le titre doit contenir au moins 10 caractères.',
      },
    );

    expect(mockFindOne).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();

    expect(result).toEqual({
      status: 400,
      message: 'Title must contain at least 10 characters.',
      details: {
        message: 'Le titre doit contenir au moins 10 caractères.',
      },
    });
  });

  it('returns 400 when content is an empty array', async () => {
    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            title: 'A valid discussion title',
            content: [],
            category: 'valid-category-document-id',
            type: 'discussion',
          },
        },
      },
      badRequest: jest.fn((message: string, details?: unknown) => ({
        status: 400,
        message,
        details,
      })),
    };

    const result = await create(ctx);

    expect(ctx.badRequest).toHaveBeenCalledWith(
      'Content is required.',
      {
        message: 'Le contenu est obligatoire.',
      },
    );

    expect(mockFindOne).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();

    expect(result).toEqual({
      status: 400,
      message: 'Content is required.',
      details: {
        message: 'Le contenu est obligatoire.',
      },
    });
  });

  it('returns 400 when the discussion type is invalid', async () => {
    mockFindOne.mockResolvedValue({
      documentId: 'valid-category-document-id',
    });

    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            title: 'A valid discussion title',
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Test content' }],
              },
            ],
            category: 'valid-category-document-id',
            type: 'announcement',
          },
        },
      },
      badRequest: jest.fn((message: string, details?: unknown) => ({
        status: 400,
        message,
        details,
      })),
    };

    const result = await create(ctx);

    expect(ctx.badRequest).toHaveBeenCalledWith(
      'Type must be question or discussion.',
      {
        message: 'Le type doit être question ou discussion.',
      },
    );

    expect(mockFindOne).toHaveBeenCalledWith({
      documentId: 'valid-category-document-id',
      status: 'published',
    });

    expect(mockCreate).not.toHaveBeenCalled();

    expect(result).toEqual({
      status: 400,
      message: 'Type must be question or discussion.',
      details: {
        message: 'Le type doit être question ou discussion.',
      },
    });
  });

  it('uses the authenticated user as author instead of a client-supplied author', async () => {
    mockFindOne.mockResolvedValue({
      documentId: 'valid-category-document-id',
    });

    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            title: 'A valid discussion title',
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Test content' }],
              },
            ],
            category: 'valid-category-document-id',
            type: 'discussion',
            author: 99,
          },
        },
      },
      status: 200,
      badRequest: jest.fn(),
      internalServerError: jest.fn(),
    };

    mockCreate.mockResolvedValue({
      id: 10,
      documentId: 'test-discussion-document-id',
    });

    await create(ctx);

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        title: 'A valid discussion title',
        content: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Test content' }],
          },
        ],
        category: {
          connect: ['valid-category-document-id'],
        },
        type: 'discussion',
        author: {
          connect: [1],
        },
      },
      status: 'published',
    });

    expect(mockCreate).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          author: 99,
        }),
      }),
    );

    expect(ctx.internalServerError).not.toHaveBeenCalled();
  });

  it('creates a discussion and returns status 201', async () => {
    mockFindOne.mockResolvedValue({
      documentId: 'valid-category-document-id',
    });

    const discussion = {
      id: 10,
      documentId: 'test-discussion-document-id',
      title: 'A valid discussion title',
      content: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Test content' }],
        },
      ],
      category: 'valid-category-document-id',
      type: 'discussion',
    };

    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            title: discussion.title,
            content: discussion.content,
            category: discussion.category,
            type: discussion.type,
          },
        },
      },
      status: 200,
      body: undefined as unknown,
      badRequest: jest.fn(),
      unauthorized: jest.fn(),
      internalServerError: jest.fn(),
    };

    mockCreate.mockResolvedValue(discussion);

    await create(ctx);

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        title: discussion.title,
        content: discussion.content,
        category: {
          connect: ['valid-category-document-id'],
        },
        type: discussion.type,
        author: {
          connect: [1],
        },
      },
      status: 'published',
    });

    expect(ctx.status).toBe(201);

    expect(ctx.body).toEqual({
      data: discussion,
      meta: {},
    });

    expect(ctx.badRequest).not.toHaveBeenCalled();
    expect(ctx.unauthorized).not.toHaveBeenCalled();
    expect(ctx.internalServerError).not.toHaveBeenCalled();
  });

  it('returns 500 when Strapi fails to create a discussion', async () => {
    mockFindOne.mockResolvedValue({
      documentId: 'valid-category-document-id',
    });

    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            title: 'A valid discussion title',
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Test content' }],
              },
            ],
            category: 'valid-category-document-id',
            type: 'discussion',
          },
        },
      },
      internalServerError: jest.fn((message: string) => ({
        status: 500,
        message,
      })),
    };

    mockCreate.mockRejectedValue(new Error('Database connection failed'));

    const result = await create(ctx);

    expect(ctx.internalServerError).toHaveBeenCalledWith(
      'Failed to create discussion.',
    );

    expect(result).toEqual({
      status: 500,
      message: 'Failed to create discussion.',
    });
  });
});

describe('Discussion Controller - find', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the original response when no discussions are found', async () => {
    const response = {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: 10,
          pageCount: 0,
          total: 0,
        },
      },
    };

    const ctx = {};

    mockSuperFind.mockResolvedValue(response);

    const result = await (controller as any).find(ctx);

    expect(mockSuperFind).toHaveBeenCalledWith(ctx);
    expect(mockDbQuery).not.toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it('returns discussions with the correct author matched by documentId', async () => {
    const response = {
      data: [
        {
          documentId: 'discussion-a',
          title: 'First discussion',
        },
        {
          documentId: 'discussion-b',
          title: 'Second discussion',
        },
      ],
      meta: {},
    };

    mockSuperFind.mockResolvedValue(response);

    // Deliberately return records in reverse order.
    mockFindMany.mockResolvedValue([
      {
        documentId: 'discussion-b',
        author: {
          id: 22,
          username: 'author-b',
        },
      },
      {
        documentId: 'discussion-a',
        author: {
          id: 11,
          username: 'author-a',
        },
      },
    ]);

    const result = await (controller as any).find({});

    expect(mockSuperFind).toHaveBeenCalledWith({});
    expect(mockDbQuery).toHaveBeenCalledWith(
      'api::discussion.discussion',
    );

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        documentId: {
          $in: ['discussion-a', 'discussion-b'],
        },
      },
      select: ['documentId'],
      populate: {
        author: {
          select: ['id', 'username'],
        },
      },
    });

    expect(result.data[0].author).toEqual({
      id: 11,
      username: 'author-a',
    });

    expect(result.data[1].author).toEqual({
      id: 22,
      username: 'author-b',
    });
  });

  it('returns 400 when category is missing', async () => {
    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            title: 'A valid discussion title',
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Discussion content' }],
              },
            ],
            type: 'discussion',
          },
        },
      },
      badRequest: jest.fn((message: string, details?: unknown) => ({
        status: 400,
        message,
        details,
      })),
    };

    await (controller as any).create(ctx);

    expect(ctx.badRequest).toHaveBeenCalledWith(
      'A valid category is required.',
      {
        message: 'Une catégorie valide est obligatoire.',
      },
    );

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('returns the original response when no valid documentIds exist', async () => {
    const response = {
      data: [
        { title: 'Discussion without documentId' },
        { documentId: null, title: 'Discussion with null documentId' },
        { documentId: 123, title: 'Discussion with numeric documentId' },
      ],
      meta: {},
    };

    mockSuperFind.mockResolvedValue(response);

    const result = await (controller as any).find({});

    expect(result).toBe(response);
    expect(mockDbQuery).not.toHaveBeenCalled();
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

