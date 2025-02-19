import '../styles/Games.css';
import '../styles/Game2.css';

type Game2Type = {
    gameTitle: string,
}

const Game2 = ({gameTitle}: Game2Type) => {
    return (
        <div className="game2">
            <div className="game2-header">
                {gameTitle}
            </div>
            <div className="game2-content">
                <p>Contenu du jeu 2</p>
            </div>
        </div>
    );
}

export default Game2;