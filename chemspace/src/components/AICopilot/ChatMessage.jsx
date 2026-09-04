import React, { useState } from 'react';
import { Bot, User, Terminal, Copy, Check, Info, FileText, Code } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ChatMessage({ message, isLast }) {
  const isAI = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

      // Inline formatting: Bold, Code
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      const formattedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="text-cyan-400 font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={j}
              className="px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-cyan-300 font-mono text-[11px]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      elements.push(
        <p key={i} className="mb-2 leading-relaxed">
          {formattedLine}
        </p>
      );
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
      <div key={key} className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-black/20">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-white/5 text-[var(--text-secondary)] font-bold uppercase tracking-wider">
            <tr>
              {header.map((cell, i) => (
                <th key={i} className="px-3 py-2 border-b border-white/5">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
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
    <div className={`flex gap-3 mb-4 ${isAI ? 'justify-start' : 'justify-end'} group`}>
      {isAI && (
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[88%] space-y-2 ${isAI ? '' : 'flex flex-col items-end'}`}>
        {/* User Attached File Badge */}
        {!isAI && message.attachedFileName && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-cyan-300 text-xs font-mono mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-bold">{message.attachedFileName}</span>
          </div>
        )}

        <div
          className={`relative p-4 rounded-3xl leading-relaxed text-xs ${
            isAI
              ? 'inner-box border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none shadow-xl'
              : 'bg-cyan-500 text-slate-950 font-bold rounded-tr-none shadow-md'
          }`}
        >
          {isAI && (
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-all opacity-0 group-hover:opacity-100"
              title="Copy Response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          <div className="whitespace-pre-wrap">{formatText(message.content)}</div>

          {/* Generated Code Block */}
          {message.codeBlock && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-[#04060b]">
              <div className="bg-white/5 px-3.5 py-2 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">
                    Python RDKit Script
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="telemetry-pill text-[10px] hover:bg-white/10"
                >
                  {codeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{codeCopied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 text-cyan-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {message.codeBlock}
              </pre>
            </div>
          )}
        </div>

        {/* Scientific Logic Core (Thinking Steps) */}
        {isAI && message.thinkingSteps && message.thinkingSteps.length > 0 && (
          <div className="ml-1">
            <details className="group">
              <summary className="text-[10px] text-[var(--text-muted)] cursor-pointer hover:text-cyan-400 transition-all list-none flex items-center gap-2 font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse" />
                Scientific Logic Core
                <span className="opacity-0 group-open:opacity-100 transition-opacity ml-auto text-[9px] lowercase italic font-normal">
                  reasoning validated
                </span>
              </summary>
              <div className="mt-2 pl-3 border-l-2 border-cyan-500/30 space-y-1.5 py-1 font-mono text-[10px] text-[var(--text-secondary)]">
                {message.thinkingSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <Info className="w-3 h-3 text-cyan-400/50 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {!isAI && (
        <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-[var(--text-primary)]">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
