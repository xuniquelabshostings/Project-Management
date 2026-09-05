import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple, robust, zero-dependency Markdown renderer tailored for technical articles
  const renderFormattedText = (text: string) => {
    // Process bold, italics, inline code, and links
    const parts: React.ReactNode[] = [];
    let current = text;
    let key = 0;

    // Replace bold **text**
    const tokens = current.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

    return tokens.map((tok, i) => {
      if (tok.startsWith("**") && tok.endsWith("**")) {
        return <strong key={i} className="font-semibold text-foreground">{tok.slice(2, -2)}</strong>;
      }
      if (tok.startsWith("`") && tok.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-accent font-mono text-xs"
          >
            {tok.slice(1, -1)}
          </code>
        );
      }
      if (tok.startsWith("*") && tok.endsWith("*")) {
        return <em key={i} className="italic text-foreground/90">{tok.slice(1, -1)}</em>;
      }
      return tok;
    });
  };

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // 1. Code Block toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={`code-${idx}`} className="my-6 rounded-lg overflow-hidden border border-border bg-[#0B1522] text-[#E0E6ED] shadow-sm">
            {codeBlockLang && (
              <div className="px-4 py-1.5 bg-[#08101A] border-b border-border/40 text-[11px] font-mono text-muted uppercase tracking-wider flex justify-between items-center">
                <span>{codeBlockLang}</span>
                <span className="text-[10px] text-muted/60">Source Snippet</span>
              </div>
            )}
            <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed">
              <code>{codeLines.join("\n")}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLang = "";
        codeLines = [];
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, "").trim();
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // 2. Table handling
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Check if divider row like | :--- | :--- |
      if (line.includes("---")) {
        continue;
      }
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      // Flush table
      const headerRow = tableRows[0] || [];
      const bodyRows = tableRows.slice(1);
      elements.push(
        <div key={`table-${idx}`} className="my-6 overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-xs border-collapse">
            {headerRow.length > 0 && (
              <thead className="bg-surface-elevated/70 border-b border-border">
                <tr>
                  {headerRow.map((cell, hIdx) => (
                    <th key={hIdx} className="px-4 py-3 font-mono font-medium text-foreground uppercase tracking-wider text-[11px]">
                      {renderFormattedText(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-border/50">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface-elevated/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-muted">
                      {renderFormattedText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableRows = [];
    }

    // Empty line
    if (!line.trim()) {
      continue;
    }

    // 3. Headings
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${idx}`} className="font-serif text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4 tracking-tight">
          {renderFormattedText(line.replace(/^## /, ""))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${idx}`} className="font-serif text-xl md:text-2xl font-semibold text-foreground mt-8 mb-3 tracking-tight">
          {renderFormattedText(line.replace(/^### /, ""))}
        </h3>
      );
      continue;
    }

    // 4. Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`quote-${idx}`}
          className="my-6 pl-4 border-l-2 border-accent italic text-muted font-serif text-base bg-accent/5 py-3 pr-4 rounded-r-md"
        >
          {renderFormattedText(line.replace(/^> /, ""))}
        </blockquote>
      );
      continue;
    }

    // 5. Bullet list
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      elements.push(
        <li key={`li-${idx}`} className="ml-5 list-disc text-sm text-muted leading-relaxed my-1">
          {renderFormattedText(line.trim().replace(/^[\*\-]\s+/, ""))}
        </li>
      );
      continue;
    }

    // 6. Horizontal rule
    if (line.trim() === "---") {
      elements.push(<hr key={`hr-${idx}`} className="my-8 border-border/60" />);
      continue;
    }

    // 7. Regular paragraph
    elements.push(
      <p key={`p-${idx}`} className="text-sm md:text-base text-foreground/80 leading-relaxed my-4">
        {renderFormattedText(line)}
      </p>
    );
  }

  return <div className="blog-prose space-y-1">{elements}</div>;
}
