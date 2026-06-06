import React, { useState } from 'react';
import { ButtonToolbar, ToggleButtonGroup, ToggleButton, Button } from 'react-bootstrap';
import { Header } from './Header';
import { InputField } from './InputField';
import { Footer } from './Footer';
import { Modes } from '../types/modes';
import './MainPage-style.css';

import { encode, decode, generateKey, textToMorseTokens } from '../services/morseService';
import { Popup } from './Popup';
import { MorseLearner } from './MorseLearner';

interface Props {}

export const MainPage: React.FC<Props> = () => {
  const [mode, setMode] = useState<Modes>(Modes.Cipher);
  const [cipheredText, setCipheredText] = useState<string>('');
  const [popupShow, setPopupShow] = useState<boolean>(false);
  const [cipherKey, setCipherKey] = useState<string>('');
  //const [learningKey, setLearningKey] = useState<string>('');
  //const [decodedText, setDecodedText] = useState<string>('');
  const [learnTokens, setLearnTokens] = useState<string[]>([]);
  const [showLearner, setShowLearner] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>('');

  const onStartLearning = () => {
    const tokens = cipheredText.trim().split(/\s+/).filter(Boolean);
    setLearnTokens(tokens);
    setShowLearner(true);
    setPopupShow(false);
  };

  const callCipher = async (text: string) => {
    const key = generateKey(6);
    const encoded = encode(text, key);
    setCipheredText(encoded);
    setCipherKey(key);
  
    try {
      const res = await fetch('/api/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cipherText: encoded }),
      });
      const data = await res.json() as { id: string };
      const link = `${window.location.origin}/d/${data.id}`;
      setShareLink(link);
    } catch {
      setShareLink('');
    }
  
    setPopupShow(true);

  };

  const callDecipher = (text: string) => {
    setCipheredText(text);
    setPopupShow(true);
  };

  const onDecipher = (key: string) => {
    const cleanKey = key.trim().toUpperCase();
    const decoded = decode(cipheredText, cleanKey);

    setDecodedText(decoded);
    setLearnTokens(textToMorseTokens(decoded));
    setPopupShow(false);
    setShowLearner(true);

    return decoded;
  };

  const toggleMode = () => {
    setMode((prev) => (prev === Modes.Cipher ? Modes.Decipher : Modes.Cipher));
  };

  const downloadOutput = () => {
    const blob = new Blob([cipheredText], { type: 'text/plain' });
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'encodedText.txt';
    link.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCipheredText(text);
      setPopupShow(true);
    };
    reader.readAsText(file);
  };

  return (
    <div id="outerDiv">
      <Header />

      <div id="toggleButtonsDiv">
        <ButtonToolbar>
          <ToggleButtonGroup
            type="radio"
            name="options"
            value={mode === Modes.Cipher ? 1 : 2}
            onChange={toggleMode}
          >
            <ToggleButton id={'1'} value={1}>
              Cipher
            </ToggleButton>
            <ToggleButton id={'2'} value={2}>
              Decipher
            </ToggleButton>
          </ToggleButtonGroup>
        </ButtonToolbar>
      </div>

      {mode !== Modes.Learn && (
        <InputField
          key={mode}
          onSubmitFunction={mode === Modes.Cipher ? callCipher : callDecipher}
          className="inputFieldWrapper"
          placeHolder={
            mode === Modes.Cipher
              ? 'Type some text to cipher using morse code!'
              : 'Paste some ciphered morse code to decipher and learn!'
          }
          buttonText={mode === Modes.Cipher ? 'cipher now' : 'decipher now'}
        />
      )}

      {mode === Modes.Decipher && (
        <div style={{ display: 'block' }} className="inputFieldWrapper">
          <p>or</p>
          <input
            type="file"
            accept=".txt"
            id="fileUpload"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <Button variant="outline-warning" onClick={() => document.getElementById('fileUpload')?.click()}>
            Upload ciphered .txt file
          </Button>
        </div>
      )}

      <Popup 
        show={popupShow} 
        toggleShow={() => setPopupShow(!popupShow)} 
        mode={mode}
        cipherKey={cipherKey}
        shareLink={shareLink}
        onDecipher={onDecipher}
      />
  
      {showLearner && <MorseLearner tokens={learnTokens} />}

      <Footer />
    </div>
  );
};