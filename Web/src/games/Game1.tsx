import '../styles/Games.css';
import '../styles/Game1.css';
import { lettersInOrder, lettersNotInOrder, randomWords } from '../data/data';
import { useEffect, useRef, useState } from 'react';
import { LevelType, VictoryStatus } from '../types/Type';

const Game1 = () => {
    const [levelActive, setLevelActive] = useState<LevelType>("easy");
    const [letters, setLetters] = useState<string>(lettersInOrder);
    const [randomWord, setRandomWord] = useState<string>(getRandomWord());
    const [currentLetter, setCurrentLetter] = useState<string>(letters[0]);
    const [currentIndexLetter, setCurrentIndexLetter] = useState<number>(0);
    const [wordSelected, setWordSelected] = useState<string>('');
    const [victoryStatus, setVictoryStatus] = useState<VictoryStatus>("En cours");
    const [score, setScore] = useState<number>(0);
    const intervalRef = useRef<number>(undefined);

    function levelToTime(level?: LevelType) {
        switch (level) {
            case "easy": return 500;
            case "medium": return 500;
            case "hard": return 300;
            default: return 500;
        }
    }

    function changeLevel(level: LevelType) {
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
        <div className="game1">
            <div className="game1-header">
                Jeu 1
            </div>
            <div className="level-zone">
                <button
                    className={`button-level button-easy ${levelActive === "easy" ? "button-level-active" : ""}`}
                    onClick={() => changeLevel("easy")}>
                    Facile
                </button>
                <button
                    className={`button-level button-medium ${levelActive === "medium" ? "button-level-active" : ""}`}
                    onClick={() => changeLevel("medium")}>
                    Moyen
                </button>
                <button
                    className={`button-level button-hard ${levelActive === "hard" ? "button-level-active" : ""}`}
                    onClick={() => changeLevel("hard")}>
                    Fort
                </button>
            </div>
            <div className="game1-content">
                <div className="game1-info-zone">
                    <p className="game1-score">Score: {score}</p>
                </div>
                <p className="random-word">{randomWord}</p>
                <p className="current-letter">{currentLetter}</p>
                <p className="word-selected">{wordSelected}</p>
                <button
                    className="button-click-letter"
                    onClick={clickLetter}
                    onKeyUp={e => e.key === "Enter" && clickLetter()}
                    autoFocus>
                        Ok
                </button>
                <p className="letters">{victoryStatus === "En cours" ? "" : victoryStatus}</p>
            </div>
        </div>
    );
}

export default Game1;