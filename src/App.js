import React, { useState, useEffect, useRef } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import './App.css';

const textSamples = {
  easy: ["The quick brown fox jumps over the lazy dog."],
  hard: ["Life is what happens when you're busy making other plans. Time flies over us, but leaves its shadow behind. The only way to do great work is to love what you do."],
  extreme: ["In the midst of chaos, there is also opportunity. The greatest glory in living lies not in never falling, but in rising every time we fall. Success is not final, failure is not fatal: it is the courage to continue that counts. The future belongs to those who believe in the beauty of their dreams. It does not matter how slowly you go as long as you do not stop."],
};

function App() {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedTime, setSelectedTime] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [records, setRecords] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameReminder, setShowNameReminder] = useState(false); // New state for name reminder popup
  const inputRef = useRef(null);
  const statsRef = useRef(null);

  // Animation function
  const animateStat = (element) => {
    element.classList.add('bounce');
    setTimeout(() => element.classList.remove('bounce'), 500);
  };

  // Start the game
  const startGame = () => {
    if (!playerName.trim()) {
      setShowNameReminder(true); // Show custom popup instead of alert
      return;
    }
    const selectedTexts = textSamples[difficulty];
    const randomText = selectedTexts[0];
    setText(randomText);
    setUserInput('');
    setTimeLeft(selectedTime);
    setWpm(0);
    setAccuracy(0);
    setIsPlaying(true);
    setShowResult(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Calculate results
  const calculateResults = () => {
    const wordsTyped = userInput.trim().split(/\s+/);
    const minutes = (selectedTime - timeLeft) / 60;
    const calculatedWpm = Math.round(wordsTyped.length / minutes) || 0;

    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) correctChars++;
    }
    const calculatedAccuracy = Math.round((correctChars / text.length) * 100) || 0;

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
    setIsPlaying(false);
    setRecords(prev => [...prev, { name: playerName, wpm: calculatedWpm }]);
    setShowResult(true);
    if (statsRef.current) animateStat(statsRef.current);
  };

  // Check if typing is complete
  const checkCompletion = () => {
    if (userInput.trim() === text.trim() && isPlaying) {
      calculateResults();
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            calculateResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  // Handle input change
  const handleInputChange = (e) => {
    if (!isPlaying) return;
    const newInput = e.target.value;
    setUserInput(newInput);
    checkCompletion();
  };

  // Handle name input change
  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  // Handle result popup OK button
  const handleResultOk = () => {
    setShowResult(false);
    setText('');
    setUserInput('');
    setTimeLeft(0);
    setIsPlaying(false);
    setPlayerName('');
  };

  // Handle name reminder popup OK button
  const handleNameReminderOk = () => {
    setShowNameReminder(false);
  };

  return (
    <div className="App">
      <h1>Typing Speed Challenge</h1>
      
      <div className="game-container">
        {!isPlaying && timeLeft === 0 && (
          <div className="settings">
            <div className="chooser">
              <label>Name:</label>
              <input
                type="text"
                value={playerName}
                onChange={handleNameChange}
                placeholder="Enter your name"
                className="name-input"
              />
            </div>
            <div className="chooser">
              <label>Time:</label>
              <select 
                value={selectedTime} 
                onChange={(e) => setSelectedTime(Number(e.target.value))}
              >
                <option value={60}>1 Minute</option>
                <option value={120}>2 Minutes</option>
                <option value={180}>3 Minutes</option>
                <option value={240}>4 Minutes</option>
                <option value={300}>5 Minutes</option>
              </select>
            </div>
            
            <div className="chooser">
              <label>Difficulty:</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy (1 paragraph)</option>
                <option value="hard">Hard (3 paragraphs)</option>
                <option value="extreme">Extreme (5 paragraphs)</option>
              </select>
            </div>

            {records.length > 0 && (
              <div className="records">
                <h2>Previous Records:</h2>
                <ul>
                  {records.map((record, index) => (
                    <li key={index}>{record.name}: {record.wpm} WPM</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!isPlaying && timeLeft === 0 && !showResult && (
          <button onClick={startGame}>Start Game</button>
        )}
        
        {text && (
          <div className="text-display">
            <p>{text}</p>
          </div>
        )}
        
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={!isPlaying}
          placeholder="Start typing here..."
        />
        
        {isPlaying && (
          <div ref={statsRef} className="stats">
            <p>Time Left: <span>{timeLeft}s</span></p>
            <p>WPM: <span>{wpm}</span></p>
            <p>Accuracy: <span>{accuracy}%</span></p>
          </div>
        )}

        {showResult && (
          <div className="result-popup">
            <div className="result-content">
              <h2>Game Over!</h2>
              <p>{playerName}, Your Speed was: {wpm} WPM</p>
              <p>Accuracy: {accuracy}%</p>
              <button onClick={handleResultOk}>OK</button>
            </div>
          </div>
        )}

        {showNameReminder && (
          <div className="name-reminder-popup">
            <div className="name-reminder-content">
              <h2>Reminder</h2>
              <p>Please enter your name to play the game!</p>
              <button onClick={handleNameReminderOk}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;