import '../styles/AllGames.css';
import { ContentType, GameNumberType } from "../types/Type";

type GameBarType = {
    barName: string,
    numGame: GameNumberType,
    contents: ContentType[],
    divDefault?: boolean,
}

const GameBar = ({barName, numGame, contents, divDefault = true}: GameBarType) => {
    return (
        <div className={`game${numGame}-${barName}`}>
            {contents.map((content, index) => (
                divDefault ? <div key={index} className={`game${numGame}-${barName}-${index}`}>{content}</div>
                : <>{content}</>
            ))}
        </div>
    );
}

export default GameBar;