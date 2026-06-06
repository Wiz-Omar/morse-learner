import React, { useState } from 'react';
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
  const [learnTokens, setLearnTokens] = useState<string[]>([]);
  const [showLearner, setShowLearner] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>('');

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

  const onDecipher = (key: string) => {
    const cleanKey = key.trim().toUpperCase();
    const decoded = decode(cipheredText, cleanKey);

    setLearnTokens(textToMorseTokens(decoded));
    setPopupShow(false);
    setShowLearner(true);

    return decoded;
  };

  return (
    <div id="outerDiv">
      <Header />

      {mode !== Modes.Learn && (
        <InputField
          key={mode}
          onSubmitFunction={callCipher}
          className="inputFieldWrapper"
          placeHolder={'Type some text to learn how each character in morse code!'}
          buttonText={'Start learning'}
        />
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