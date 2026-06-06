import React, { useState } from 'react';
import { Button, Modal, Form, InputGroup, Alert } from 'react-bootstrap';
import { Modes } from '../types/modes';

interface Props {
  show: boolean;
  toggleShow: () => void;
  mode: Modes;
  cipherKey?: string;
  shareLink?: string;
  onDecipher?: (key: string) => void;
}

export const Popup: React.FC<Props> = ({
  show, toggleShow, mode, cipherKey, shareLink, onDecipher,
}) => {
  const [keyInput, setKeyInput] = useState<string>('');
  const [copied, setCopied] = useState<'key' | 'link' | null>(null);

  const copyToClipboard = (text: string, which: 'key' | 'link') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const renderCipherContent = () => (
    <>
      <p className="mb-1 fw-semibold">Your secret key</p>
      <p className="text-muted small">Share this with whoever needs to decipher the message — keep it separate from the link!</p>
      <InputGroup className="mb-4">
        <Form.Control value={cipherKey} readOnly style={{ fontFamily: 'monospace', letterSpacing: 2 }} />
        <Button variant="outline-secondary" onClick={() => copyToClipboard(cipherKey!, 'key')}>
          {copied === 'key' ? 'Copied!' : 'Copy'}
        </Button>
      </InputGroup>

      <p className="mb-1 fw-semibold">Shareable link</p>
      <p className="text-muted small">Anyone with this link can enter the key above to start learning.</p>
      {shareLink ? (
        <InputGroup className="mb-3">
          <Form.Control value={shareLink} readOnly style={{ fontSize: '0.9rem' }} />
          <Button variant="outline-secondary" onClick={() => copyToClipboard(shareLink, 'link')}>
            {copied === 'link' ? 'Copied!' : 'Copy'}
          </Button>
        </InputGroup>
      ) : (
        <Alert variant="warning" className="py-2 small">
          Could not generate a link. Please try again.
        </Alert>
      )}
    </>
  );

  const renderDecipherContent = () => (
    <>
      <p>Enter the secret key to decipher your message:</p>
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Enter your key..."
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
        />
      </InputGroup>
    </>
  );

  return (
    <Modal show={show} onHide={toggleShow} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === Modes.Cipher ? 'Your message is ready to share!' : 'Key required'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mode === Modes.Cipher ? renderCipherContent() : renderDecipherContent()}
      </Modal.Body>
      <Modal.Footer>
        {mode === Modes.Decipher && (
          <Button variant="primary" onClick={() => onDecipher!(keyInput)}>Decipher</Button>
        )}
        <Button variant="secondary" onClick={toggleShow}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};