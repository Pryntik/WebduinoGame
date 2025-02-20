import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from "react-router";

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App numGame={1} />} />
                <Route path="/game1" element={<App numGame={1} />} />
                <Route path="/game2" element={<App numGame={2} />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;