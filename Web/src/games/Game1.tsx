import '../styles/Games.css';
import '../styles/Game1.css';
import crownImage from '../assets/crown.png';
import LevelSelector from '../components/LevelSelector';
import { lettersInOrder, lettersNotInOrder, randomWords } from '../data/data';
import { useEffect, useRef, useState } from 'react';
import { VictoryStatus } from '../types/Type';

const Game1 = () => {
    const [levelActive, setLevelActive] = useState<string>("easy");
    const [letters, setLetters] = useState<string>(lettersInOrder);
    const [randomWord, setRandomWord] = useState<string>(getRandomWord());
    const [currentLetter, setCurrentLetter] = useState<string>(letters[0]);
    const [currentIndexLetter, setCurrentIndexLetter] = useState<number>(0);
    const [wordSelected, setWordSelected] = useState<string>('');
    const [victoryStatus, setVictoryStatus] = useState<VictoryStatus>("En cours");
    const [score, setScore] = useState<number>(0);
    const [recordScore, setRecordScore] = useState<number>(Number(localStorage.getItem("record_score-game1")) || 0);
    const intervalRef = useRef<number>(undefined);

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
            <div className="game1-header">
                <div className="game1-header-1">Jeu 1</div>
                <div className="game1-header-2">{score}</div>
                <div className="game1-header-3">
                    {recordScore}
                    <img className="record-score-image" src={crownImage} alt="crown"/>
                </div>
            </div>
            <LevelSelector
                levels={["easy", "medium", "hard"]}
                levelActive={level => changeLevel(level)}
                levelNames={["Facile", "Moyen", "Difficile"]}
                levelDefault="easy"/>
            <div className="game1-content">
                {getBoxLetter(randomWord)}
                <div className="box-letter-big">
                    <div
                        className="current-letter"
                        style={{animationName: "slideTopBottom", animationDuration: `${levelToTime(levelActive) / 1000}s`, animationIterationCount: "infinite"}}>
                        {currentLetter}
                    </div>
                </div>
                {getBoxLetter(wordSelected, randomWord.length)}
                {victoryStatus !== "En cours" && (
                    <p style={{color: victoryStatus === "Victoire" ? "gold" : "blueviolet"}}>{victoryStatus}</p>
                )}
            </div>
            <div className="game1-footer">
                <button
                    className="button-click-letter"
                    onClick={clickLetter}
                    onKeyDown={e => e.key === "Space" && clickLetter()}
                    autoFocus>
                        Valider
                </button>
                <button
                    className="button-click-save"
                    style={{
                        backgroundColor: score <= recordScore ? "grey" : "paleturquoise",
                        cursor: score <= recordScore ? "not-allowed" : "pointer"
                    }}
                    onClick={clickSave}
                    disabled={score <= recordScore}>
                        Sauvegarder
                </button>
            </div>
        </div>
    );
}

export default Game1;