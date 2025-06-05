import { useEffect, useRef, useState } from "react";

export const useWebWorker = <T>(workerUrl: string) => {
  const [eventResult, setEventResult] = useState<T | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL(workerUrl, import.meta.url), {
      type: "module",
    });
    workerRef.current.addEventListener("message", (event) => {
      setEventResult(event.data);
    });
    return () => {
      workerRef.current?.terminate();
    };
  }, [workerUrl]);

  const sendMessage = (message: string) => {
    workerRef.current?.postMessage(message);
  };

  return { eventResult, sendMessage };
};
