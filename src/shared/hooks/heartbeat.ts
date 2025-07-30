import { HeartbeatService } from "@/api-service/heartbeat.ts";
import { useEffect, useState } from "react";

export function useHeartbeatService() {
  const heartbeatService = HeartbeatService.instance;
  const [isStable, setIsStable] = useState(heartbeatService.isStable);
  useEffect(() => {
    heartbeatService.setUp();
    return () => {
      heartbeatService.teardown();
    };
  }, []);

  useEffect(() => {
    console.log("Change in heartbeatService to ", heartbeatService.isStable);
    setIsStable(heartbeatService.isStable);
  }, [heartbeatService.isStable]);

  return { connectionIsStable: isStable };
}
