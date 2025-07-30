import { PROTOTYPE_DATA_ROOT } from "./index.ts";

type RequestResult = {
  success: boolean;
  responseTime: string;
  status: number;
};

export class HeartbeatService {
  static #instance: HeartbeatService;
  private intervalId: number | undefined;
  private delay: number = 10000;
  private lastResults: Array<RequestResult> = [];
  public isStable = true;

  private constructor() {}

  public static get instance(): HeartbeatService {
    if (!HeartbeatService.#instance) {
      HeartbeatService.#instance = new HeartbeatService();
    }
    return HeartbeatService.#instance;
  }

  public setUp() {
    this.intervalId = setInterval(
      this.checkFTPConnection.bind(this),
      this.delay,
    );
  }

  public teardown() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async checkFTPConnection() {
    let response;
    const startTime = performance.now();
    try {
      response = await fetch(PROTOTYPE_DATA_ROOT, {
        method: "HEAD",
      });
    } catch (error) {
      console.log("Error on Heartbeat service: ", error);
    }
    const endTime = performance.now();
    let result: RequestResult = {
      success: false,
      responseTime: (endTime - startTime).toFixed(3),
      status: response?.status ?? 404,
    };
    if (response?.ok) {
      result.success = true;
    }
    if (this.lastResults.length === 10) {
      // remove the oldest result, ensure only 10 results are saved
      this.lastResults.shift();
    }
    this.lastResults.push(result);
    this.checkResults();
  }

  private checkResults() {
    const totalResults = this.lastResults.length;
    const successfulResults = this.lastResults.filter(
      (res) => res.success,
    ).length;
    this.isStable = successfulResults / totalResults >= 0.5;
  }
}
