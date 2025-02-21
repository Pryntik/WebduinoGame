export type SerialPortRequestOptions = {
    filters?: { usbVendorId?: number }[];
};

export type SerialPort = {
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream;
    writable: WritableStream;
};

export type Serial = {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
};

export type NavigatorSerial = {
    serial: Serial;
};