import React, { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, VolumeX, RotateCcw, Terminal, BookOpen, Globe, Wrench, ExternalLink } from 'lucide-react';
import { isSmilesString } from '../../services/chemicalResolver';
import { aiCopilot } from '../../services/aiCopilotService';

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
      <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">
        {code}
      </code>
      {isSmiles && (
        <button
          onClick={handleCopy}
          className="p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-emerald-400 transition cursor-pointer"
          title="Copy SMILES"
        >
          {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      )}
    </span>
  );
}

export default function ChatMessage({ message, isLast, onRegenerate }) {
  const isAI = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!message.content) return;
    if (isSpeaking) {
      aiCopilot.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      aiCopilot.speak(
        message.content,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const formatText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let currentTable = null;
    let inCodeBlock = false;
    let codeContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks (```python ... ```)
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeContent = [];
        } else {
          inCodeBlock = false;
          const codeString = codeContent.join('\n');
          elements.push(
            <div key={`code-${i}`} className="my-2 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-input)]">
              <div className="bg-[var(--bg-inner)] px-3 py-1.5 border-b border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  Code
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeString);
                    setCodeCopied(true);
                    setTimeout(() => setCodeCopied(false), 2000);
                  }}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  {codeCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 text-[11px] font-mono text-emerald-500 dark:text-emerald-300 overflow-x-auto leading-relaxed">
                {codeString}
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Table lines (| Col 1 | Col 2 |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!currentTable) currentTable = [];
        const cells = line
          .split('|')
          .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((c) => c.trim());
        if (cells.length > 0) currentTable.push(cells);
        continue;
      } else if (currentTable) {
        elements.push(renderTable(currentTable, `table-${i}`));
        currentTable = null;
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xs font-bold text-[var(--text-primary)] mt-3 mb-1">
            {line.replace(/^###\s+/, '')}
          </h3>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-[13px] font-bold text-[var(--text-primary)] mt-3 mb-1">
            {line.replace(/^##\s+/, '')}
          </h2>
        );
        continue;
      }

      // Bullets
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('- ');
      const cleanLine = isBullet ? line.trim().replace(/^[•\-]\s*/, '') : line;

      // Inline formatting
      const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
      const formattedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-bold text-[var(--text-primary)]">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <InlineCodePill key={j} code={part.slice(1, -1)} />;
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          return <em key={j} className="italic text-[var(--text-secondary)]">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (isBullet) {
        elements.push(
          <div key={i} className="flex items-start gap-2 mb-1 pl-1 leading-relaxed">
            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
            <div className="flex-1">{formattedLine}</div>
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-1.5" />);
      } else {
        elements.push(
          <p key={i} className="mb-1.5 leading-relaxed">
            {formattedLine}
          </p>
        );
      }
    }

    if (currentTable) {
      elements.push(renderTable(currentTable, 'table-end'));
    }

    return elements;
  };

  const renderTable = (rows, key) => {
    if (rows.length < 2) return null;
    const header = rows[0];
    const data = rows.slice(rows[1][0].includes('---') ? 2 : 1);

    return (
      <div key={key} className="my-2.5 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)]">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead className="bg-[var(--bg-hover)] text-[var(--text-secondary)] font-bold">
            <tr>
              {header.map((cell, i) => (
                <th key={i} className="px-2.5 py-1.5 border-b border-[var(--border-subtle)]">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[var(--bg-hover)] transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-2.5 py-1 text-[var(--text-primary)]">
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
    <div className={`flex gap-2.5 mb-3 ${isAI ? 'justify-start' : 'justify-end'} group`}>
      {isAI && (
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5" />
        </div>
      )}

      <div className={`max-w-[88%] space-y-1.5 ${isAI ? '' : 'flex flex-col items-end'}`}>
        {/* Step 8 Indicators for RAG, Web Research, Chemistry Tools */}
        {isAI && (message.metadata?.mode || (message.tools && message.tools.length > 0) || (message.citations && message.citations.length > 0)) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-1 select-none">
            {message.metadata?.mode === 'web_research_plus_rag' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                <Globe className="w-2.5 h-2.5" />
                Web Research
              </span>
            )}
            {(message.metadata?.mode === 'rag_knowledge_base' || (message.citations && message.citations.length > 0 && message.metadata?.mode !== 'web_research_plus_rag')) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-2.5 h-2.5" />
                Knowledge Search
              </span>
            )}
            {message.tools && message.tools.map((t, idx) => {
              const nameMap = { rdkit: 'RDKit', chemdraw: 'ChemDraw', spectroscopy: 'Spectroscopy', ibm_rxn: 'IBM RXN', quantum: 'Quantum' };
              const toolLabel = nameMap[t.tool] || t.tool?.toUpperCase();
              return (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Wrench className="w-2.5 h-2.5" />
                  {toolLabel}
                </span>
              );
            })}
          </div>
        )}

        <div
          className={`relative p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
            isAI
              ? 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm shadow-sm'
              : 'bg-emerald-600 text-white rounded-tr-sm shadow-sm font-medium'
          }`}
        >
          {/* AI Message Action Toolbar */}
          {isAI && message.content && (
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleToggleSpeech}
                className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-emerald-400 transition cursor-pointer"
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
                  title="Regenerate"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="whitespace-pre-wrap">{formatText(message.content)}</div>

          {/* Citations / Sources */}
          {isAI && message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] space-y-1">
              <div className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[9px] text-[var(--text-secondary)]">
                <BookOpen className="w-2.5 h-2.5 text-emerald-400" />
                Verified Sources
              </div>
              <div className="space-y-1">
                {message.citations.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-mono text-[10px]">[{idx + 1}]</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {c.title || c.source}
                      {c.domain && <span className="ml-1 text-[var(--text-muted)] font-normal font-mono text-[10px]">({c.domain})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isAI && (
        <div className="w-7 h-7 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
