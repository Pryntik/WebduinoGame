import '../styles/Games.css';
import '../styles/Game1.css';
import crownImage from '../assets/crown.png';
import LevelSelector from '../components/LevelSelector';
import GameBar from '../components/GameBar';
import { lettersInOrder, lettersNotInOrder, randomWords } from '../data/data';
import { useEffect, useRef, useState } from 'react';
import { VictoryStatus } from '../types/Type';
import { NavigatorSerial, SerialPort } from '../types/SerialType';

type Game1Type = {
    gameTitle: string,
}

const Game1 = ({gameTitle}: Game1Type) => {
    const [levelActive, setLevelActive] = useState<string>("easy");
    const [letters, setLetters] = useState<string>(lettersInOrder);
    const [randomWord, setRandomWord] = useState<string>(getRandomWord());
    const [currentLetter, setCurrentLetter] = useState<string>(letters[0]);
    const [currentIndexLetter, setCurrentIndexLetter] = useState<number>(0);
    const [wordSelected, setWordSelected] = useState<string>('');
    const [victoryStatus, setVictoryStatus] = useState<VictoryStatus>("En cours");
    const [score, setScore] = useState<number>(0);
    const [recordScore, setRecordScore] = useState<number>(Number(localStorage.getItem("record_score-game1")) || 0);
    const [isSerialConnected, setIsSerialConnected] = useState(false);
    const [receivedData, setReceivedData] = useState<string>("");
    const serialPortRef = useRef<SerialPort | null>(null);
    const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
    const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
    const intervalRef = useRef<number>(undefined);

    // Function to connect to serial port
    const connectSerialPort = async () => {
        if (!('serial' in navigator)) {
            console.warn('Web Serial API not supported');
            return;
        }
    
        try {
            const port = await (navigator as NavigatorSerial).serial.requestPort();
            await port.open({ baudRate: 9600 });
    
            serialPortRef.current = port;
            setIsSerialConnected(true);
    
            const reader = port.readable.getReader();
            readerRef.current = reader;

            const writer = port.writable.getWriter();
            writerRef.current = writer;
        }
        catch (error) {
            console.error('Serial communication error:', error);
            setIsSerialConnected(false);
        }
    };

    // Cleanup function for serial connection
    const disconnectSerialPort = async () => {
        if (readerRef.current) {
            await readerRef.current.cancel();
            readerRef.current.releaseLock();
            readerRef.current = null;
        }
        if (writerRef.current) {
            await writerRef.current.close();
            writerRef.current.releaseLock();
            writerRef.current = null;
        }

        if (serialPortRef.current) {
            await serialPortRef.current.close();
            serialPortRef.current = null;
        }
    
        setIsSerialConnected(false);
    };

    const sendScoreToArduino = async (score: number) => {
        if (!writerRef.current) {
            console.warn("Writer non disponible, connexion série requise");
            return;
        }
    
        try {
            const encoder = new TextEncoder();
            const scoreMessage = `SCORE:${score}\n`; // Format du message
            await writerRef.current.write(encoder.encode(scoreMessage));
            console.log("Score envoyé :", scoreMessage);
        } catch (error) {
            console.error("Erreur lors de l'envoi du score :", error);
        }
    };

    function levelToTime(level?: string) {
        switch (level) {
            case "easy": return 1000;
            case "medium": return 800;
            case "hard": return 500;
            default: return 1000;
        }
    }

    function changeLevel(level: string) {
        setLevelActive(level);
        if (level === "easy") setLetters(lettersInOrder);
        else setLetters(lettersNotInOrder);
    }

    function calcScore(word: string) {
        const lastLetter = word[word.length - 1];
        const indexLastLetter = word.indexOf(lastLetter);
        if (lastLetter === randomWord[indexLastLetter]) setScore(score + 1);
        else setScore(score - 1);
        checkVictory();
    }

    function getRandomWord() {
        return randomWords[Math.floor(Math.random() * randomWords.length)];
    }

    function getBoxLetter(text: string, textSize?: number) {
        const splitWord = text.split("");
        if (textSize && textSize > text.length) {
            for (let i = 0; i < textSize - text.length; i++)
                splitWord.push(" ");
        }
        return (
            <div className="split-word">
                {splitWord.map((letter, index) => (
                    <div key={index} className="box-letter">{letter}</div>
                ))}
            </div>
        );
    }

    function resetAndNextWord() {
        setTimeout(() => {
            setVictoryStatus("En cours");
            setWordSelected("");
            setRandomWord(getRandomWord());
        }, 5000);
    }

    function checkVictory() {
        if (wordSelected.length === randomWord.length) {
            if (wordSelected === randomWord) {
                setVictoryStatus("Victoire");
                setScore(prevScore => prevScore + randomWord.length);
                resetAndNextWord();
            }
            else {
                setVictoryStatus("Défaite");
                resetAndNextWord();
            }
        }
    }

    function clickLetter() {
        if (victoryStatus === "En cours") {
            clearInterval(intervalRef.current);

            const letterAtClick = letters[currentIndexLetter];
            setWordSelected((prevWord) => prevWord + letterAtClick);

            intervalRef.current = window.setInterval(() => {
                setCurrentIndexLetter((prevIndex) => (prevIndex + 1) % letters.length);
            }, levelToTime(levelActive));
        }
    }

    function clickSave() {
        if (score > recordScore) {
            localStorage.setItem("record_score-game1", score.toString());
            setScore(0);
            setRecordScore(Number(localStorage.getItem("record_score-game1")) || 0);
        }
    }

    // Lire les données reçues dans un useEffect
    useEffect(() => {
        if (!isSerialConnected || !readerRef.current) return;

        const readData = async () => {
            if (!readerRef.current) return;

            const reader = readerRef.current;
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const decoder = new TextDecoder();
                    const data = decoder.decode(value).trim();
                    console.log("Donnée reçue :", data);

                    // Mettre à jour le state avec la donnée reçue
                    setReceivedData(data);
                }
            } catch (error) {
                console.error("Erreur lors de la lecture des données série :", error);
            }
        };

        readData();
    }, [isSerialConnected]);

    // Réagir à la mise à jour des données reçues
    useEffect(() => {
        if (receivedData === "A") {
            // Appel de ta fonction lorsque l'Arduino envoie "A"
            clickLetter();
        }
    }, [receivedData]);

    useEffect(() => {
        if (isSerialConnected) {
            sendScoreToArduino(score);
        }
    }, [score, isSerialConnected]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            disconnectSerialPort();
        };
    }, []);

    useEffect(() => {
        setRandomWord(getRandomWord());
    }, []);

    useEffect(() => {
        if (wordSelected.length > 0) {
            calcScore(wordSelected);
        }
    }, [wordSelected]);

    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            setCurrentIndexLetter((prevIndex) => (prevIndex + 1) % letters.length);
        }, levelToTime(levelActive));
        setCurrentLetter(letters[currentIndexLetter]);
        return () => clearInterval(intervalRef.current);
    }, [currentIndexLetter, letters, levelActive]);

    return (
        <div className="game1" onKeyDown={e => e.key === "Space" && clickLetter()}>
            <GameBar barName="header" numGame={1} contents={[
                gameTitle,
                score,
                <>{recordScore}<img className="record-score-image" src={crownImage} alt="crown"/></>
            ]}/>
            <LevelSelector
                levels={["easy", "medium", "hard"]}
                levelActive={level => changeLevel(level)}
                levelNames={["Facile", "Moyen", "Difficile"]}
                levelDefault="easy"/>
            <div className="game1-content">
                {getBoxLetter(randomWord)}
                <div className="box-letter-big">
                    <div
                        key={currentLetter}
                        className="current-letter"
                        style={{ animation: `slideTopBottom ${levelToTime(levelActive) / 1000}s` }}>
                        {currentLetter}
                    </div>
                </div>
                {getBoxLetter(wordSelected, randomWord.length)}
                {victoryStatus !== "En cours" && (
                    <p style={{color: victoryStatus === "Victoire" ? "gold" : "blueviolet"}}>{victoryStatus}</p>
                )}
            </div>
            <GameBar barName="footer" numGame={1} divDefault={false} contents={[
                <button
                    className="button-click-footer game1-footer-0"
                    onClick={clickLetter}
                    onKeyDown={e => e.key === "Space" && clickLetter()}
                    autoFocus>
                    Valider
                </button>,
                <button
                    className="button-click-footer game1-footer-1"
                    onClick={clickSave}
                    disabled={score <= recordScore}
                    style={{
                        backgroundColor: score <= recordScore ? "grey" : "paleturquoise",
                        cursor: score <= recordScore ? "not-allowed" : "pointer"
                    }}>
                    Sauvegarder
                </button>,
                <div className="serial-connection">
                {!isSerialConnected ? (
                    <button 
                        onClick={connectSerialPort}
                        className="connect-serial-btn"
                    >
                        Connect Arduino
                    </button>
                ) : (
                    <button 
                        onClick={disconnectSerialPort}
                        className="disconnect-serial-btn"
                    >
                        Disconnect Arduino
                    </button>
                )}
                </div>
            ]}/>
        </div>
    );
}

export default Game1;