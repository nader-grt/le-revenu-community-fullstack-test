const { createStrapi } = require("@strapi/strapi");

async function main() {
  const app = await createStrapi().load();

  try {
    const discussions = await app.db
      .query("api::discussion.discussion")
      .findMany({
        select: ["id", "documentId", "title"],
        populate: {
          author: {
            select: ["id", "username"],
          },
        },
      });

    console.dir(
      discussions.map(({ id, documentId, title, author }) => ({
        id,
        documentId,
        title,
        author,
      })),
      { depth: null }
    );
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
