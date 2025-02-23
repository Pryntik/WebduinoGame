import '../styles/Games.css';
import '../styles/Game2.css';
import crownImage from '../assets/crown.png';
import GameBar from '../components/GameBar';
import LevelSelector from '../components/LevelSelector';
import ArduinoConnect from '../components/ArduinoConnect';
import { useEffect, useRef, useState } from 'react';
import { wordList } from '../data/data';

type Game2Type = {
    gameTitle: string,
}

const Game2 = ({gameTitle}: Game2Type) => {
    const [levelActive, setLevelActive] = useState<string>("easy");
    const [randomWords, setRandomWords] = useState<string[]>([]);
    const [currentWord, setCurrentWord] = useState<string>("_");
    const [currentIndexWord, setCurrentIndexWord] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [recordScore, setRecordScore] = useState<number>(Number(localStorage.getItem("record_score-game2")) || 0);
    const intervalRef = useRef<number>(undefined);

    function levelToTime(level?: string) {
        switch (level) {
            case "easy": return 2000;
            case "medium": return 1000;
            case "hard": return 500;
            default: return 2000;
        }
    }

    function getRandomWords(nbWord: number, nbSameWord: number): string[] {
        let sameWordLength = 0;
        if (nbSameWord > 1) {
            if (nbSameWord > nbWord) sameWordLength = nbWord;
            else sameWordLength = nbSameWord;
        }
        
        const words: string[] = [];
        const sameIndex: number[] = [];
        for (let i = 0; i < nbWord - sameWordLength; i++) {
            const randomIndex = Math.floor(Math.random() * wordList.length);
            words.push(wordList[randomIndex]);
            if (sameWordLength > 0 && i < sameWordLength) {
                sameIndex.push(randomIndex);
            }
        }

        for (let i = 0; i < sameIndex.length; i++) {
            words.push(wordList[sameIndex[i]]);
        }

        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        
        return words;
    }

    useEffect(() => {
        setRandomWords(getRandomWords(10, 2));
        setCurrentIndexWord(0);
    }, []);

    useEffect(() => {
        setCurrentWord(randomWords[currentIndexWord]);
    }, [randomWords]);

    useEffect(() => {
        if (currentIndexWord < randomWords.length) {
            intervalRef.current = window.setInterval(() => {
                setCurrentIndexWord((prevIndex) => prevIndex + 1);
            }, levelToTime(levelActive));
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
                        style={{ animation: `slideTopBottom ${levelToTime(levelActive) / 1000}s` }}>
                        {currentWord}
                    </div>
                </div>
            </div>
            <GameBar barName="footer" numGame={1} divDefault={false} contents={[
                <button
                    className="button-click-footer game1-footer-0"
                    onClick={() => {}}
                    onKeyDown={e => e.key === "Space" && {}}
                    autoFocus>
                    Valider
                </button>,
                <button
                    className="button-click-footer game1-footer-1"
                    onClick={() => {}}
                    disabled={score <= recordScore}
                    style={{
                        backgroundColor: score <= recordScore ? "grey" : "paleturquoise",
                        cursor: score <= recordScore ? "not-allowed" : "pointer"
                    }}>
                    Sauvegarder
                </button>
            ]}/>
            <ArduinoConnect clickButton={() => {}} arduinoData={{data: score, dataName: "Score"}}/>
        </div>
    );
}

export default Game2;