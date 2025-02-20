import '../styles/AllGames.css';
import { ContentType } from "../types/Type";

type GameHeaderType = {
    numGame: number,
    contents: ContentType[],
    divDefault?: boolean,
}

const GameHeader = ({numGame, contents, divDefault = true}: GameHeaderType) => {
    return (
        <div className={`game${numGame}-header`}>
            {contents.map((content, index) => (
                divDefault ? <div key={index} className={`game${numGame}-header-${index}`}>{content}</div>
                : <>{content}</>
            ))}
        </div>
    );
}

export default GameHeader;