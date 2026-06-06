import React, { useState } from 'react'
import { Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { Modes } from '../types/modes';

interface Props {
    show: boolean;
    toggleShow: () => void;
    mode: Modes;
    cipherKey?: string;
    cipheredOutput?: string;
    downloadFun?: () => void;
    onDecipher?: (key: string) => void;
}

export const Popup: React.FC<Props> = ({ 
        show, toggleShow, mode, cipherKey, cipheredOutput, downloadFun, onDecipher 
    }) => {
    const [keyInput, setKeyInput] = useState<string>('');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    }

        const renderCipherContent = () => (
        <>
            <p>Your secret key - memorize or copy it, you'll need it to decipher!</p>
            <InputGroup className="mb-3">
                <Form.Control value={cipherKey} readOnly />
                <Button variant="outline-secondary" onClick={() => copyToClipboard(cipherKey!)}>Copy</Button>
            </InputGroup>

            <p>Your ciphered output - copy it or download it below:</p>
            <InputGroup className="mb-3">
                <Form.Control value={cipheredOutput} readOnly />
                <Button variant="outline-secondary" onClick={() => copyToClipboard(cipheredOutput!)}>Copy</Button>
            </InputGroup>
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
        <div>
            <Modal show={show} onHide={toggleShow} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {mode === Modes.Cipher ? 'Your ciphered message is ready!' : 'Key required'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {mode === Modes.Cipher ? renderCipherContent() : renderDecipherContent()}
                </Modal.Body>
                <Modal.Footer>
                    {mode === Modes.Cipher && (
                        <Button variant="primary" onClick={downloadFun}>Download .txt</Button>
                    )}
                    {mode === Modes.Decipher && (
                        <Button variant="primary" onClick={() => onDecipher!(keyInput)}>Decipher</Button>
                    )}
                    <Button variant="secondary" onClick={toggleShow}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}