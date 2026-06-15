import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Container, ProgressBar } from 'react-bootstrap';
import { MorseTreePipeline } from './MorseTreePipeline';
import { reverseMorseCode } from '../types/morse';
import './MorseLearner-style.css';

type Props = {
  tokens: string[];
};

const COLORS = {
  amber: '#e8941a',
  amberLight: '#f0a830',
  text: '#e0d6c4',
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
    <div className="ml-pattern-container">
      {symbols.map((s, i) => (
        <div
          key={i}
          className={`ml-symbol ${s === '.' ? 'ml-symbol--dot' : 'ml-symbol--dash'}`}
        />
      ))}
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

  // Conditional — must stay inline
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
    color: completed ? '#9aa3b2' : active ? '#fff' : COLORS.amber,
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

  // Conditional — must stay inline
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
      <div className="ml-sticky-panel">
        <Card className="ml-sticky-card">
          <Card.Body>

            {/* Token grid */}
            <div className="d-flex gap-2 ml-token-grid">
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

              {/* Morse pattern */}
              <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                <div className="ml-section-label">Pattern</div>
                {isWordGap ? (
                  <Badge className="ml-word-gap-badge">SPACE — word separator</Badge>
                ) : (
                  <MorsePattern token={selectedToken} />
                )}
              </div>

              {/* Revealed letter — conditional style must stay inline */}
              <div style={{ textAlign: 'center', minWidth: 52 }}>
                <div className="ml-section-label">Letter</div>
                <div className='letter-reveal' style={{
                  color: isCurrentCompleted ? COLORS.amberLight : 'rgba(200,180,140,0.25)',
                  filter: isCurrentCompleted ? 'none' : 'blur(5px)',
                  userSelect: isCurrentCompleted ? 'auto' : 'none',
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
              <Badge className="ml-step-badge">
                {Math.min(step, maxStep)} / {maxStep}
              </Badge>
            </div>

            {/* Progress bar */}
            <ProgressBar
              now={progress}
              className="ml-progress-bar mt-3"
              variant="warning"
            />
          </Card.Body>
        </Card>
      </div>

      {/* ── Tree card ────────────────────────────────────── */}
      {tokens.length === 0 ? (
        <Alert variant="warning" className="ml-no-tokens-alert">
          No Morse tokens available.
        </Alert>
      ) : (
        <Card className="ml-tree-card">
          <Card.Body>

            {/* Guidance */}
            <div className="ml-guidance-box">
              <span className="ml-guidance-icon">↓</span>
              <span className="ml-guidance-text">
                Follow the highlighted path through the tree.{' '}
                <strong>Next Branch</strong> steps forward one symbol at a time.
                Complete all branches to reveal the letter above.{' '}
                <strong>Next Token</strong> moves on once a letter is locked in.
              </span>
            </div>

            {/* Tree */}
            <div className="ml-tree-scroll">
              <MorseTreePipeline token={selectedToken} step={step} />
            </div>

            {/* State hints */}
            {isCurrentCompleted && !isWordGap && (
              <div className="ml-state-hint">
                ✓ Character complete — letter revealed and locked above.
              </div>
            )}
            {isWordGap && (
              <div className="ml-state-hint">
                This token is a word gap — no tree path to traverse.
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};
