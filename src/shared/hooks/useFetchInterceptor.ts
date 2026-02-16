import { setUpFetchInterceptor } from "@/api-service/interceptor.ts";
import { useEffect, useState } from "react";

export function useFetchInterceptor() {
  const [isReady, setIsReady] = useState(false);
  const onChange = (val: boolean) => {
    // @ts-ignore
    (window["__APP_IS_READY"] as any) = !val;
    setIsReady(!val);
    console.log("app is ready", !val);
  };

  useEffect(() => {
    setUpFetchInterceptor(onChange);
  }, []);

  return { appIsReady: isReady };
}
