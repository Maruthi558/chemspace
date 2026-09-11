import React, { useState } from 'react';
import { Bot, User, Terminal, Copy, Check, Info, FileText, Atom } from 'lucide-react';
import { isSmilesString } from '../../services/chemicalResolver';

/**
 * Inline code pill with 1-click copy support for SMILES and chemical tokens
 */
function InlineCodePill({ code }) {
  const [copied, setCopied] = useState(false);
  const isSmiles = isSmilesString(code) || (code.length >= 2 && /[=#\(\)1-9@]/.test(code));

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1 mx-0.5 align-middle">
      <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
        {code}
      </code>
      {isSmiles && (
        <button
          onClick={handleCopy}
          className="p-0.5 rounded bg-[var(--bg-hover)] hover:bg-[var(--border-subtle)] text-[var(--text-muted)] hover:text-emerald-400 transition cursor-pointer"
          title="Copy SMILES string"
        >
          {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      )}
    </span>
  );
}

export default function ChatMessage({ message, isLast }) {
  const isAI = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (!message.codeBlock) return;
    navigator.clipboard.writeText(message.codeBlock);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const formatText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let currentTable = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table Detection (| Col 1 | Col 2 |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!currentTable) {
          currentTable = [];
        }
        const cells = line
          .split('|')
          .filter((c) => c.trim().length > 0 || line.includes('---'))
          .map((c) => c.trim());
        if (cells.length > 0) {
          currentTable.push(cells);
        }
        continue;
      } else {
        if (currentTable) {
          elements.push(renderTable(currentTable, i));
          currentTable = null;
        }
      }

      // Bullet points
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const cleanLine = isBullet ? line.trim().replace(/^[•\-]\s*/, '') : line;

      // Inline formatting: Bold, Code, Italic
      const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
      const formattedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="text-[var(--text-primary)] font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <InlineCodePill key={j} code={part.slice(1, -1)} />;
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          return (
            <em key={j} className="text-[var(--text-secondary)] italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });

      if (isBullet) {
        elements.push(
          <div key={i} className="flex items-start gap-2 mb-1.5 pl-1 leading-relaxed">
            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
            <div className="flex-1">{formattedLine}</div>
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="mb-2 leading-relaxed">
            {formattedLine}
          </p>
        );
      }
    }

    if (currentTable) {
      elements.push(renderTable(currentTable, lines.length));
    }

    return elements;
  };

  const renderTable = (rows, key) => {
    if (rows.length < 2) return null;
    const header = rows[0];
    const data = rows.slice(rows[1][0].includes('---') ? 2 : 1);

    return (
      <div key={key} className="my-3 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)]">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-[var(--bg-hover)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
            <tr>
              {header.map((cell, i) => (
                <th key={i} className="px-3 py-2 border-b border-[var(--border-subtle)]">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[var(--bg-hover)] transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-1.5 text-[var(--text-primary)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`flex gap-2.5 sm:gap-3 mb-4 ${isAI ? 'justify-start' : 'justify-end'} group`}>
      {isAI && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-sm text-emerald-400 mt-0.5">
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      )}

      <div className={`max-w-[88%] sm:max-w-[84%] space-y-2 ${isAI ? '' : 'flex flex-col items-end'}`}>
        {/* User Attached File Badge */}
        {!isAI && message.attachedFileName && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-emerald-400 text-xs font-mono mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-bold">{message.attachedFileName}</span>
          </div>
        )}

        <div
          className={`relative p-3.5 sm:p-4 rounded-2xl leading-relaxed text-xs sm:text-[13px] ${
            isAI
              ? 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm shadow-sm'
              : 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium rounded-tr-sm shadow-sm'
          }`}
        >
          {isAI && (
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          <div className="whitespace-pre-wrap">{formatText(message.content)}</div>

          {/* Generated Code Block */}
          {message.codeBlock && (
            <div className="mt-3 rounded-xl overflow-hidden border border-[var(--border-medium)] shadow-md bg-[var(--bg-input)]">
              <div className="bg-[var(--bg-inner)] px-3.5 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase tracking-widest">
                    Python RDKit Script
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="telemetry-pill text-[10px] hover:bg-[var(--bg-hover)] cursor-pointer flex items-center gap-1"
                >
                  {codeCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{codeCopied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-3.5 sm:p-4 text-emerald-500 dark:text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {message.codeBlock}
              </pre>
            </div>
          )}
        </div>

        {/* Scientific Logic Core (Thinking Steps) */}
        {isAI && message.thinkingSteps && message.thinkingSteps.length > 0 && (
          <div className="ml-1">
            <details className="group">
              <summary className="text-[10px] text-[var(--text-muted)] cursor-pointer hover:text-emerald-400 transition-all list-none flex items-center gap-2 font-bold uppercase tracking-wider select-none">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Scientific Reasoning Chain
                <span className="opacity-0 group-open:opacity-100 transition-opacity ml-auto text-[9px] lowercase italic font-normal">
                  validated
                </span>
              </summary>
              <div className="mt-2 pl-3 border-l-2 border-emerald-500/30 space-y-1.5 py-1 font-mono text-[10px] text-[var(--text-secondary)]">
                {message.thinkingSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <Info className="w-3 h-3 text-emerald-500/60 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {!isAI && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-[var(--text-secondary)] shadow-sm mt-0.5">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      )}
    </div>
  );
}
