import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  return (
    <div className="bg-gray-900 rounded-lg my-2 overflow-hidden relative group">
      <div className="flex justify-between items-center px-4 py-1 bg-gray-800 text-xs text-gray-400">
        <span>{language}</span>
        <CopyButton textToCopy={code} />
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem' }}
        codeTagProps={{ style: { fontSize: '0.875rem' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};