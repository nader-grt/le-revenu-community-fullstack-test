
export type ContentBlock = {
  children?: {
    text?: string;
    type?: string;
  }[];
};

export function getBlockText(blocks: unknown): string {
  if (!Array.isArray(blocks)) {
    return "";
  }

  return (blocks as ContentBlock[])
    .map((block) => {
      if (!Array.isArray(block?.children)) {
        return "";
      }

      return block.children
        .map((child) =>
          typeof child?.text === "string" ? child.text : "",
        )
        .join("");
    })
    .filter(Boolean)
    .join("\n\n");
}
