import '../styles/Games.css';
import '../styles/Game2.css';
import crownImage from '../assets/crown.png';
import GameBar from '../components/GameBar';
import LevelSelector from '../components/LevelSelector';
import { useState } from 'react';
import ArduinoConnect from '../components/ArduinoConnect';

type Game2Type = {
    gameTitle: string,
}

const Game2 = ({gameTitle}: Game2Type) => {
    const [levelActive, setLevelActive] = useState<string>("easy");
    const [score, setScore] = useState<number>(0);
    const [recordScore, setRecordScore] = useState<number>(Number(localStorage.getItem("record_score-game2")) || 0);
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