import { ReactElement } from "react";

export type ContentType = ReactElement | string | number;

export type VictoryStatus = "En cours" | "Victoire" | "Défaite";

export type GameNumberType = 1 | 2;

export type ArduinoDataType = {
    data: number | string;
    dataName: string;
}