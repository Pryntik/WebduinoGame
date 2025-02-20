interface SerialPortRequestOptions {
    filters?: { usbVendorId?: number }[];
}

interface SerialPort {
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream;
}

interface Serial {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
}

interface NavigatorSerial {
    serial: Serial;
}

interface Navigator {
    serial?: Serial;
}