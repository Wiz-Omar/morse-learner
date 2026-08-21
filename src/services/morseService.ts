import {morseCode, reverseMorseCode} from '../types/morse'

let chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let charToIndex = Object.fromEntries(
    [...chars].map((c, i) => [c, i])
);
let charsLength: number = chars.length;

function isAlpha(char: string): boolean{
    return /^[A-Za-z]+$/.test(char);
}

export function encode(decryptedText: string, key: string): string{ //no fake noise added yet
    key = key.toUpperCase(); //in case of unguaranteed user-provided keys
    let currentKeyPointer: number = 0;
    let encodedText: string = '';
    for (let i: number = 0; i < decryptedText.length; i++){
        const char = decryptedText[i].toUpperCase();
        if (char === ' '){
            encodedText += '/ ';
            i++;
            while(i < decryptedText.length && decryptedText[i] === ' '){
                i++;
            }
            i--;
        }else if (char in morseCode){ //ignore unknown characters
            if (isAlpha(char)){
                currentKeyPointer %= key.length;
                const currentLetterIndex: number = charToIndex[char];
                const currentKeyLetterIndex: number = charToIndex[key[currentKeyPointer]];
                const currentCharEncryption = (currentLetterIndex + currentKeyLetterIndex) % charsLength;
                encodedText += morseCode[chars[currentCharEncryption]];
                encodedText += ' ';
                currentKeyPointer++;
            }else{ //numbers and punctuation
                encodedText += morseCode[char];
                encodedText += ' ';
            }
        }
    }
    return encodedText.trim(); //remove trailing spaces
}

export function decode(encryptedText: string, key: string): string{
    key = key.toUpperCase(); //in case of unguaranteed user-provided keys
    let currentKeyPointer: number = 0;
    let decodedText: string = '';
    const morse: string[] = encryptedText.split(' ');
    let charsString: string = Array.from(morse)
        .map(char => {
            if (char === '/'){
                return ' ';
            }else if (char in reverseMorseCode){
                return reverseMorseCode[char];
            }
        })
        .join('');

    for (let i: number = 0; i < charsString.length; i++){
        const char = charsString[i].toUpperCase();
        if (char === ' '){
            decodedText += char;
        }else if (isAlpha(char)){
                currentKeyPointer %= key.length;
                const currentLetterIndex: number = charToIndex[char];
                const currentKeyLetterIndex: number = charToIndex[key[currentKeyPointer]];
                const currentCharDecryption = (currentLetterIndex - currentKeyLetterIndex + charsLength) % charsLength;
                decodedText += chars[currentCharDecryption];
                currentKeyPointer++;
        }else{
            decodedText += char;
        }
    }
    return decodedText;
}

export function generateKey(length: number): string{
    let randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);

    return Array.from(randomArray)
        .map(val => chars[val % charsLength])
        .join("");
}

export function textToMorseTokens(text: string): string[] {
  const tokens: string[] = [];

  for (const char of text.toUpperCase()) {
    if (char === ' ') {
      tokens.push('/');
    } else if (char in morseCode) {
      tokens.push(morseCode[char]);
    }
  }

  return tokens;
}