import '../styles/AllGames.css';
import { ContentType } from "../types/Type";

type GameFooterType = {
    numGame: number,
    contents: ContentType[],
    divDefault?: boolean,
}

const GameFooter = ({numGame, contents, divDefault = true}: GameFooterType) => {
    return (
        <div className={`game${numGame}-footer`}>
            {contents.map((content, index) => (
                divDefault ? <div key={index} className={`game${numGame}-footer-${index}`}>{content}</div>
                : <>{content}</>
            ))}
        </div>
    );
}

export default GameFooter;