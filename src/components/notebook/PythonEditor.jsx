import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Lightweight, high-precision Python Syntax Highlighter
 */
function highlightPython(code) {
  if (!code) return '';

  // Escape HTML characters
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Tokenize and highlight lines
  const lines = escaped.split('\n');
  const highlightedLines = lines.map((line) => {
    // Comments
    if (line.trim().startsWith('#')) {
      return `<span class="text-slate-400 dark:text-slate-500 italic">${line}</span>`;
    }

    let l = line;

    // Strings (single and double quoted)
    l = l.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
      return `<span class="text-amber-600 dark:text-amber-400 font-medium">${match}</span>`;
    });

    // Keywords
    const keywords = [
      'from', 'import', 'as', 'def', 'class', 'return', 'if', 'elif', 'else',
      'for', 'while', 'in', 'is', 'not', 'and', 'or', 'try', 'except', 'finally',
      'with', 'lambda', 'yield', 'break', 'continue', 'pass', 'raise', 'global',
      'True', 'False', 'None'
    ];
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      l = l.replace(regex, '<span class="text-purple-600 dark:text-purple-400 font-semibold">$1</span>');
    });

    // RDKit & Chemical symbols
    const rdkitTokens = [
      'Chem', 'AllChem', 'Descriptors', 'Lipinski', 'DataStructs', 'Draw',
      'MolFromSmiles', 'MolToSmiles', 'MolWt', 'MolLogP', 'TPSA', 'EmbedMolecule',
      'MMFFOptimizeMolecule', 'AddHs', 'RemoveHs', 'CalcMolFormula', 'GetNumAtoms',
      'GetNumHeavyAtoms', 'GetConformer', 'GetAtomPosition'
    ];
    rdkitTokens.forEach((token) => {
      const regex = new RegExp(`\\b(${token})\\b`, 'g');
      l = l.replace(regex, '<span class="text-emerald-600 dark:text-emerald-400 font-bold">$1</span>');
    });

    // Standard Built-ins
    const builtins = ['print', 'len', 'range', 'enumerate', 'int', 'float', 'str', 'list', 'dict', 'set', 'round', 'sum', 'min', 'max'];
    builtins.forEach((fn) => {
      const regex = new RegExp(`\\b(${fn})\\b(?=\\()`, 'g');
      l = l.replace(regex, '<span class="text-sky-600 dark:text-sky-400 font-medium">$1</span>');
    });

    // Numbers
    l = l.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-rose-500 dark:text-rose-400">$1</span>');

    return l;
  });

  return highlightedLines.join('\n');
}

export default function PythonEditor({
  code = '',
  onChange,
  onRun,
  onRunAndAdvance,
  readOnly = false,
  minHeight = 72
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textareaRef = useRef(null);
  const preRef = useRef(null);

  const lines = code.split('\n');
  const lineCount = lines.length;

  // Synchronize scroll between textarea and syntax highlight pre
  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  // Keyboard shortcut handler for notebook execution
  const handleKeyDown = (e) => {
    // Shift+Enter: Run and Advance
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      if (onRunAndAdvance) onRunAndAdvance();
      else if (onRun) onRun();
      return;
    }

    // Ctrl+Enter or Cmd+Enter: Run in place
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (onRun) onRun();
      return;
    }

    // Tab key: Insert 4 spaces
    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      if (onChange) onChange(newCode);

      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div
      className={`relative w-full rounded-lg border transition-colors flex items-stretch font-mono text-[13px] leading-[22px] select-text overflow-hidden ${
        isDark
          ? 'bg-[#0d0f17] border-white/10 text-slate-100 focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20'
          : 'bg-[#faf8f2] border-stone-200/90 text-stone-900 focus-within:border-emerald-600/50 focus-within:ring-1 focus-within:ring-emerald-600/15'
      }`}
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Line Numbers Gutter */}
      <div
        aria-hidden="true"
        className={`w-10 sm:w-12 shrink-0 py-2.5 select-none text-right pr-3 font-mono text-[11px] leading-[22px] border-r ${
          isDark
            ? 'bg-[#0a0c13] text-slate-600 border-white/5'
            : 'bg-[#f4f1ea] text-stone-400 border-stone-200/70'
        }`}
      >
        {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Editor & Highlight Container */}
      <div className="relative flex-1 min-w-0 overflow-hidden">
        {/* Syntax Highlighted Underlay */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 m-0 py-2.5 px-3.5 font-mono text-[13px] leading-[22px] pointer-events-none overflow-hidden whitespace-pre-wrap break-words z-0"
          dangerouslySetInnerHTML={{ __html: highlightPython(code) + '\n' }}
        />

        {/* Editable Transparent Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="relative z-10 w-full h-full m-0 py-2.5 px-3.5 font-mono text-[13px] leading-[22px] bg-transparent text-transparent caret-emerald-500 resize-none outline-none border-none whitespace-pre-wrap break-words selection:bg-emerald-500/25 dark:selection:bg-emerald-500/35"
          style={{ minHeight: `${minHeight}px` }}
          rows={Math.max(lineCount, 2)}
        />
      </div>
    </div>
  );
}
