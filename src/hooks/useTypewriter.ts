import { useState, useEffect } from 'react';

/**
 * Animated typewriter hook to print retro texts letter-by-letter.
 * @param text The input text to typewrite
 * @param speed Typing interval speed in ms
 */
export const useTypewriter = (text: string, speed = 25): string => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText('');
    if (!text) return;

    let index = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => {
      clearInterval(interval);
    };
  }, [text, speed]);

  return displayText;
};
