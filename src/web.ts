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

  es.onmessage = () => handler();

  es.onerror = (err) => {
    console.error("FoNotify web error:", err);
  };

  return {
    close: () => es.close(),
  };
}