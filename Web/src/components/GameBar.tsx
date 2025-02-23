import '../styles/AllGames.css';
import { Fragment } from 'react/jsx-runtime';
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
                : <Fragment key={index}>{content}</Fragment>
            ))}
        </div>
    );
}

export default GameBar;