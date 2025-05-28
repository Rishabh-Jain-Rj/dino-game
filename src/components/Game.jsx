"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jumpSoundFile from "../assets/jump.wav";
import musicFile from "../assets/music.mp3";
import gameOverFile from "../assets/gameOver.wav";

const SimpleDinoGame = () => {
  // Game states
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Audio
  const jumpSound = useRef(new Audio(jumpSoundFile));
  const bgMusic = useRef(new Audio(musicFile));
  const gameOverMusic = useRef(new Audio(gameOverFile));

  // Constants
  const PLAYER_LEFT = 100;
  const PLAYER_BOTTOM = isJumping ? 200 : 100;
  const PLAYER_WIDTH = 40;
  const PLAYER_HEIGHT = 60;

  // Jump action
  const jump = useCallback(() => {
    if (isJumping || gameOver) return;
    setIsJumping(true);
    jumpSound.current.currentTime = 0;
    jumpSound.current.play();

    // Return to ground after 600ms
    setTimeout(() => {
      setIsJumping(false);
    }, 600);
  }, [gameOver, isJumping]);

  const playGameOverSound = () => {
    gameOverMusic.current.currentTime = 0;
    gameOverMusic.current.play();
  };

  // Music toggle
  const toggleMusic = useCallback(() => {
    if (!isMusicPlaying) {
      bgMusic.current.loop = true;
      bgMusic.current.play();
      setIsMusicPlaying(true);
    } else {
      bgMusic.current.pause();
      setIsMusicPlaying(false);
    }
  }, [isMusicPlaying]);

  // Reset game
  const resetGame = useCallback(() => {
    setObstacles([]);
    setScore(0);
    bgMusic.current.currentTime = 0;
    toggleMusic();
    setGameOver(false);
  }, [toggleMusic]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") jump();

      if (e.code === "KeyR" && gameOver) resetGame();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, isJumping, jump, resetGame]);

  // Game loop
  useEffect(() => {
    if (gameOver || !isGameStarted) return;

    const gameInterval = setInterval(() => {
      // Move obstacles left
      setObstacles(
        (prev) =>
          prev
            .map((obs) => ({ ...obs, x: obs.x - 2 })) // Move left
            .filter((obs) => obs.x > -50) // Remove if off-screen
      );

      // Add new obstacle every 2 seconds randomly
      if (Math.random() < 0.02) {
        setObstacles((prev) => [
          ...prev,
          { id: Date.now(), x: 100 }, // start at right edge
        ]);
      }

      // Check for collisions
      for (const obs of obstacles) {
        const obsLeft = (obs.x / 100) * window.innerWidth;
        const obsRight = obsLeft + 40;
        const playerRight = PLAYER_LEFT + PLAYER_WIDTH;
        const playerTop = PLAYER_BOTTOM + PLAYER_HEIGHT;

        const isColliding =
          PLAYER_LEFT < obsRight &&
          playerRight > obsLeft &&
          PLAYER_BOTTOM < 160 && // obstacle height
          playerTop > 100; // obstacle bottom

        if (isColliding) {
          setGameOver(true);
          bgMusic.current.pause();
          playGameOverSound();
          setIsMusicPlaying(false);
          return;
        }
      }
      setScore((prev) => prev + 1);
    }, 50);

    return () => {
      clearInterval(gameInterval);
    };
  }, [gameOver, obstacles, isGameStarted, PLAYER_BOTTOM]);

  // Clean audio on unmount
  useEffect(() => {
    const bg = bgMusic.current;
    const jump = jumpSound.current;

    return () => {
      bg.pause();
      jump.pause();
    };
  }, []);

  // Render character
  const renderPlayer = () => (
    <div
      className="absolute bg-red-500 rounded"
      style={{
        bottom: `${PLAYER_BOTTOM}px`,
        left: `${PLAYER_LEFT}px`,
        width: `${PLAYER_WIDTH}px`,
        height: `${PLAYER_HEIGHT}px`,
        transition: "bottom 0.2s",
      }}
    />
  );

  // Render obstacles
  const renderObstacles = () =>
    obstacles.map((obs) => (
      <div
        key={obs.id}
        className="absolute bg-green-800 rounded"
        style={{
          bottom: "100px",
          left: `${obs.x}%`,
          width: "40px",
          height: "60px",
          transition: " 0.2s all",
        }}
      />
    ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-green-200 relative overflow-hidden">
      {/* Score */}
      <div className="absolute top-4 left-4 font-bold text-xl">
        Score: {score}
      </div>

      {/* Controls info */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-700">
        ↑/Space: Jump | Enter: Music | R: Restart
      </div>

      {/* Ground */}
      <div
        className="absolute bottom-0 w-full bg-green-500"
        style={{ height: "100px" }}
      />

      {/* Character */}
      {renderPlayer()}

      {/* Obstacles */}
      {renderObstacles()}

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="mb-4">Your Score: {score}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={resetGame}
            >
              Play Again (R)
            </button>
          </div>
        </div>
      )}
      {!isGameStarted && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center shadow-xl max-w-sm mx-auto">
            <h2 className="text-2xl font-bold mb-2">Dino Game</h2>
            <p className="mb-4 text-sm text-gray-700 leading-relaxed">
              Press <span className="font-semibold">↑</span> or{" "}
              <span className="font-semibold">Space</span> to Jump
              <br />
              Press <span className="font-semibold">R</span> to Restart after
              Game Over
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
              onClick={() => {
                setIsGameStarted(true);
                toggleMusic();
              }}
            >
              Start Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDinoGame;
