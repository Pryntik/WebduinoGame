import Game1 from "../games/Game1";
import Game2 from "../games/Game2";

type GameSelectorType = {
    numGame: number;
}

const GameSelector = ({numGame}: GameSelectorType) => {
    function selectGame(numGame: number) {
        switch (numGame) {
            case 1: return <Game1/>;
            case 2: return <Game2/>;
            default: return <Game1/>;
        }
    }
    return (
        <div className="gameSelector">
            {selectGame(numGame)}
        </div>
    );
}

export default GameSelector;