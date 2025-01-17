import '../styles/Nav.css';
import { useNavigate } from "react-router";

const NavGame = () => {
    const navigate = useNavigate();

    return (
        <nav className="navGame">
            <button className="navGame_button" onClick={() => navigate('/game1')}>
                Jeu 1
            </button>
            <button className="navGame_button" onClick={() => navigate('/game2')}>
                Jeu 2
            </button>
        </nav>
    )
}

export default NavGame;