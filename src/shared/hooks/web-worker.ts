import { useEffect, useRef, useState } from "react";

export const useWebWorker = (workerUrl: string) => {
  const [result, setResult] = useState(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL(workerUrl, import.meta.url), {
      type: "module",
    });
    workerRef.current.addEventListener("message", (event) => {
      setResult(event.data);
    });
    return () => {
      workerRef.current?.terminate();
    };
  }, [workerUrl]);

  const sendMessage = (message: string) => {
    workerRef.current?.postMessage(message);
  };

  return { result, sendMessage };
};
