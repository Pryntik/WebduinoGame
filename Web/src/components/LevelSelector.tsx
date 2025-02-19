import { useEffect, useState } from "react";

type GameSelectorType<LevelType extends string> = {
    levels: LevelType[];
    levelActive: (level: string) => void;
    levelNames?: string[];
    levelDefault?: LevelType;
}

function LevelSelector<LevelType extends string>({levels, levelActive, levelNames, levelDefault}: GameSelectorType<LevelType>) {
    const [level, setLevel] = useState<LevelType>(levelDefault || levels[0]);

    useEffect(() => {
        levelActive(level);
    }, [level]);

    return (
        <div className="level-zone">
            {levels.map((lvl, index) => (
                <button
                    key={index}
                    className={`button-level button-${lvl} ${level === lvl ? "button-level-active" : ""}`}
                    onClick={() => setLevel(lvl)}>
                    {levelNames && levelNames[index] ? levelNames[index] : lvl}
                </button>
            ))}
        </div>
    );
}

export default LevelSelector;