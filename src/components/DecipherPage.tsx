import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Container, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { decode, textToMorseTokens } from '../services/morseService';
import { MorseLearner } from '../components/MorseLearner';
import './DecipherPage-style.css';

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
      <div className="dp-page">
        <Container className="dp-loading-wrap">
          <div className="dp-loading-card">
            <div className="d-flex align-items-center gap-3">
              <Spinner animation="border" variant="warning" />
              <div>
                <div className="dp-loading-title">Opening your message</div>
                <div className="dp-loading-subtitle">Preparing the learner view…</div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="dp-page">
        <Container className="dp-loading-wrap" style={{ padding: '2rem 1rem' }}>
          <Card className="dp-card dp-error-card">
            <Card.Body className="dp-error-card-body">
              <Alert variant="danger" className="dp-error-alert mb-3">
                {fetchError}
              </Alert>
              <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <Link to="/" className="dp-back-link">
                  ← Back to home
                </Link>
                <span className="dp-error-note">The shared link may no longer be valid.</span>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  if (showLearner) {
    return (
      <div className="dp-page">
        <Container fluid className="dp-learner-wrapper">
          <MorseLearner tokens={learnTokens} />
        </Container>
      </div>
    );
  }

  return (
    <div className="dp-page">
      <Container className="dp-main">
        <Card className="dp-card">
          <Card.Body className="dp-card-body">
            <div className="dp-eyebrow">· − − · / · −</div>

            <h1 className="dp-title">Your morse message is ready</h1>
            <p className="dp-subtitle">
              Enter the secret key you received to unlock the learning flow and reveal the message one symbol at a time.
            </p>

            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartLearning();
              }}
            >
              <Form.Label className="dp-label">Secret key</Form.Label>
              <InputGroup className="mb-2 dp-input-group">
                <Form.Control
                  placeholder="e.g. ABCDEF"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  autoFocus
                  className="dp-input"
                />
                <Button type="submit" className="dp-button">
                  Start learning
                </Button>
              </InputGroup>
            </Form>

            {keyError && (
              <p className="mb-0 dp-key-error">{keyError}</p>
            )}

            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mt-4">
              <span className="dp-helper">
                Morse Learner keeps the navigation hidden until the key is entered.
              </span>
              <Link to="/" className="dp-back-link">
                ← Back to home
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};
