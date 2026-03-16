import React from 'react';
import { parseAnsi } from '@/utils/ansiParser';

interface AnsiLineProps {
  text: string;
}

function AnsiLineInner({ text }: AnsiLineProps) {
  const spans = parseAnsi(text);
  return (
    <>
      {spans.map((span, i) => (
        <span key={i} style={span.style}>
          {span.text}
        </span>
      ))}
    </>
  );
}

const AnsiLine = React.memo(AnsiLineInner);
export default AnsiLine;
