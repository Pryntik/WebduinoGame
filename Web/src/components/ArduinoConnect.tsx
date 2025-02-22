import '../styles/Arduino.css';
import ArduinoLogo from '../assets/Arduino_Logo.png';
import { useState, useRef, useEffect } from "react";
import { NavigatorSerial, SerialPort } from "../types/SerialType";
import { ArduinoDataType } from "../types/Type";

type ArduinoConnectType = {
    clickButton(): void,
    arduinoData: ArduinoDataType,
};

const ArduinoConnect = ({clickButton, arduinoData}: ArduinoConnectType) => {
    const [isSerialConnected, setIsSerialConnected] = useState(false);
    const [receivedData, setReceivedData] = useState<string>("");
    const serialPortRef = useRef<SerialPort | null>(null);
    const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
    const writerRef = useRef<WritableStreamDefaultWriter | null>(null);

    // Function to connect to serial port
    const connectSerialPort = async () => {
        if (!('serial' in navigator)) {
            console.warn('Web Serial API not supported');
            return;
        }
    
        try {
            const port = await (navigator as NavigatorSerial).serial.requestPort();
            await port.open({ baudRate: 9600 });
    
            serialPortRef.current = port;
            setIsSerialConnected(true);
    
            const reader = port.readable.getReader();
            readerRef.current = reader;

            const writer = port.writable.getWriter();
            writerRef.current = writer;
        }
        catch (error) {
            console.error('Serial communication error:', error);
            setIsSerialConnected(false);
        }
    };

    // Cleanup function for serial connection
    const disconnectSerialPort = async () => {
        if (readerRef.current) {
            await readerRef.current.cancel();
            readerRef.current.releaseLock();
            readerRef.current = null;
        }
        if (writerRef.current) {
            await writerRef.current.close();
            writerRef.current.releaseLock();
            writerRef.current = null;
        }

        if (serialPortRef.current) {
            await serialPortRef.current.close();
            serialPortRef.current = null;
        }
    
        setIsSerialConnected(false);
    };

    const sendDataToArduino = async (arduinoData: ArduinoDataType) => {
        if (!writerRef.current) {
            console.warn("Writer non disponible, connexion série requise");
            return;
        }
    
        try {
            const encoder = new TextEncoder();
            const dataMessage = `${arduinoData.dataName.toUpperCase()}:${arduinoData.data}\n`; // Format du message
            await writerRef.current.write(encoder.encode(dataMessage));
            console.log(`${arduinoData.dataName} envoyé :`, dataMessage);
        } catch (error) {
            console.error(`Erreur lors de l'envoi de "${arduinoData.dataName}" :`, error);
        }
    };

    // Lire les données reçues dans un useEffect
    useEffect(() => {
        if (!isSerialConnected || !readerRef.current) return;

        const readData = async () => {
            if (!readerRef.current) return;

            const reader = readerRef.current;
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const decoder = new TextDecoder();
                    const data = decoder.decode(value).trim();
                    console.log("Donnée reçue :", data);

                    // Mettre à jour le state avec la donnée reçue
                    setReceivedData(data);
                }
            } catch (error) {
                console.error("Erreur lors de la lecture des données série :", error);
            }
        };

        readData();
    }, [isSerialConnected]);

    // Réagir à la mise à jour des données reçues
    useEffect(() => {
        if (receivedData === "A") {
            clickButton();
        }
    }, [receivedData]);

    useEffect(() => {
        if (isSerialConnected) {
            sendDataToArduino(arduinoData);
        }
    }, [arduinoData, isSerialConnected]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            disconnectSerialPort();
        };
    }, []);

    if (isSerialConnected === false) {
        return (
            <img
                className="button-arduino connect-arduino"
                src={ArduinoLogo}
                alt="connect arduino"
                onClick={connectSerialPort}/>
        );
    }
    else {
        return (
            <img
                className="button-arduino disconnect-arduino"
                src={ArduinoLogo}
                alt="disconnect arduino"
                onClick={disconnectSerialPort}/>
        );
    }
}

export default ArduinoConnect;