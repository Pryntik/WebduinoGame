import '../styles/Games.css';
import '../styles/Game2.css';
import crownImage from '../assets/crown.png';
import GameBar from '../components/GameBar';
import LevelSelector from '../components/LevelSelector';
import ArduinoConnect from '../components/ArduinoConnect';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { wordList } from '../data/data';
import { VictoryStatus } from '../types/Type';

type Game2Type = {
    gameTitle: string,
}

const Game2 = ({gameTitle}: Game2Type) => {
    const [levelActive, setLevelActive] = useState<string>("easy");
    const [randomWords, setRandomWords] = useState<string[]>([]);
    const [sameWords, setSameWords] = useState<string[]>([]);
    const [sameWordsIndex, setSameWordsIndex] = useState<number[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [currentWord, setCurrentWord] = useState<string>("_");
    const [currentIndexWord, setCurrentIndexWord] = useState<number>(0);
    const [wrongAnswer, setWrongAnswer] = useState<number>(0);
    const [victoryStatus, setVictoryStatus] = useState<VictoryStatus>("En cours");
    const [score, setScore] = useState<number>(0);
    const [recordScore, setRecordScore] = useState<number>(Number(localStorage.getItem("record_score-game2")) || 0);
    const intervalRef = useRef<number>(undefined);
    const buttonValidateRef = useRef<HTMLButtonElement>(null);
    const timeBeforeNextWord = 5000;

    function levelConvert(level: string): {time: number, nbWord: number, nbSameWord: number} {
        switch (level) {
            case "easy": return {time: 2000, nbWord: 10, nbSameWord: 1};
            case "medium": return {time: 1000, nbWord: 15, nbSameWord: 2};
            case "hard": return {time: 800, nbWord: 20, nbSameWord: 3};
            default: return {time: 2000, nbWord: 10, nbSameWord: 1};
        }
    }

    function getRandomWords(nbWord: number, nbSameWord: number): {words: string[], sameWords: string[], sameWordsIndex: number[]} {
        let sameWordLength = 0;
        if (nbSameWord > nbWord) sameWordLength = nbWord;
        else sameWordLength = nbSameWord;
        
        const words: string[] = [];
        const sameWords: string[] = [];
        for (let i = 0; i < nbWord - sameWordLength; i++) {
            let randomIndex = Math.floor(Math.random() * wordList.length);
            while (words.some(w => w === wordList[randomIndex])) {
                randomIndex = Math.floor(Math.random() * wordList.length);
            }
            words.push(wordList[randomIndex]);
            if (sameWordLength > 0 && i < sameWordLength) {
                words.push(wordList[randomIndex]);
                sameWords.push(wordList[randomIndex]);
            }
        }

        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }

        const sameWordsIndex: number[] = [];
        const occurrenceCount: Record<string, number> = {};
        words.forEach((word, index) => {
            if (sameWords.includes(word)) {
                occurrenceCount[word] = (occurrenceCount[word] || 0) + 1;
                if (occurrenceCount[word] === 2) {
                    sameWordsIndex.push(index);
                }
            }
        });
        
        return {
            words: words,
            sameWords: sameWords,
            sameWordsIndex: sameWordsIndex
        };
    }

    function resetRandomWords() {
        const rw = getRandomWords(levelConvert(levelActive).nbWord, levelConvert(levelActive).nbSameWord);
        setRandomWords(rw.words);
        setSameWords(rw.sameWords);
        setSameWordsIndex(rw.sameWordsIndex);
        setCurrentIndexWord(0);
    }

    function resetAndNextListWord() {
        setTimeout(() => {
            setVictoryStatus("En cours");
            setFoundWords([]);
            setWrongAnswer(0);
            resetRandomWords();
        }, timeBeforeNextWord);
    }

    function checkVictory() {
        if (victoryStatus === "En cours" && randomWords.length > 0 && currentIndexWord >= randomWords.length) {
            if (foundWords.length === sameWords.length && wrongAnswer === 0) {
                setVictoryStatus("Victoire");
                setScore(prevScore => prevScore + sameWords.length);
            }
            else {
                setVictoryStatus("Défaite");
                setScore(prevScore => prevScore - sameWordsIndex.length);
            }
            clearInterval(intervalRef.current);
            resetAndNextListWord();
        }
    }

    function clickValidate() {
        if (currentIndexWord < randomWords.length - 1) {
            if (sameWords.some(w => w === currentWord) && sameWordsIndex.some(i => i === currentIndexWord)) {
                setScore(prevScore => prevScore + 1);
                setFoundWords(prevWords => [...prevWords, currentWord]);
            }
            else {
                setScore(prevScore => prevScore - 1);
                setWrongAnswer(prevWrongAnswer => prevWrongAnswer + 1);
            }            
            clearInterval(intervalRef.current);
            setCurrentWord(randomWords[currentIndexWord + 1]);
            setCurrentIndexWord(prevIndex => prevIndex + 1);
        }
        checkVictory();
    }

    function clickSave() {
        if (score > recordScore) {
            localStorage.setItem("record_score-game2", score.toString());
            setScore(0);
            setRecordScore(Number(localStorage.getItem("record_score-game2")) || 0);
        }
    }

    const EndWordList = () => {
        const endWordList: ReactElement[] = [];
        randomWords.map((word, index) => {
            if (index === 0) {
                endWordList.push(
                    <span key={index} className="victory-word">
                        <span className={`${sameWords.some(w => w === word) ? " same-word" : ""}`}>{word}</span>
                    </span>
                );
            }
            else {
                endWordList.push(
                    <span key={index} className="victory-word">
                        <span className="victory-dash"> - </span>
                        <span className={`${sameWords.some(w => w === word) ? " same-word" : ""}`}>{word}</span>
                    </span>
                );
            }
        });
        return endWordList;
    }

    useEffect(() => {
        resetRandomWords();
    }, [levelActive]);

    useEffect(() => {
        setCurrentWord(randomWords[currentIndexWord]);
    }, [randomWords]);

    useEffect(() => {
        if (buttonValidateRef.current) {
            buttonValidateRef.current.focus();
        }
        checkVictory();
    }, [currentWord, currentIndexWord, victoryStatus]);

    useEffect(() => {
        if (currentIndexWord < randomWords.length) {
            intervalRef.current = window.setInterval(() => {
                setCurrentIndexWord((prevIndex) => prevIndex + 1);
            }, levelConvert(levelActive).time);
            setCurrentWord(randomWords[currentIndexWord]);
            return () => clearInterval(intervalRef.current);
        }
        else {
            clearInterval(intervalRef.current);
            setCurrentWord("_");
        }
    }, [currentIndexWord, currentWord, levelActive]);

    return (
        <div className="game2">
            <GameBar barName="header" numGame={2} contents={[
                gameTitle,
                score,
                <>{recordScore}<img className="record-score-image" src={crownImage} alt="crown"/></>
            ]}/>
            <LevelSelector
                levels={["easy", "medium", "hard"]}
                levelActive={level => setLevelActive(level)}
                levelNames={["Facile", "Moyen", "Difficile"]}
                levelDefault="easy"/>
            <div className="game2-content">
                <div className="box-word-big">
                    <div
                        key={currentWord}
                        className="current-letter"
                        style={{ animation: `slideTopBottom ${levelConvert(levelActive).time / 1000}s` }}>
                        {currentWord}
                    </div>
                </div>
                {victoryStatus !== "En cours" && (
                    <div className="victory-content">
                        <div className="victory-word-list">
                            <EndWordList/>
                        </div>
                        <div className="victory-status">
                            <p style={{color: victoryStatus === "Victoire" ? "gold" : "blueviolet"}}>{victoryStatus}</p>
                        </div>
                    </div>
                )}
            </div>
            <GameBar barName="footer" numGame={1} divDefault={false} contents={[
                <button
                    ref={buttonValidateRef}
                    className="button-click-footer game1-footer-0"
                    onClick={clickValidate}
                    onKeyDown={e => e.key === "Space" && clickValidate()}
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
                </button>
            ]}/>
            <ArduinoConnect clickButton={clickValidate} arduinoData={{data: score, dataName: "Score"}}/>
        </div>
    );
}

export default Game2;