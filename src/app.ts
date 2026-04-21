import EventSource from "react-native-sse";

function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "http://" + url;
  }
  return url;
}

export function subscribe(
  baseURL: string,
  topic: string,
  handler: () => void
) {
  const url = normalizeUrl(baseURL);

  const es = new EventSource(`${url}/fono/subscribe/${topic}`);

  es.addEventListener("message", () => {
    handler();
  });

  es.addEventListener("error", (err: unknown) => {
    console.log("FoNotify RN error:", err);
  });

  return {
    close: () => {
      es.close();
    },
  };
}

export const subscribeFoNotify = subscribe;