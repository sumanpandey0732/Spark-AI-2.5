import React from 'react';

interface GroundingCitationsProps {
  citations: { uri: string; title: string }[];
}

export const GroundingCitations: React.FC<GroundingCitationsProps> = ({ citations }) => {
  return (
    <div className="mt-4 border-t border-gray-600 pt-2">
      <h4 className="text-sm font-semibold text-gray-400 mb-2">Sources:</h4>
      <ol className="list-decimal list-inside space-y-1">
        {citations.map((citation, index) => (
          <li key={index} className="text-xs">
            <a
              href={citation.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gemini-blue hover:underline break-all"
              title={citation.title}
            >
              {citation.title || new URL(citation.uri).hostname}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
};