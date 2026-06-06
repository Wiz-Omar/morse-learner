import React, { useState } from 'react';
import { Header } from './Header';
import { InputField } from './InputField';
import { Footer } from './Footer';
import './MainPage-style.css';

import { encode, generateKey } from '../services/morseService';
import { Popup } from './Popup';

interface Props {}

export const MainPage: React.FC<Props> = () => {
  const [popupShow, setPopupShow] = useState<boolean>(false);
  const [cipherKey, setCipherKey] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');

  const callCipher = async (text: string) => {
    const key = generateKey(6);
    const encoded = encode(text, key);
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

  return (
    <div id="outerDiv">
      <Header />
      <InputField
        key={'plainTextInput'}
        onSubmitFunction={callCipher}
        className="inputFieldWrapper"
        placeHolder={'Type some text to learn each character in morse code'}
        buttonText={'Generate link'}
      />

      <Popup 
        show={popupShow} 
        toggleShow={() => setPopupShow(!popupShow)}
        cipherKey={cipherKey}
        shareLink={shareLink}
      />

      <Footer />
    </div>
  );
};