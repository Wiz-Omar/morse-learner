import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Container, ProgressBar } from 'react-bootstrap';
import { MorseTreePipeline } from './MorseTreePipeline';
import { reverseMorseCode } from '../types/morse';

type Props = {
  tokens: string[];
};

const COLORS = {
  bg: '#07090f',
  surface: '#0d1220',
  surface2: '#101620',
  amber: '#e8941a',
  amberLight: '#f0a830',
  text: '#e0d6c4',
  muted: '#9aa3b2',
  border: 'rgba(232, 148, 26, 0.18)',
  borderStrong: 'rgba(232, 148, 26, 0.3)',
};

function isDotOrDash(char: string): char is '.' | '-' {
  return char === '.' || char === '-';
}

function tokenLength(token: string): number {
  return Array.from(token).filter(isDotOrDash).length;
}

function tokenToReveal(token: string): string {
  if (token === '/') return '␠';
  const letter = reverseMorseCode[token];
  return letter ? String(letter).toUpperCase() : '?';
}

/** Renders dots and dashes as visual shapes */
function MorsePattern({ token }: { token: string }) {
  const symbols = Array.from(token).filter(isDotOrDash);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {symbols.map((s, i) => (
        <div
          key={i}
          style={{
            backgroundColor: COLORS.amber,
            borderRadius: s === '.' ? '50%' : 3,
            width: s === '.' ? 13 : 34,
            height: 13,
            flexShrink: 0,
            boxShadow: `0 0 6px rgba(232,148,26,0.5)`,
          }}
        />
      ))}
      <span
        style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '1rem',
          color: COLORS.muted,
          letterSpacing: '0.18em',
          marginLeft: 6,
        }}
      >
        {token}
      </span>
    </div>
  );
}

export const MorseLearner: React.FC<Props> = ({ tokens }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [step, setStep] = useState<number>(0);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());

  const selectedToken = tokens[selectedIndex] ?? '';
  const isWordGap = selectedToken === '/';
  const maxStep = useMemo(() => {
    if (!selectedToken) return 0;
    if (isWordGap) return 0;
    return tokenLength(selectedToken);
  }, [selectedToken, isWordGap]);

  const isCurrentCompleted = completedIndices.has(selectedIndex);
  const revealedValue = useMemo(() => tokenToReveal(selectedToken), [selectedToken]);
  const progress = maxStep === 0 ? 0 : Math.round((Math.min(step, maxStep) / maxStep) * 100);

  useEffect(() => {
    setSelectedIndex(0);
    setStep(0);
    setCompletedIndices(new Set());
  }, [tokens]);

  useEffect(() => { setStep(0); }, [selectedIndex]);

  useEffect(() => {
    if (!selectedToken) return;
    const tokenIsDone = isWordGap || step >= maxStep;
    if (!tokenIsDone) return;
    setCompletedIndices((prev) => {
      if (prev.has(selectedIndex)) return prev;
      const next = new Set(prev);
      next.add(selectedIndex);
      return next;
    });
  }, [step, maxStep, isWordGap, selectedIndex, selectedToken]);

  const handleSelectToken = (index: number) => {
    if (completedIndices.has(index)) return;
    setSelectedIndex(index);
    setStep(0);
  };

  const handleNextBranch = () => setStep((prev) => Math.min(prev + 1, maxStep));
  const handleReset = () => { if (!isCurrentCompleted && !isWordGap) setStep(0); };
  const handleNextToken = () => {
    const nextIndex = tokens.findIndex((_, idx) => idx > selectedIndex && !completedIndices.has(idx));
    if (nextIndex !== -1) { setSelectedIndex(nextIndex); setStep(0); }
  };

  const tokenButtonStyle = (completed: boolean, active: boolean): React.CSSProperties => ({
    width: 48,
    height: 48,
    borderRadius: 13,
    border: `1px solid ${completed ? 'rgba(232,148,26,0.12)' : active ? COLORS.amber : COLORS.border}`,
    background: completed
      ? 'rgba(255,255,255,0.05)'
      : active
        ? 'linear-gradient(180deg, rgba(240,168,48,0.98), rgba(232,148,26,0.94))'
        : 'rgba(255,255,255,0.02)',
    color: completed ? COLORS.muted : active ? '#fff' : COLORS.amber,
    fontWeight: 800,
    fontSize: '0.92rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'IBM Plex Mono, monospace',
    boxShadow: active ? '0 0 0 4px rgba(232,148,26,0.14)' : 'none',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    flexShrink: 0,
  });

  const stickyCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(10, 14, 26, 0.97)',
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(16px)',
  };

  const treeCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 18, 32, 0.92)',
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    boxShadow: '0 18px 50px rgba(0,0,0,0.38)',
    backdropFilter: 'blur(12px)',
  };

  const btnStyle = (primary?: boolean): React.CSSProperties => ({
    backgroundColor: primary ? COLORS.amber : 'transparent',
    borderColor: primary ? COLORS.amber : COLORS.border,
    color: primary ? '#fff' : COLORS.text,
    fontWeight: 700,
    borderRadius: 11,
    padding: '0.55rem 0.9rem',
    fontSize: '0.83rem',
    letterSpacing: '0.02em',
  });

  return (
    <Container fluid className="pb-5" style={{ color: COLORS.text, paddingTop: '0.75rem' }}>

      {/* ── Sticky top panel ─────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, marginBottom: '1rem' }}>
        <Card style={stickyCardStyle}>
          <Card.Body style={{ padding: '1rem 1.25rem 0.85rem' }}>

            {/* Token grid */}
            <div
              className="d-flex gap-2"
              style={{
                overflowX: 'auto',
                padding: '0.4rem 0.5rem',
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                marginBottom: '0.85rem',
                flexWrap: 'wrap',
              }}
            >
              {tokens.map((token, index) => {
                const completed = completedIndices.has(index);
                const active = index === selectedIndex;
                return (
                  <Button
                    key={`${index}-${token}`}
                    type="button"
                    variant="link"
                    onClick={() => handleSelectToken(index)}
                    disabled={completed}
                    style={tokenButtonStyle(completed, active)}
                    title={completed ? tokenToReveal(token) : `Token ${index + 1}`}
                  >
                    {completed ? tokenToReveal(token) : '□'}
                  </Button>
                );
              })}
            </div>

            {/* Current token info row */}
            <div className="d-flex flex-wrap align-items-center gap-3">

              {/* Morse pattern - always visible */}
              <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: COLORS.amber, marginBottom: 7, fontWeight: 700 }}>
                  Pattern
                </div>
                {isWordGap ? (
                  <Badge style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 999, padding: '0.4rem 0.75rem' }}>
                    SPACE — word separator
                  </Badge>
                ) : (
                  <MorsePattern token={selectedToken} />
                )}
              </div>

              {/* Revealed letter - blurred until complete */}
              <div style={{ textAlign: 'center', minWidth: 52 }}>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: COLORS.amber, marginBottom: 4, fontWeight: 700 }}>
                  Letter
                </div>
                <div style={{
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  fontFamily: 'IBM Plex Mono, monospace',
                  color: isCurrentCompleted ? COLORS.amberLight : 'rgba(200,180,140,0.25)',
                  filter: isCurrentCompleted ? 'none' : 'blur(5px)',
                  transition: 'filter 0.4s ease, color 0.4s ease',
                  userSelect: isCurrentCompleted ? 'auto' : 'none',
                  lineHeight: 1,
                }}>
                  {revealedValue}
                </div>
              </div>

              {/* Controls */}
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  onClick={handleNextBranch}
                  disabled={isWordGap || isCurrentCompleted || step >= maxStep}
                  style={btnStyle(true)}
                >
                  Next Branch
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={isWordGap || isCurrentCompleted || step === 0}
                  style={btnStyle()}
                  variant="outline-light"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleNextToken}
                  disabled={!isCurrentCompleted}
                  style={btnStyle()}
                  variant="secondary"
                >
                  Next Token
                </Button>
              </div>

              {/* Step counter */}
              <Badge style={{
                backgroundColor: 'rgba(232,148,26,0.12)',
                color: COLORS.amberLight,
                border: `1px solid ${COLORS.borderStrong}`,
                padding: '0.45rem 0.7rem',
                borderRadius: 999,
                fontSize: '0.78rem',
                fontFamily: 'IBM Plex Mono, monospace',
                whiteSpace: 'nowrap',
              }}>
                {Math.min(step, maxStep)} / {maxStep}
              </Badge>
            </div>

            {/* Thin progress bar */}
            <ProgressBar
              now={progress}
              className="mt-3"
              style={{ height: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', border: 'none' }}
              variant="warning"
            />
          </Card.Body>
        </Card>
      </div>

      {/* ── Tree card ────────────────────────────────────── */}
      {tokens.length === 0 ? (
        <Alert variant="warning" style={{ backgroundColor: 'rgba(232,148,26,0.08)', borderColor: COLORS.border, color: COLORS.text }}>
          No Morse tokens available.
        </Alert>
      ) : (
        <Card style={treeCardStyle}>
          <Card.Body style={{ padding: '1.25rem 1.5rem' }}>

            {/* Guidance — one-time read, above tree */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              backgroundColor: 'rgba(232,148,26,0.05)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 13,
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.87rem',
              lineHeight: 1.65,
              color: COLORS.muted,
            }}>
              <span style={{ color: COLORS.amber, fontSize: '1rem', marginTop: 1, flexShrink: 0 }}>↓</span>
              <span>
                Follow the highlighted path through the tree.{' '}
                <strong style={{ color: COLORS.text, fontWeight: 600 }}>Next Branch</strong> steps forward one symbol at a time.
                Complete all branches to reveal the letter above.{' '}
                <strong style={{ color: COLORS.text, fontWeight: 600 }}>Next Token</strong> moves on once a letter is locked in.
              </span>
            </div>

            {/* Tree */}
            <div style={{ width: '100%', overflowX: 'auto', overflowY: 'visible' }}>
              <MorseTreePipeline token={selectedToken} step={step} />
            </div>

            {/* State hints below tree */}
            {isCurrentCompleted && !isWordGap && (
              <div style={{ color: COLORS.muted, marginTop: '0.85rem', fontSize: '0.87rem' }}>
                ✓ Character complete — letter revealed and locked above.
              </div>
            )}
            {isWordGap && (
              <div style={{ color: COLORS.muted, marginTop: '0.85rem', fontSize: '0.87rem' }}>
                This token is a word gap — no tree path to traverse.
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};
