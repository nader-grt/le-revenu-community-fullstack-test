/**
 * Reply controller
 *
 * - Requires authentication.
 * - Validates input with Joi.
 * - Accepts only published discussions.
 * - Prevents author spoofing.
 * - Creates and sanitizes replies using Strapi 5.
 * - Returns 400 for validation errors and 500 for unexpected errors.
 */

import { factories } from "@strapi/strapi";
import { errors, yup } from "@strapi/utils";
import Joi from "joi";

const REPLY_UID = "api::reply.reply";
const DISCUSSION_UID = "api::discussion.discussion";

const replySchema = Joi.object({
  content: Joi.array().min(1).required().messages({
    "any.required": "Reply content is required.",
    "array.base": "Reply content must be an array.",
    "array.min": "Reply content cannot be empty.",
  }),

  discussionDocumentId: Joi.string().trim().required().messages({
    "any.required": "Discussion documentId is required.",
    "string.empty": "Discussion documentId cannot be empty.",
  }),
});

export default factories.createCoreController(REPLY_UID, ({ strapi }) => ({
  async create(ctx) {
    // 1. Authentication
    const user = ctx.state.user;

    if (!user?.id) {
      return ctx.unauthorized("Authentication required to publish a reply.");
    }

    // 2. Validate the request payload
    const requestData = ctx.request.body?.data;

    if (
      !requestData ||
      typeof requestData !== "object" ||
      Array.isArray(requestData)
    ) {
      return ctx.badRequest("A valid data object is required.");
    }

    const { content, discussion } = requestData;

    // 3. Extract the Strapi 5 documentId
    const discussionDocumentId =
      typeof discussion === "string"
        ? discussion
        : discussion &&
            typeof discussion === "object" &&
            !Array.isArray(discussion)
          ? discussion.documentId
          : undefined;

    // 4. Validate input with Joi
    const { error, value } = replySchema.validate(
      { content, discussionDocumentId },
      { abortEarly: false, convert: false },
    );

    if (error) {
      return ctx.badRequest("Reply validation failed.", {
        message: error.details.map((detail) => detail.message),
      });
    }

    try {
      // 5. Ensure the discussion exists and is published
      const targetDiscussion = await strapi.documents(DISCUSSION_UID).findOne({
        documentId: value.discussionDocumentId,
        status: "published",
      });

      if (!targetDiscussion) {
        return ctx.badRequest("Discussion not found or not published.");
      }

      // 6. Create the reply.
      // Never trust an author ID supplied by the client.
      const reply: any = await strapi.documents(REPLY_UID).create({
        data: {
          content: value.content,
          discussion: {
            connect: [targetDiscussion.documentId],
          } as any,
          author: {
            connect: [user.id],
          } as any,
        },
        status: "published",
      });
      const replyWithRelations = await strapi.documents(REPLY_UID).findOne({
        documentId: reply.documentId,
        populate: {
          author: true,
          discussion: true,
        },
      });

      console.log(
        "Reply with populated relations:",
        JSON.stringify(replyWithRelations, null, 2),
      );
      console.log("Created reply:", JSON.stringify(reply, null, 2));

      // 7. Sanitize the response
      // const sanitizedReply = await strapi.contentAPI.sanitize.output(
      //   reply,
      //   strapi.contentType(REPLY_UID),
      //   { auth: ctx.state.auth },
      // );

      const sanitizedReply = await strapi.contentAPI.sanitize.output(
        replyWithRelations,
        strapi.contentType(REPLY_UID),
        { auth: ctx.state.auth },
      );
      ctx.status = 201;

      return {
        data: sanitizedReply,
        meta: {},
      };
    } catch (error: unknown) {
      // 8. Handle validation errors
      if (
        error instanceof errors.ValidationError ||
        error instanceof yup.ValidationError
      ) {
        strapi.log.warn(
          `Reply validation failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        return ctx.badRequest("Reply validation failed.", {
          message:
            error instanceof Error
              ? error.message
              : "The reply content is invalid.",
        });
      }

      // 9. Handle unexpected errors
      strapi.log.error("Failed to create reply", error);

      return ctx.internalServerError(
        "An unexpected error occurred while creating the reply.",
      );
    }
  },
}));
/**
 * 
curl -g -s \
  "http://localhost:1337/api/replies/r0651wx1fgajyx173x0ivvy2?populate[author]=true&populate[discussion]=true" \
  | python3 -m json.tool
cd: no such file or directory: /home/nader/le-revenu-community
{
    "data": {
        "id": 18,
        "documentId": "r0651wx1fgajyx173x0ivvy2",
        "content": [
            {
                "type": "paragraph",
                "children": [
                    {
                        "text": "Testing authenticated reply author binding.",
                        "type": "text"
                    }
                ]
            }
        ],
        "createdAt": "2026-10-25T22:39:19.776Z",
        "updatedAt": "2026-10-25T22:39:19.776Z",
        "publishedAt": "2026-10-25T22:39:19.803Z",
        "discussion": {
            "id": 45,
            "documentId": "pjwcbonhwmn32mkb0e2k6t7h",
            "title": "Authenticated author binding security test",
            "content": [
                {
                    "type": "paragraph",
                    "children": [
                        {
                            "text": "Verify that the authenticated user becomes the author.",
                            "type": "text"
                        }
                    ]
                }
            ],
            "type": "discussion",
            "createdAt": "2026-10-25T22:37:32.366Z",
            "updatedAt": "2026-10-25T22:37:32.366Z",
            "publishedAt": "2026-10-25T22:37:32.393Z"
        }
    },
    "meta": {}
}
➜  le-revenu-community 


 */