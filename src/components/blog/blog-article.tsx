type BlogArticleProps = {
  content: string;
};

type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function parseMarkdown(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.split("\n").map((line) => line.trim());
  let buffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length) {
      blocks.push({ type: "paragraph", text: buffer.join(" ") });
      buffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer.length) {
      blocks.push({ type: "list", items: listBuffer });
      listBuffer = [];
    }
  };

  for (const line of lines) {
    if (!line.length) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.replace("### ", "") });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(line.replace("- ", ""));
      continue;
    }

    if (line.startsWith("* ")) {
      flushParagraph();
      listBuffer.push(line.replace("* ", ""));
      continue;
    }

    buffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function BlogArticle({ content }: BlogArticleProps) {
  const blocks = parseMarkdown(content);

  return (
    <article className="flex flex-col gap-6 text-slate-700 leading-8">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={`${block.type}-${index}`} className="text-2xl font-semibold text-slate-900">
              {block.text}
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`} className="list-disc space-y-2 pl-6 text-slate-700">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-base leading-8">
            {block.text}
          </p>
        );
      })}
    </article>
  );
}
