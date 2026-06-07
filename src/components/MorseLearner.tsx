import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, ProgressBar, Row } from 'react-bootstrap';
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

  useEffect(() => {
    setStep(0);
  }, [selectedIndex]);

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

  const handleNextBranch = () => {
    setStep((prev) => Math.min(prev + 1, maxStep));
  };

  const handleReset = () => {
    if (isCurrentCompleted || isWordGap) return;
    setStep(0);
  };

  const handleNextToken = () => {
    const nextIndex = tokens.findIndex((_, idx) => idx > selectedIndex && !completedIndices.has(idx));
    if (nextIndex !== -1) {
      setSelectedIndex(nextIndex);
      setStep(0);
    }
  };

  const tokenButtonStyle = (completed: boolean, active: boolean): React.CSSProperties => ({
    width: 54,
    height: 54,
    borderRadius: 16,
    border: `1px solid ${completed ? 'rgba(232,148,26,0.15)' : active ? COLORS.amber : COLORS.border}`,
    background: completed
      ? 'rgba(255,255,255,0.06)'
      : active
        ? 'linear-gradient(180deg, rgba(240,168,48,0.98), rgba(232,148,26,0.94))'
        : 'rgba(255,255,255,0.02)',
    color: completed ? COLORS.text : active ? '#fff' : COLORS.amber,
    fontWeight: 800,
    fontSize: '1rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'IBM Plex Mono, monospace',
    boxShadow: active ? '0 0 0 4px rgba(232,148,26,0.14)' : 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  });

  const surfaceCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 18, 32, 0.92)',
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 24,
    boxShadow: '0 22px 60px rgba(0,0,0,0.42)',
    backdropFilter: 'blur(12px)',
  };

  return (
    <Container fluid className="py-2 pb-5" style={{ color: COLORS.text }}>
      <Card className="mb-3" style={surfaceCardStyle}>
        <Card.Body style={{ padding: '1.5rem' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: COLORS.amber,
                  marginBottom: '0.5rem',
                  fontWeight: 700,
                }}
              >
                Morse training
              </div>
              <h3 style={{ marginBottom: '0.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Learn each character one square at a time
              </h3>
              <div style={{ color: COLORS.muted, lineHeight: 1.6 }}>
                Select a token, trace the branch, and unlock the reveal.
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Badge
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  padding: '0.55rem 0.75rem',
                  borderRadius: 999,
                }}
              >
                {tokens.length} tokens
              </Badge>
              <Badge
                style={{
                  backgroundColor: 'rgba(232,148,26,0.14)',
                  color: COLORS.amberLight,
                  border: `1px solid ${COLORS.borderStrong}`,
                  padding: '0.55rem 0.75rem',
                  borderRadius: 999,
                }}
              >
                Step {Math.min(step, maxStep)} / {maxStep}
              </Badge>
            </div>
          </div>

          <div
            className="d-flex flex-wrap gap-2"
            style={{
              padding: '0.25rem 0.25rem 0.1rem',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 20,
              overflowX: 'auto',
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
                  aria-label={`Select token ${index + 1}`}
                  title={completed ? `Completed: ${revealedValue}` : `Token ${index + 1}`}
                >
                  {completed ? tokenToReveal(token) : '□'}
                </Button>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <Card style={surfaceCardStyle}>
        <Card.Body style={{ padding: '1.5rem' }}>
          {tokens.length === 0 ? (
            <Alert
              variant="warning"
              className="mb-0"
              style={{
                backgroundColor: 'rgba(232,148,26,0.08)',
                borderColor: COLORS.border,
                color: COLORS.text,
              }}
            >
              No Morse tokens available.
            </Alert>
          ) : (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: COLORS.amber,
                      marginBottom: '0.35rem',
                      fontWeight: 700,
                    }}
                  >
                    Selected token
                  </div>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '1.8rem',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {selectedToken || '—'}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Badge bg="dark" style={{ borderRadius: 999, padding: '0.55rem 0.75rem' }}>
                    {isCurrentCompleted ? 'Completed' : 'In progress'}
                  </Badge>
                  {isWordGap && (
                    <Badge bg="secondary" style={{ borderRadius: 999, padding: '0.55rem 0.75rem' }}>
                      SPACE
                    </Badge>
                  )}
                </div>
              </div>

              <ProgressBar
                now={progress}
                label={`${progress}%`}
                className="mb-4"
                style={{
                  height: 12,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${COLORS.border}`,
                }}
                variant={progress === 100 && maxStep > 0 ? 'warning' : 'warning'}
              />

              <div
                className="mb-4"
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  overflowY: 'visible',
                  paddingBottom: '1rem',
                  borderRadius: 20,
                }}
              >
                <MorseTreePipeline token={selectedToken} step={step} />
              </div>

              <Row className="g-3 mb-4">
                <Col xs={12} lg={6}>
                  <Card
                    style={{
                      backgroundColor: COLORS.surface2,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 20,
                    }}
                  >
                    <Card.Body className="text-center" style={{ padding: '1.5rem' }}>
                      <div
                        style={{
                          color: COLORS.muted,
                          marginBottom: '0.5rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        Reveal
                      </div>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: 800,
                          fontFamily: 'IBM Plex Mono, monospace',
                          letterSpacing: '0.18em',
                          color: COLORS.text,
                        }}
                      >
                        {isCurrentCompleted ? revealedValue : '□□□□'}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12} lg={6}>
                  <Card
                    style={{
                      backgroundColor: COLORS.surface2,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 20,
                    }}
                  >
                    <Card.Body style={{ padding: '1.5rem' }}>
                      <div
                        style={{
                          color: COLORS.muted,
                          marginBottom: '0.6rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        Guidance
                      </div>
                      <div style={{ lineHeight: 1.7, color: COLORS.text }}>
                        Use the tree buttons to step through the path. Each completed token locks in, and
                        you can continue forward through the rest of the message.
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="d-flex flex-wrap gap-2">
                <Button
                  onClick={handleNextBranch}
                  disabled={isWordGap || isCurrentCompleted || step >= maxStep}
                  style={{
                    backgroundColor: COLORS.amber,
                    borderColor: COLORS.amber,
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 14,
                    padding: '0.75rem 1rem',
                  }}
                >
                  Next Branch
                </Button>

                <Button
                  onClick={handleReset}
                  disabled={isWordGap || isCurrentCompleted || step === 0}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: COLORS.border,
                    color: COLORS.text,
                    fontWeight: 700,
                    borderRadius: 14,
                    padding: '0.75rem 1rem',
                  }}
                  variant="outline-light"
                >
                  Reset
                </Button>

                <Button
                  onClick={handleNextToken}
                  disabled={!isCurrentCompleted}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderColor: COLORS.border,
                    color: COLORS.text,
                    fontWeight: 700,
                    borderRadius: 14,
                    padding: '0.75rem 1rem',
                  }}
                  variant="secondary"
                >
                  Next Token
                </Button>
              </div>

              {isCurrentCompleted && !isWordGap && (
                <div style={{ color: COLORS.muted, marginTop: '0.95rem' }}>
                  This character is complete. The square has been revealed and locked.
                </div>
              )}

              {isWordGap && (
                <div style={{ color: COLORS.muted, marginTop: '0.95rem' }}>
                  This token is a word separator, so there is no tree path to traverse.
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};
