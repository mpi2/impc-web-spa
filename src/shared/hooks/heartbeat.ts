import { HeartbeatService } from "@/api-service/heartbeat.ts";
import { useEffect, useState } from "react";

export function useHeartbeatService() {
  const heartbeatService = HeartbeatService.instance;
  const [isStable, setIsStable] = useState<boolean>(true);

  useEffect(() => {
    heartbeatService.setUp(setIsStable);
    return () => {
      heartbeatService.teardown();
    };
  }, []);

  return { connectionIsStable: isStable };
}
