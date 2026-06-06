// src/components/MorseLearner.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, ProgressBar, Row } from 'react-bootstrap';
import { MorseTreePipeline } from './MorseTreePipeline';
import { reverseMorseCode } from '../types/morse';

type Props = {
  tokens: string[];
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

  return (
    <Container fluid className="py-3 pb-5">
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <h3 className="mb-2">Morse Training</h3>
          <div className="text-muted mb-3">
            Select a square, trace the Morse tree, then move to the next one.
          </div>

          <div className="d-flex flex-wrap gap-2">
            {tokens.map((token, index) => {
              const completed = completedIndices.has(index);
              const active = index === selectedIndex;

              return (
                <Button
                  key={`${index}-${token}`}
                  type="button"
                  variant={completed ? 'secondary' : active ? 'warning' : 'outline-secondary'}
                  onClick={() => handleSelectToken(index)}
                  disabled={completed}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                  }}
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

      <Card className="shadow-sm border-0">
        <Card.Body>
          {tokens.length === 0 ? (
            <Alert variant="warning" className="mb-0">
              No Morse tokens available.
            </Alert>
          ) : (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                  <div className="fw-semibold">Selected token</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.5rem' }}>
                    {selectedToken || '—'}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Badge bg="dark">
                    Step {Math.min(step, maxStep)} / {maxStep}
                  </Badge>
                  {isWordGap && <Badge bg="secondary">SPACE</Badge>}
                  {isCurrentCompleted && <Badge bg="success">Done</Badge>}
                </div>
              </div>

              <ProgressBar
                now={progress}
                label={`${progress}%`}
                className="mb-4"
                variant={progress === 100 && maxStep > 0 ? 'success' : 'warning'}
              />

              <div
                className="mb-4"
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  overflowY: 'visible',
                  paddingBottom: '1rem',
                }}
              >
                <MorseTreePipeline token={selectedToken} step={step} />
              </div>

              <Row className="g-3 mb-4">
                <Col>
                  <Card className="border-0 bg-light">
                    <Card.Body className="text-center">
                      <div className="text-muted mb-2">Reveal</div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {isCurrentCompleted ? revealedValue : '□□□□'}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="dark"
                  onClick={handleNextBranch}
                  disabled={isWordGap || isCurrentCompleted || step >= maxStep}
                >
                  Next Branch
                </Button>

                <Button
                  variant="outline-dark"
                  onClick={handleReset}
                  disabled={isWordGap || isCurrentCompleted || step === 0}
                >
                  Reset
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNextToken}
                  disabled={!isCurrentCompleted}
                >
                  Next Token
                </Button>
              </div>

              {isCurrentCompleted && !isWordGap && (
                <div className="text-muted mt-3">
                  This character is complete. The square has been revealed and locked.
                </div>
              )}

              {isWordGap && (
                <div className="text-muted mt-3">
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