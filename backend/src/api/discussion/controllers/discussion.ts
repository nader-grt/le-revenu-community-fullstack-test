/**
 * Discussion controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::discussion.discussion",
  ({ strapi }) => ({
    async create(ctx) {
      // 1. Require authentication
      const user = ctx.state.user;

      if (!user?.id) {
        return ctx.unauthorized(
          "Authentication required to publish a discussion.",
        );
      }

      const requestData = ctx.request.body?.data ?? {};
      const { title, content, category, type } = requestData;

      // 2. Validate title
      if (typeof title !== "string" || title.trim().length < 10) {
        return ctx.badRequest("Title must contain at least 10 characters.", {
          message: "Le titre doit contenir au moins 10 caractères.",
        });
      }

      // 3. Validate content
      if (!Array.isArray(content) || content.length === 0) {
        return ctx.badRequest("Content is required.", {
          message: "Le contenu est obligatoire.",
        });
      }

      // 4. Extract and validate the category documentId
      const categoryDocumentId =
        typeof category === "string"
          ? category
          : category &&
              typeof category === "object" &&
              !Array.isArray(category) &&
              Array.isArray(category.connect) &&
              category.connect.length === 1 &&
              typeof category.connect[0] === "string"
            ? category.connect[0]
            : null;

      if (
        typeof categoryDocumentId !== "string" ||
        !categoryDocumentId.trim()
      ) {
        return ctx.badRequest("A valid category is required.", {
          message: "Une catégorie valide est obligatoire.",
        });
      }

      // 5. Validate that the category exists and is published
      try {
        const existingCategory = await strapi
          .documents("api::category.category")
          .findOne({
            documentId: categoryDocumentId,
            status: "published",
          });

        if (!existingCategory) {
          return ctx.badRequest("The selected category does not exist.", {
            message: "La catégorie sélectionnée n'existe pas.",
          });
        }

        // 6. Validate discussion type
        if (type !== "question" && type !== "discussion") {
          return ctx.badRequest("Type must be question or discussion.", {
            message: "Le type doit être question ou discussion.",
          });
        }

        // 7. Whitelist allowed fields.
        // Never trust author or other fields supplied by the client.
        // const safeData = {
        //   title: title.trim(),
        //   content,
        //   category: {
        //     connect: [categoryDocumentId],
        //   },
        //   type,
        // };

        // // 8. Create through Strapi v5 Document Service
        // const discussion = await strapi
        //   .documents("api::discussion.discussion")
        //   .create({
        //     data: {
        //       ...safeData,
        //       author: {
        //         connect: [user.id],
        //       },
        //     },
        //     status: "published",
        //   });

        const safeData = {
          title: title.trim(),
          content,
          category: {
            connect: [categoryDocumentId],
          } as any,
          type,
        };

        const discussion = await strapi
          .documents("api::discussion.discussion")
          .create({
            data: {
              ...safeData,
              author: {
                connect: [user.id],
              } as any,
            },
            status: "published",
          });

        ctx.status = 201;
        ctx.body = {
          data: discussion,
          meta: {},
        };
      } catch (error) {
        strapi.log.error("Failed to create discussion", error);

        return ctx.internalServerError("Failed to create discussion.");
      }
    },

    async findOne(ctx) {
      // Keep Strapi's default findOne behavior.
      const response = await super.findOne(ctx);

      const discussion = response?.data;

      if (!discussion?.documentId) {
        return response;
      }

      // Fetch only the author fields needed by the UI.
      const record = await strapi.db
        .query("api::discussion.discussion")
        .findOne({
          where: {
            documentId: discussion.documentId,
          },
          select: ["documentId"],
          populate: {
            author: {
              select: ["id", "username"],
            },
          },
        });

      response.data = {
        ...discussion,
        author: record?.author
          ? {
              id: record.author.id,
              username: record.author.username,
            }
          : null,
      };

      return response;
    },

    async find(ctx) {
      // Keep Strapi's default validation, filtering, pagination
      // and response transformation.
      const response = await super.find(ctx);

      const discussions = response?.data;

      if (!Array.isArray(discussions) || discussions.length === 0) {
        return response;
      }

      const documentIds = discussions
        .map((discussion) => discussion.documentId)
        .filter((id) => typeof id === "string");

      if (documentIds.length === 0) {
        return response;
      }

      // Read only the author fields needed by the public UI.
      // This does not expose the Users API publicly.
      const records = await strapi.db
        .query("api::discussion.discussion")
        .findMany({
          where: {
            documentId: {
              $in: documentIds,
            },
          },
          select: ["documentId"],
          populate: {
            author: {
              select: ["id", "username"],
            },
          },
        });

      const authorsByDocumentId = new Map(
        records.map((record) => [
          record.documentId,
          record.author
            ? {
                id: record.author.id,
                username: record.author.username,
              }
            : null,
        ]),
      );

      response.data = discussions.map((discussion) => ({
        ...discussion,
        author: authorsByDocumentId.get(discussion.documentId) ?? null,
      }));

      return response;
    },
  }),
);

// /**
//  * Discussion controller
//  */

// import { factories } from "@strapi/strapi";

// export default factories.createCoreController(
//   "api::discussion.discussion",
//   ({ strapi }) => ({
//     async create(ctx) {
//       // 1. Require authentication
//       const user = ctx.state.user;

//       if (!user?.id) {
//         return ctx.unauthorized(
//           "Authentication required to publish a discussion.",
//         );
//       }

//       const requestData = ctx.request.body?.data ?? {};
//       const { title, content, category, type } = requestData;

//       // 2. Validate title
//       if (typeof title !== "string" || title.trim().length < 10) {
//         return ctx.badRequest("Title must contain at least 10 characters.", {
//           message: "Le titre doit contenir au moins 10 caractères.",
//         });
//       }

//       // 3. Validate content
//       if (!Array.isArray(content) || content.length === 0) {
//         return ctx.badRequest("Content is required.", {
//           message: "Le contenu est obligatoire.",
//         });
//       }

//       // 4. Validate category
//       if (
//         !category ||
//         (typeof category !== "number" &&
//           typeof category !== "string" &&
//           typeof category !== "object")
//       ) {
//         return ctx.badRequest("Category is required.", {
//           message: "La catégorie est obligatoire.",
//         });
//       }

//       // 5. Validate discussion type
//       if (!["question", "discussion"].includes(type)) {
//         return ctx.badRequest("Type must be question or discussion.", {
//           message: "Le type doit être question ou discussion.",
//         });
//       }

//       // 6. Never trust an author supplied by the client
//       const { author: _ignoredAuthor, ...safeData } = requestData;

//       try {
//         // 7. Create through Strapi v5 Document Service
//         const discussion = await strapi
//           .documents("api::discussion.discussion")
//           .create({
//             data: {
//               ...safeData,
//               author: {
//                 connect: [user.id],
//               },
//             },
//             status: "published",
//           });

//         ctx.status = 201;
//         ctx.body = {
//           data: discussion,
//           meta: {},
//         };
//       } catch (error) {
//         strapi.log.error("Failed to create discussion", error);

//         return ctx.internalServerError("Failed to create discussion.");
//       }
//     },

//     async findOne(ctx) {
//       // Keep Strapi's default findOne behavior.
//       const response = await super.findOne(ctx);

//       const discussion = response?.data;

//       if (!discussion?.documentId) {
//         return response;
//       }

//       // Fetch the author relation for this discussion.
//       const record = await strapi.db
//         .query("api::discussion.discussion")
//         .findOne({
//           where: {
//             documentId: discussion.documentId,
//           },
//           select: ["documentId"],
//           populate: {
//             author: {
//               select: ["id", "username"],
//             },
//           },
//         });

//       response.data = {
//         ...discussion,
//         author: record?.author
//           ? {
//               id: record.author.id,
//               username: record.author.username,
//             }
//           : null,
//       };

//       return response;
//     },

// async find(ctx) {
//   // Keep Strapi's default validation, filtering, pagination
//   // and response transformation.
//   const response = await super.find(ctx);

//   const discussions = response?.data;

//   if (!Array.isArray(discussions) || discussions.length === 0) {
//     return response;
//   }

//   const documentIds = discussions
//     .map((discussion) => discussion.documentId)
//     .filter((id) => typeof id === "string");

//   if (documentIds.length === 0) {
//     return response;
//   }

//   // Read only the author fields needed by the public UI.
//   // This does not expose the Users API publicly.
//   const records = await strapi.db
//     .query("api::discussion.discussion")
//     .findMany({
//       where: {
//         documentId: {
//           $in: documentIds,
//         },
//       },
//       select: ["documentId"],
//       populate: {
//         author: {
//           select: ["id", "username"],
//         },
//       },
//     });

//   const authorsByDocumentId = new Map(
//     records.map((record) => [
//       record.documentId,
//       record.author
//         ? {
//             id: record.author.id,
//             username: record.author.username,
//           }
//         : null,
//     ]),
//   );

//   response.data = discussions.map((discussion) => ({
//     ...discussion,
//     author:
//       authorsByDocumentId.get(discussion.documentId) ?? null,
//   }));

//   return response;
// },

//   }),
// );
