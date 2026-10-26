
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

type DiscussionMock = {
  documentId: string;
};

type ReplyMock = {
  id: number;
  documentId: string;
  content: {
    type: string;
    children: {
      type: string;
      text: string;
    }[];
  }[];
};

type CreateReplyParams = {
  data: {
    content: unknown[];
    discussion: { connect: string[] };
    author: { connect: number[] };
  };
  status: 'published';
};

const findOneMock = jest.fn<
  (params: {
    documentId: string;
    status: 'published';
  }) => Promise<DiscussionMock | null>
>();

const createMock = jest.fn<
  (params: CreateReplyParams) => Promise<ReplyMock>
>();

const sanitizeOutputMock = jest.fn<
  (
    reply: ReplyMock,
    contentType: unknown,
    options: { auth: unknown },
  ) => Promise<unknown>
>();

const documentsMock = jest.fn((_uid: string) => ({
  findOne: findOneMock,
  create: createMock,
}));

jest.mock('@strapi/strapi', () => ({
  factories: {
    createCoreController: jest.fn(
      (
        _uid: string,
        controllerFactory: (args: { strapi: unknown }) => unknown,
      ) =>
        controllerFactory({
          strapi: {
            documents: documentsMock,
            contentAPI: {
              sanitize: {
                output: sanitizeOutputMock,
              },
            },
            contentType: jest.fn(),
            log: {
              warn: jest.fn(),
              error: jest.fn(),
            },
          },
        }),
    ),
  },
}));

import controller from './reply';

describe('Reply Controller - create', () => {
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

    expect(ctx.unauthorized).toHaveBeenCalledTimes(1);
    expect(ctx.unauthorized).toHaveBeenCalledWith(
      'Authentication required to publish a reply.',
    );

    expect(result).toEqual({
      status: 401,
      message: 'Authentication required to publish a reply.',
    });
  });

  it('does not process the request when the user is not authenticated', async () => {
    const ctx = {
      state: {
        user: undefined,
      },
      request: {
        body: {
          data: {
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Hello' }],
              },
            ],
            discussion: 'some-discussion-id',
          },
        },
      },
      unauthorized: jest.fn((message: string) => ({
        status: 401,
        message,
      })),
    };

    const result = await create(ctx);

    expect(ctx.unauthorized).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: 401,
      message: 'Authentication required to publish a reply.',
    });

    expect(documentsMock).not.toHaveBeenCalled();
  });

  it('returns 400 when content is an empty array', async () => {
    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            content: [],
            discussion: 'valid-discussion-id',
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
      'Reply validation failed.',
      {
        message: ['Reply content cannot be empty.'],
      },
    );

    expect(documentsMock).not.toHaveBeenCalled();

    expect(result).toEqual({
      status: 400,
      message: 'Reply validation failed.',
      details: {
        message: ['Reply content cannot be empty.'],
      },
    });
  });

  it('returns 400 when content is missing', async () => {
    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            discussion: 'valid-discussion-id',
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
      'Reply validation failed.',
      {
        message: ['Reply content is required.'],
      },
    );

    expect(documentsMock).not.toHaveBeenCalled();

    expect(result).toEqual({
      status: 400,
      message: 'Reply validation failed.',
      details: {
        message: ['Reply content is required.'],
      },
    });
  });

  it('returns 400 when discussionDocumentId is empty', async () => {
    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Test reply' }],
              },
            ],
            discussion: '',
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
      'Reply validation failed.',
      {
        message: ['Discussion documentId cannot be empty.'],
      },
    );

    expect(documentsMock).not.toHaveBeenCalled();

    expect(result).toEqual({
      status: 400,
      message: 'Reply validation failed.',
      details: {
        message: ['Discussion documentId cannot be empty.'],
      },
    });
  });

  it('returns 400 when the discussion does not exist or is not published', async () => {
    findOneMock.mockResolvedValue(null);

    const ctx = {
      state: {
        user: { id: 1 },
      },
      request: {
        body: {
          data: {
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Test reply' }],
              },
            ],
            discussion: 'non-existing-discussion-id',
          },
        },
      },
      badRequest: jest.fn((message: string) => ({
        status: 400,
        message,
      })),
    };

    const result = await create(ctx);

    expect(findOneMock).toHaveBeenCalledWith({
      documentId: 'non-existing-discussion-id',
      status: 'published',
    });

    expect(ctx.badRequest).toHaveBeenCalledWith(
      'Discussion not found or not published.',
    );

    expect(createMock).not.toHaveBeenCalled();

    expect(result).toEqual({
      status: 400,
      message: 'Discussion not found or not published.',
    });
  });

  it('uses the authenticated user as author instead of a client-supplied author', async () => {
    const discussionDocumentId = 'gzr01zkt1gjngwcjv8skfnzz';

    findOneMock.mockResolvedValue({
      documentId: discussionDocumentId,
    });

    createMock.mockResolvedValue({
      id: 10,
      documentId: 'new-reply-document-id',
      content: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'My reply' }],
        },
      ],
    });

    const ctx = {
      state: {
        user: { id: 1 },
        auth: {},
      },
      request: {
        body: {
          data: {
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'My reply' }],
              },
            ],
            discussion: discussionDocumentId,
            author: 99,
          },
        },
      },
      badRequest: jest.fn(),
      internalServerError: jest.fn(),
    };

    await create(ctx);

    expect(findOneMock).toHaveBeenCalledWith({
      documentId: discussionDocumentId,
      status: 'published',
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discussion: {
            connect: [discussionDocumentId],
          },
          author: {
            connect: [1],
          },
        }),
        status: 'published',
      }),
    );

    expect(createMock.mock.calls[0][0].data.author).not.toEqual({
      connect: [99],
    });
  });

  // create reply 

it('creates a reply and returns a sanitized response with status 201', async () => {
  const discussionDocumentId = 'gzr01zkt1gjngwcjv8skfnzz';

  const content = [
    {
      type: 'paragraph',
      children: [{ type: 'text', text: 'My reply' }],
    },
  ];

  const createdReply: ReplyMock = {
    id: 10,
    documentId: 'new-reply-document-id',
    content,
  };

  const sanitizedReply = {
    documentId: 'new-reply-document-id',
    content,
  };

  findOneMock.mockResolvedValue({
    documentId: discussionDocumentId,
  });

  createMock.mockResolvedValue(createdReply);
  sanitizeOutputMock.mockResolvedValue(sanitizedReply);

  const ctx = {
    state: {
      user: { id: 1 },
      auth: {},
    },
    request: {
      body: {
        data: {
          content,
          discussion: discussionDocumentId,
        },
      },
    },
    status: 200,
    badRequest: jest.fn(),
    internalServerError: jest.fn(),
  };

  const result = await create(ctx);

  expect(findOneMock).toHaveBeenCalledWith({
    documentId: discussionDocumentId,
    status: 'published',
  });

  expect(createMock).toHaveBeenCalledWith({
    data: {
      content,
      discussion: {
        connect: [discussionDocumentId],
      },
      author: {
        connect: [1],
      },
    },
    status: 'published',
  });

  expect(sanitizeOutputMock).toHaveBeenCalledTimes(1);

  const sanitizeCall = sanitizeOutputMock.mock.calls[0];

  expect(sanitizeCall[0]).toEqual(createdReply);
  expect(sanitizeCall[1]).toBeUndefined();
  expect(sanitizeCall[2]).toEqual({
    auth: ctx.state.auth,
  });

  expect(ctx.status).toBe(201);

  expect(result).toEqual({
    data: sanitizedReply,
    meta: {},
  });
});

});
