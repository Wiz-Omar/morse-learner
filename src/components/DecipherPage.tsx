import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Container, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { decode, textToMorseTokens } from '../services/morseService';
import { MorseLearner } from '../components/MorseLearner';

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
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data: { cipherText: string }) => {
        setCipherText(data.cipherText);
      })
      .catch(() => setFetchError('This message was not found or may have expired.'))
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
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  if (fetchError) {
    return (
      <Container className="py-5" style={{ maxWidth: 480 }}>
        <Alert variant="danger">{fetchError}</Alert>
        <Link to="/">← Back to home</Link>
      </Container>
    );
  }

  if (showLearner) {
    return <MorseLearner tokens={learnTokens} />;
  }

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h4 className="mb-1">You've received a morse message!</h4>
          <p className="text-muted mb-4">Enter the key you were given to start deciphering and learning.</p>

          <Form.Label className="fw-semibold">Secret key</Form.Label>
          <InputGroup className="mb-2">
            <Form.Control
              placeholder="e.g. ABCDEF"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartLearning()}
              autoFocus
            />
          </InputGroup>

          {keyError && <p className="text-danger small mb-2">{keyError}</p>}

          <Button variant="warning" className="w-100 mt-2" onClick={handleStartLearning}>
            Start Learning
          </Button>

          <div className="text-center mt-3">
            <Link to="/" className="text-muted small">← Back to home</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};