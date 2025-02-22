import './styles/App.css';
import NavBar from './components/NavBar';
import GameSelector from './components/GameSelector';
import { GameNumberType } from './types/Type';

type AppType = {
  numGame: GameNumberType;
}

const App = ({numGame}: AppType) => {
    return (
    <div className="app">
        <NavBar/>
        <GameSelector numGame={numGame}/>
    </div>
    )
}

export default App;