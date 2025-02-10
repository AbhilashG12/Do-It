/* eslint-disable react/prop-types */
import { useTypewriter, Cursor } from 'react-simple-typewriter';

const TypingAnimation = ({
  words = [
    'Hello There!',
    'Welcome to Do-Together!',
    'Sign-up if you wanna know more'
  ],
  loop = 0,
  typeSpeed = 100,
  deleteSpeed = 50,
  delaySpeed = 2000,
  fontSize = '2rem',
  marginTop = '50px',
  cursorColor = '#000'
}) => {
  const [text] = useTypewriter({
    words,
    loop,
    typeSpeed,
    deleteSpeed,
    delaySpeed
  });

  return (
    <div
      style={{
        fontSize,
        fontFamily: 'monospace',
        textAlign: 'center',
        marginTop
      }}
    >
      <span>{text}</span>
      <Cursor cursorColor={cursorColor} />
    </div>
  );
};

export default TypingAnimation;
