import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Container, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { decode, textToMorseTokens } from '../services/morseService';
import { MorseLearner } from '../components/MorseLearner';

const COLORS = {
  bg: '#07090f',
  surface: '#0d1220',
  surface2: '#101620',
  amber: '#e8941a',
  amberLight: '#f0a830',
  text: '#e0d6c4',
  muted: '#9aa3b2',
  border: 'rgba(232, 148, 26, 0.18)',
  borderStrong: 'rgba(232, 148, 26, 0.30)',
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: `radial-gradient(circle at top, rgba(232,148,26,0.12), transparent 34%), linear-gradient(180deg, ${COLORS.bg} 0%, #0b0f18 100%)`,
    color: COLORS.text,
  },
  shell: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem 3rem',
  },
  card: {
    width: 'min(760px, 100%)',
    backgroundColor: 'rgba(13, 18, 32, 0.9)',
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 24,
    boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(12px)',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.72rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: COLORS.amber,
    marginBottom: '0.9rem',
    fontWeight: 700,
  },
  title: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    lineHeight: 1.05,
    fontWeight: 800,
    marginBottom: '0.9rem',
    letterSpacing: '-0.03em',
  },
  subtitleFull: {
    color: COLORS.muted,
    fontSize: '1rem',
    lineHeight: 1.7,
    marginBottom: '1.75rem',
  },
  inputGroup: {
    boxShadow: '0 0 0 1px rgba(232,148,26,0.10)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  label: {
    color: COLORS.amber,
    fontSize: '0.78rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '0.55rem',
    fontWeight: 700,
  },
  input: {
    backgroundColor: COLORS.surface2,
    borderColor: COLORS.border,
    color: COLORS.text,
    padding: '0.9rem 1rem',
  },
  button: {
    backgroundColor: COLORS.amber,
    borderColor: COLORS.amber,
    color: '#fff',
    fontWeight: 700,
    letterSpacing: '0.04em',
    padding: '0.9rem 1.25rem',
    textTransform: 'uppercase',
  },
  backLink: {
    color: COLORS.muted,
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  helper: {
    color: COLORS.muted,
    fontSize: '0.88rem',
    marginTop: '0.7rem',
  },
  loadingWrap: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    padding: '1.5rem 1.75rem',
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
  },
};

export const DecipherPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [cipherText, setCipherText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>('');
  const [keyInput, setKeyInput] = useState<string>('');
  const [keyError, setKeyError] = useState<string>('');
  const [learnTokens, setLearnTokens] = useState<string[]>([]);
  const [showLearner, setShowLearner] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      setFetchError('Invalid link.');
      setLoading(false);
      return;
    }

    fetch(`/api/get-message?id=${id}`)
      .then((res) => {
          if (res.status === 429) throw new Error('rate_limited');
          if (!res.ok) throw new Error('not_found');
          return res.json();
      })
      .then((data: { cipherText: string }) => {
          setCipherText(data.cipherText);
      })
      .catch((err) => {
          if (err.message === 'rate_limited') {
          setFetchError('Too many requests. Please wait a moment before trying again.');
          } else {
          setFetchError('This message was not found or may have expired.');
          }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStartLearning = () => {
    const cleanKey = keyInput.trim().toUpperCase();
    if (!cleanKey) {
      setKeyError('Please enter the key you received.');
      return;
    }
    setKeyError('');
    const decoded = decode(cipherText, cleanKey);
    setLearnTokens(textToMorseTokens(decoded));
    setShowLearner(true);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Container style={styles.loadingWrap}>
          <div style={styles.loadingCard}>
            <div className="d-flex align-items-center gap-3">
              <Spinner animation="border" variant="warning" />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>Opening your message</div>
                <div style={{ color: COLORS.muted, fontSize: '0.92rem' }}>Preparing the learner view…</div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={styles.page}>
        <Container style={{ ...styles.loadingWrap, padding: '2rem 1rem' }}>
          <Card style={{ ...styles.card, maxWidth: 560 }}>
            <Card.Body style={{ padding: '2rem' }}>
              <Alert
                variant="danger"
                className="mb-3"
                style={{
                  backgroundColor: 'rgba(220, 53, 69, 0.08)',
                  borderColor: 'rgba(220, 53, 69, 0.18)',
                  color: COLORS.text,
                }}
              >
                {fetchError}
              </Alert>

              <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <Link to="/" style={styles.backLink}>
                  ← Back to home
                </Link>
                <span style={{ color: COLORS.muted, fontSize: '0.88rem' }}>The shared link may no longer be valid.</span>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  if (showLearner) {
    return (
      <div style={styles.page}>
        <Container fluid style={{ padding: '1.5rem 1rem 2.5rem' }}>
          <MorseLearner tokens={learnTokens} />
        </Container>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Container style={styles.main}>
        <Card style={styles.card}>
          <Card.Body style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
            <div style={styles.eyebrow}>· − − · / · −</div>

            <h1 style={styles.title}>Your morse message is ready</h1>
            <p style={styles.subtitleFull}>
              Enter the secret key you received to unlock the learning flow and reveal the message one symbol at a time.
            </p>

            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartLearning();
              }}
            >
              <Form.Label style={styles.label}>Secret key</Form.Label>
              <InputGroup className="mb-2" style={styles.inputGroup}>
                <Form.Control
                  placeholder="e.g. ABCDEF"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  autoFocus
                  style={styles.input}
                />
                <Button type="submit" style={styles.button}>
                  Start learning
                </Button>
              </InputGroup>
            </Form>

            {keyError && (
              <p className="mb-0" style={{ color: '#ff8f8f', fontSize: '0.92rem' }}>
                {keyError}
              </p>
            )}

            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mt-4">
              <span style={styles.helper}>Morse Learner keeps the navigation hidden until the key is entered.</span>
              <Link to="/" style={styles.backLink}>
                ← Back to home
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};
