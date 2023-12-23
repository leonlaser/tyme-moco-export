import { UtilRequestResponse } from "./global";

const DEFAULT_REQUEST_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export default class MocoApiClient {
  private apiKey: string;
  private domain: string;
  private baseURL: string;
  private authHeader: Record<string, string>;

  constructor(domain: string | null, apiKey: string | null) {
    this.apiKey = apiKey;
    this.domain = domain;
    this.baseURL = `https://${domain}.mocoapp.com/api/v1/`;
    this.authHeader = { Authorization: `Token token=${apiKey}` };
  }

  public checkConnection() {
    if (this.hasValidApiKey()) {
      tyme.showAlert("Moco API 👍", utils.localize("api.connectionOk"));
    } else {
      tyme.showAlert("Moco API 👎", utils.localize("api.connectionBad"));
    }
  }

  public hasValidApiKey(): boolean {
    if (!this.apiKey || !this.domain) {
      return false;
    }

    const response = this.request("session");
    return response.statusCode === 200;
  }

  request(path: string, params = null): UtilRequestResponse<any | null> {
    const response = utils.request(
      this.baseURL + path,
      "GET",
      {
        ...DEFAULT_REQUEST_HEADERS,
        ...this.authHeader,
      },
      params,
    );

    const statusCode = response["statusCode"];
    const result = response["result"];

    if (statusCode === 200) {
      return {
        statusCode,
        result: JSON.parse(result),
      };
    } else {
      tyme.showAlert("Moco API Error", JSON.stringify(response));
      return {
        statusCode,
        result: null,
      };
    }
  }

  postJSON(path: string, params = null): UtilRequestResponse<any | null> {
    if (DRY_RUN_MODE) {
      return {
        statusCode: 200,
        result: { debug: true, path, params },
      };
    }
    const response = utils.request(
      this.baseURL + path,
      "POST",
      {
        ...DEFAULT_REQUEST_HEADERS,
        ...this.authHeader,
      },
      params,
    );

    const statusCode = response["statusCode"];
    const result = response["result"];

    if (statusCode === 200) {
      return {
        statusCode,
        result: JSON.parse(result),
      };
    } else {
      throw new Error(
        "Moco API Error: " +
          response.statusCode +
          " | " +
          JSON.stringify(response),
      );
    }
  }
}
