import { useEffect, useRef, useState } from "react";
import { SearchWebWorkerResult } from "@/models";

export const useGeneSearchResultWorker = () => {
  const [eventResult, setEventResult] = useState<SearchWebWorkerResult | null>(
    null,
  );
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./gene-search-results-worker.js", import.meta.url),
      {
        type: "module",
      },
    );
    workerRef.current.addEventListener("message", (event) => {
      setEventResult(event.data);
    });
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const sendMessage = (message: string) => {
    workerRef.current?.postMessage(message);
  };

  return { eventResult, sendMessage };
};
