declare module "react-native-sse" {
  export default class EventSource {
    constructor(url: string, options?: unknown);
    addEventListener(type: string, listener: (event: unknown) => void): void;
    removeEventListener(type: string, listener: (event: unknown) => void): void;
    close(): void;
  }
}