import './styles/App.css';
import NavGame from './components/NavGame';
import GameSelector from './components/GameSelector';

type AppType = {
  numGame: number;
}

const App = ({numGame}: AppType) => {

  return (
    <div className="app">
      <NavGame/>
      <GameSelector numGame={numGame}/>
    </div>
  )
}

export default App
