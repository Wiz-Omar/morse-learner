import React, { useMemo } from 'react';
import { Badge, Card } from 'react-bootstrap';

type MorseTreePipelineProps = {
  token: string;
  step: number;
  className?: string;
};

const COLORS = {
  surface: '#0d1220',
  surface2: '#101620',
  amber: '#e8941a',
  amberLight: '#f0a830',
  text: '#e0d6c4',
  muted: '#9aa3b2',
  border: 'rgba(232, 148, 26, 0.18)',
  line: 'rgba(154, 163, 178, 0.45)',
  nodeFill: '#101620',
};

const SVG_WIDTH = 1200;
const TOP_MARGIN = 34;
const LEVEL_GAP = 86;
const PADDING_X = 72;
const NODE_R = 18;
const MAX_RENDER_DEPTH = 6;

function isDotOrDash(char: string): char is '.' | '-' {
  return char === '.' || char === '-';
}

function prefixIndex(symbols: string[], depth: number): number {
  let index = 0;
  for (let i = 0; i < depth; i += 1) {
    index = (index << 1) | (symbols[i] === '-' ? 1 : 0);
  }
  return index;
}

function nodePosition(depth: number, index: number, renderDepth: number) {
  const count = 2 ** depth;
  const span = (SVG_WIDTH - PADDING_X * 2) / count;
  const x = PADDING_X + span * (index + 0.5);
  const y = TOP_MARGIN + depth * LEVEL_GAP;
  return { x, y };
}

function symbolLabel(symbol: '.' | '-') {
  return symbol === '.' ? 'DOT' : 'DASH';
}

export const MorseTreePipeline: React.FC<MorseTreePipelineProps> = ({
  token,
  step,
  className,
}) => {
  const normalizedToken = token.trim();

  const symbols = useMemo(
    () => Array.from(normalizedToken).filter(isDotOrDash),
    [normalizedToken]
  );

  const renderDepth = symbols.length;
  const clampedStep = Math.max(0, Math.min(step, symbols.length));
  const svgHeight = TOP_MARGIN + renderDepth * LEVEL_GAP + NODE_R + 24;

  const activeIndicesByDepth = useMemo(() => {
    const result: Array<number | null> = [0];
    for (let d = 1; d <= renderDepth; d += 1) {
      result[d] = d <= clampedStep ? prefixIndex(symbols, d) : null;
    }
    return result;
  }, [symbols, renderDepth, clampedStep]);

  const isTruncated = symbols.length > MAX_RENDER_DEPTH;
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 18, 32, 0.94)',
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 24,
    boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
    overflow: 'hidden',
  };

  if (!normalizedToken) {
    return (
      <Card className={className ?? 'border-0'} style={cardStyle}>
        <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ color: COLORS.muted }}>No Morse token selected.</div>
        </Card.Body>
      </Card>
    );
  }

  if (normalizedToken === '/') {
    return (
      <Card className={className ?? 'border-0'} style={cardStyle}>
        <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Badge
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 999,
                padding: '0.5rem 0.65rem',
              }}
            >
              SPACE
            </Badge>
            <div style={{ fontWeight: 700 }}>Word gap</div>
          </div>
          <div style={{ color: COLORS.muted }}>
            This token represents a separator, so there is no tree path to traverse.
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={className ?? 'border-0'} style={cardStyle}>
      <Card.Body style={{ padding: '1.25rem 1.5rem 1rem' }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: COLORS.amber,
                marginBottom: '0.4rem',
                fontWeight: 700,
              }}
            >
              Morse tree pipeline
            </div>
            <div style={{ color: COLORS.muted, fontSize: '0.95rem' }}>
              Follow the highlighted branch one step at a time.
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Badge
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 999,
                padding: '0.55rem 0.75rem',
              }}
            >
              Step {Math.min(clampedStep, symbols.length)} / {symbols.length}
            </Badge>
            {isTruncated && (
              <Badge
                bg="warning"
                text="dark"
                style={{ borderRadius: 999, padding: '0.55rem 0.75rem' }}
              >
                truncated view
              </Badge>
            )}
          </div>
        </div>

        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            overflowY: 'visible',
            borderRadius: 20,
            border: `1px solid ${COLORS.border}`,
            background:
              'radial-gradient(circle at top, rgba(232,148,26,0.06), transparent 32%), linear-gradient(180deg, rgba(16,22,32,0.96), rgba(13,18,32,0.96))',
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
            width="100%"
            height={svgHeight}
            preserveAspectRatio="xMidYMin meet"
            role="img"
            aria-label="Morse tree pipeline"
          >
            <defs>
              <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="0" y="0" width={SVG_WIDTH} height={svgHeight} rx="20" fill="transparent" />

            <text
              x={SVG_WIDTH / 2}
              y={18}
              textAnchor="middle"
              fontSize="16"
              fontWeight={700}
              fill={COLORS.text}
            >
              START
            </text>

            {Array.from({ length: renderDepth }, (_, depth) => {
              const parentCount = 2 ** depth;
              const nextDepth = depth + 1;

              return (
                <g key={`depth-${depth}`}>
                  {Array.from({ length: parentCount }, (_, parentIndex) => {
                    const parentPos = nodePosition(depth, parentIndex, renderDepth);
                    const leftChildIndex = parentIndex * 2;
                    const rightChildIndex = parentIndex * 2 + 1;
                    const leftChildPos = nodePosition(nextDepth, leftChildIndex, renderDepth);
                    const rightChildPos = nodePosition(nextDepth, rightChildIndex, renderDepth);

                    const activePathIndex = activeIndicesByDepth[nextDepth];
                    const activeLeft =
                      activePathIndex !== null && activePathIndex === leftChildIndex;
                    const activeRight =
                      activePathIndex !== null && activePathIndex === rightChildIndex;

                    return (
                      <g key={`edge-${depth}-${parentIndex}`}>
                        <line
                          x1={parentPos.x}
                          y1={parentPos.y}
                          x2={leftChildPos.x}
                          y2={leftChildPos.y}
                          stroke={activeLeft ? COLORS.amber : COLORS.line}
                          strokeWidth={activeLeft ? 7 : 3}
                          strokeLinecap="round"
                          opacity={activeLeft ? 1 : 0.55}
                          filter={activeLeft ? 'url(#softGlow)' : undefined}
                        />
                        <line
                          x1={parentPos.x}
                          y1={parentPos.y}
                          x2={rightChildPos.x}
                          y2={rightChildPos.y}
                          stroke={activeRight ? COLORS.amber : COLORS.line}
                          strokeWidth={activeRight ? 7 : 3}
                          strokeLinecap="round"
                          opacity={activeRight ? 1 : 0.55}
                          filter={activeRight ? 'url(#softGlow)' : undefined}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {Array.from({ length: renderDepth + 1 }, (_, depth) => {
              const count = 2 ** depth;

              return (
                <g key={`nodes-${depth}`}>
                  {Array.from({ length: count }, (_, index) => {
                    const pos = nodePosition(depth, index, renderDepth);
                    const activeIndex = activeIndicesByDepth[depth];
                    const isActive = activeIndex !== null && activeIndex === index;
                    const isCurrent = depth === clampedStep;

                    return (
                      <g key={`node-${depth}-${index}`}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={NODE_R}
                          fill={isActive ? COLORS.amber : COLORS.nodeFill}
                          stroke={isActive ? COLORS.text : 'rgba(255,255,255,0.18)'}
                          strokeWidth={isActive ? 4 : 2}
                        />
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={NODE_R - 7}
                          fill={isActive ? '#fff' : COLORS.surface}
                          opacity={isCurrent && isActive ? 0.12 : 0}
                        />
                        {depth > 0 && isActive && (
                          <text
                            x={pos.x}
                            y={pos.y + 5}
                            textAnchor="middle"
                            fontSize="14"
                            fontWeight={800}
                            fill={COLORS.text}
                          >
                            {depth <= clampedStep ? symbolLabel(symbols[depth - 1]) : ''}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {symbols.slice(0, clampedStep).map((symbol, depth) => {
              const nextDepth = depth + 1;
              const parentIndex = prefixIndex(symbols, depth);
              const childIndex = prefixIndex(symbols, nextDepth);
              const parentPos = nodePosition(depth, parentIndex, renderDepth);
              const childPos = nodePosition(nextDepth, childIndex, renderDepth);

              return (
                <g key={`active-${depth}`}>
                  <line
                    x1={parentPos.x}
                    y1={parentPos.y}
                    x2={childPos.x}
                    y2={childPos.y}
                    stroke="#000"
                    strokeWidth={10}
                    strokeLinecap="round"
                    opacity={0.16}
                  />
                  <text
                    x={(parentPos.x + childPos.x) / 2}
                    y={(parentPos.y + childPos.y) / 2 - 8}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight={700}
                    fill={symbol === '.' ? COLORS.amberLight : COLORS.amber}
                  >
                    {symbol === '.' ? 'DOT' : 'DASH'}
                  </text>
                </g>
              );
            })}

            {isTruncated && (
              <text
                x={SVG_WIDTH / 2}
                y={svgHeight - 10}
                textAnchor="middle"
                fontSize="13"
                fill={COLORS.muted}
              >
                Only the first {MAX_RENDER_DEPTH} symbols are drawn in the tree.
              </text>
            )}
          </svg>
        </div>
      </Card.Body>
    </Card>
  );
};
