import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import './InputField-style.css';

interface Props {
    onSubmitFunction: (text: string) => void;
    placeHolder: string;
    buttonText: string;
    className ?: string;
}

export const InputField: React.FC<Props> = ({ onSubmitFunction, className, placeHolder, buttonText }) => {
    const [input, setInput] = useState<string>('');

    const handleClick = () => {
        onSubmitFunction(input);
    }

    return (
        <div className={className}>
            <InputGroup className="mb-3">
                <Form.Control
                    placeholder={placeHolder}
                    aria-label="Recipient's username"
                    aria-describedby="basic-addon2"
                    value={input}
                    onSubmit={handleClick}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button variant="outline-light" id="button-addon2" className='bg-dark' onClick={handleClick}>
                    {buttonText}
                </Button>
            </InputGroup>
        </div>
    );
}