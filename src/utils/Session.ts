import localforage from "localforage";
import { StringUtils } from "./StringUtils";
import * as OauthUtils from "./OauthUtils";
import { UrlString } from "./UrlString";

export interface OAuthConfig {
  clientId: string;
  username?: string;
  baseUrl: string;
  knownAuthorities?: string[];
}
const STORAGE_KEYS = [
  "id_token",
  "refresh_token",
  "refresh_token_expires_in",
  "id_token_expires_in",
  "scope",
  "token_type",
  "profile_info",
  "not_before",
  "code",
  "code_verifier",
];

export type Tokens = {
  id_token?: string;
  refresh_token: string;
  refresh_token_expires_in: string;
  id_token_expires_in?: string;
  scope?: string;
  token_type: string;
  profile_info?: string;
  not_before?: string;
};

type AccountType = {
  id: number;
  name: string;
  email: string;
  device?: { type: string; assetId: string; sensors: string[] };
  tokens?: Tokens;
};

export type CurrentAccountType = Omit<AccountType, "tokens">;

export const ACCOUNTS: AccountType[] = [
  {
    id: 1,
    name: "GasBeacon1",
    email: "gasbeacon.1@cosys-demo.de",
    device: { type: "pac", assetId: "GasBeacon1", sensors: ["CH4"] },
  },
  {
    id: 2,
    name: "GasBeacon2",
    email: "gasbeacon.2@cosys-demo.de",
    device: { type: "pac", assetId: "GasBeacon2", sensors: ["CH4"] },
  },
  {
    id: 3,
    name: "GasBeacon3",
    email: "gasbeacon.3@cosys-demo.de",
    device: { type: "pac", assetId: "GasBeacon3", sensors: ["CH4"] },
  },
  {
    id: 4,
    name: "Firefighter1",
    email: "firefighter.1@cosys-demo.de",
    device: { type: "pac", assetId: "Firefighter1", sensors: ["CO"] },
  },
  {
    id: 5,
    name: "Firefighter2",
    email: "firefighter.2@cosys-demo.de",
    device: { type: "pac", assetId: "Firefighter2", sensors: ["CO"] },
  },
  {
    id: 6,
    name: "Firefighter3",
    email: "firefighter.3@cosys-demo.de",
    device: { type: "pac", assetId: "Firefighter3", sensors: ["CO"] },
  },
  {
    id: 7,
    name: "DroneIndustrial",
    email: "drone.industrial@cosys-demo.de",
    device: { type: "pac", assetId: "DroneIndustrial", sensors: ["CO"] },
  },
  {
    id: 8,
    name: "DroneFirefighter",
    email: "drone.firefighter@cosys-demo.de",
    device: { type: "pac", assetId: "DroneFirefighter", sensors: ["CO"] },
  },
  {
    id: 9,
    name: "Busstop1",
    email: "busstop.1@cosys-demo.de",
    device: { type: "x-am 8000", assetId: "Busstop1", sensors: ["NO2", "O3"] },
  },
  {
    id: 10,
    name: "GarbageTruck1",
    email: "garbarge-truck.1@cosys-demo.de",
    device: { type: "pac", assetId: "GarbageTruck1", sensors: ["NO2"] },
  },
  {
    id: 11,
    name: "GarbageTruck2",
    email: "garbarge-truck.2@cosys-demo.de",
    device: { type: "pac", assetId: "GarbageTruck2", sensors: ["NO2"] },
  },
  {
    id: 12,
    name: "GasBeaconMesh",
    email: "hojad58534@secbuf.com",
    device: {
      type: "pac",
      assetId: "GasBeaconMesh",
      sensors: ["O3", "NO2", "CO", "CO2"],
    },
  },
];

export class Session {
  private _oauthConfig: OAuthConfig;
  private accounts: AccountType[] = ACCOUNTS;
  private _current_account!: CurrentAccountType;
  get current_account() {
    return this._current_account;
  }
  public get oauthConfig(): OAuthConfig {
    return this._oauthConfig;
  }
  //   private _code: string;
  private _pkcePair?: {
    code_verifier: string;
    code_challange: string;
  };
  private async setPKCE() {
    return (this._pkcePair = await OauthUtils.generatePKCE());
  }

  private setToken(account: CurrentAccountType, tokens: Tokens) {
    let idx = 0;
    for (const acc of this.accounts) {
      if (acc["email"] === account["email"]) {
        this.accounts[idx]["tokens"] = tokens;
      }
      idx++;
    }
  }

  //   private _outhState: {};

  constructor(oauthConfig: OAuthConfig, initial_account?: CurrentAccountType) {
    if (StringUtils.isEmpty(oauthConfig.baseUrl)) {
      // Throws error if url is empty
      throw console.error("the given url is empty! => ", oauthConfig.baseUrl);
    }
    if (initial_account) {
      this._current_account = initial_account;
    } else {
      this._current_account = this.accounts[0];
    }

    this._oauthConfig = oauthConfig;
  }

  async acquireAccessTokenInteractive(account: {
    id: number;
    email: string;
    name: string;
  }) {
    const { code_challange, code_verifier } = await this.setPKCE();
    const nonce = OauthUtils.generateNonce();
    const state = OauthUtils.generateState();
    // console.log("ver: ", code_verifier, "chal: ", code_challange);

    const { baseUrl, clientId } = this._oauthConfig;

    const auth_url = `${baseUrl}/oauth2/v2.0/authorize`;
    const querries = {
      client_id: `client_id=${clientId}`,
      scope: `scope=openid%20offline_access%20profile`,
      //   redirect_uri: "redirect_uri=urn:ietf:wg:oauth:2.0:oob",
      redirect_uri:
        "redirect_uri=" + encodeURIComponent("http://localhost:4200"),
      //   redirect_uri: "http%3A%2F%2F127.0.0.1%3A4200",
      response_mode: "response_mode=fragment",
      response_type: "response_type=code",
      code_challenge: `code_challenge=${code_challange}`,
      code_challenge_method: "code_challenge_method=S256",
      login_hint: `login_hint=${account["email"]}`,
      nonce: `nonce=${nonce}`,
      state: `state=${state}`,
    };
    let url = auth_url;
    for (const [_, item] of Object.entries(querries)) {
      url = UrlString.appendQueryString(url, item);
    }
    await localforage.setItem("account_id", account["id"]);
    await localforage.setItem("account_email", account["email"]);
    await localforage.setItem("account_name", account["name"]);
    await localforage.setItem("code_verifier", code_verifier);

    // await this._scheduleNext("getRefreshTokenByCode");
    await localforage.setItem("acquired_token_interactive_requested", true);

    return OauthUtils.navigateWindow(url);
  }
  async sendLogoutRequest() {
    const { baseUrl } = this._oauthConfig;

    const uri =
      baseUrl +
      "/oauth2/v2.0/logout?post_logout_redirect_uri=" +
      encodeURIComponent("http://localhost:4200/gas-detection-connect");

    return OauthUtils.navigateWindow(uri);
  }

  async _getRefreshTokenByCode() {
    const clientId = this._oauthConfig["clientId"];
    const baseUrl = this._oauthConfig["baseUrl"];
    const code = await localforage.getItem("code");
    const code_verifier = await localforage.getItem("code_verifier");
    await this._loadCurrentAccount();
    // console.log("from get token by code");

    const flow = {
      client_id: `client_id=${clientId}`,
      grant_type: "grant_type=authorization_code",
      code: `code=${code}`,
      code_verifier: `code_verifier=${code_verifier}`,
    };
    const _headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    });

    let url = baseUrl + "/oauth2/v2.0/token";
    for (const [_, item] of Object.entries(flow)) {
      url = UrlString.appendQueryString(url, item);
    }

    const refreshTokenResp = await fetch(url, {
      headers: _headers,
      method: "POST",
    });

    if (!refreshTokenResp.ok) {
      throw new Error("something went wrong!");
    }

    const resp = await refreshTokenResp.json();

    for (const key of Object.keys(resp)) {
      await localforage.setItem(key, resp[key]);
    }
    const next = await this._getNext();
    if (next === "sendRefreshTokenToServer") {
      await this.sendRefreshTokenToDB(this._current_account, false);
      await this._removeNext(next);
    }

    this.setToken(this.current_account, resp as Tokens);

    localforage.setItem("acquired_token_interactive_ok", true);
    await this.sendLogoutRequest();
    return resp;
  }

  async _loadFromCache() {
    const items = {};
    const current_account = {} as CurrentAccountType;
    const keys = await localforage.keys();
    for (const key of keys) {
      if (
        key === "account_id" ||
        key === "account_email" ||
        key === "account_name"
      ) {
        current_account[key.split("_")[1]] = await localforage.getItem(key);
      } else if (key !== "code" && key !== "code_verifier") {
        items[key] = await localforage.getItem(key);
      }
    }
    await this._setCurrentAccount(false, current_account);
    this.setToken(this._current_account, items as Tokens);

    await this._clearStorage();
  }

  async sendRefreshTokenToDB(account: CurrentAccountType, forceUpdate = false) {
    // if (!this.tokens || forceUpdate) {
    //   console.log("thre is no token");
    //   await this._scheduleNext("sendRefreshTokenToServer");
    //   await this.aquireAccessTokenInteractive();
    // }

    const tokens = this.getToken(account);

    if (!tokens) {
      throw new Error("there is no token cached yet!");
    }

    const now = new Date();
    const dateTime = now.toISOString();
    const idx = dateTime.search("T");
    const date = dateTime.slice(0, idx);
    const time = dateTime.slice(idx + 1, -4);

    const data = {
      id: account["id"],
      name: account["name"],
      email: account["email"],
      rt: tokens["refresh_token"],
      time: time,
      date: date,
      expire: tokens["refresh_token_expires_in"],
    };
    const url = "http://212.227.175.162/gdc/post.php";
    // const url = "http://localhost/gdc/post.php";
    const resp = await fetch(url, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      throw new Error("cannot send data! reason:" + resp.text);
    }
    let resp_json: object | null = null;
    try {
      resp_json = await resp.json();
    } catch (er) {
      throw new Error("cannot convert to json! reason: " + er);
    }

    return resp_json;
  }

  async obtainRefreshTokenFromDB(account: CurrentAccountType) {
    let resp;
    const url = "http://212.227.175.162/gdc/get.php";
    // const url = "http://localhost/gdc/get.php";
    try {
      resp = await fetch(url, {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
      });
    } catch (e) {
      throw new Error("cannot fetch data from server! " + e);
    }
    let resp_data;
    try {
      resp_data = await resp.json();
    } catch (e) {
      throw new Error("error converting to json " + e);
    }
    const result = resp_data.payload[0];

    const tokens = {} as Tokens;
    tokens["refresh_token"] = result["rt"];
    tokens["refresh_token_expires_in"] = result["expire"];
    tokens["token_type"] = "Baerer";

    this.setToken(account, tokens);

    return true;
  }

  async obtainTokenWithRefreshToken(account: CurrentAccountType) {
    const clientId = this._oauthConfig["clientId"];
    const tokens = this.getToken(account);
    if (!tokens) {
      throw new Error(
        "no refresh token could be found for the account: " + account.name
      );
    }
    let refresh_token;
    try {
      refresh_token = tokens.refresh_token;
    } catch (e) {
      throw new Error("refresh token is not exit! " + e);
    }

    const flow = {
      client_id: `client_id=${clientId}`,
      grant_type: "grant_type=refresh_token",
      refresh_token: `refresh_token=${refresh_token}`,
    };

    let url = this._oauthConfig["baseUrl"] + "/oauth2/v2.0/token";
    for (const [_, item] of Object.entries(flow)) {
      url = UrlString.appendQueryString(url, item);
    }
    const _headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    };
    let fetch_result;
    try {
      fetch_result = await fetch(url, { method: "POST", headers: _headers });
    } catch (e) {
      throw new Error("an error accured! " + e);
    }

    let results;
    try {
      results = await fetch_result.json();
    } catch (e) {
      throw new Error("an error accured! " + e);
    }

    this.setToken(account, results as Tokens);
    // this.tokens = results;
    return true;
  }

  async addDeviceToGDC(device: {
    type: string;
    assetId: string;
    sensors: string[];
  }) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer tNzkyYS00...");

    var raw = JSON.stringify({
      type: "pac",
      assetId: "x9000",
      sensors: ["SO"],
    });

    var requestOptions = {
      method: "POST",

      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://fd-mc-staging.azurefd.net/gasdetectionconnect/incoming/assets",
      requestOptions as any
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
    // // data = {"type": "pac", "assetId": "dev-test01", "sensors": ["O2"]}
    // // asset2_put_resp = requests.post(
    // //     "https://fd-mc-staging.azurefd.net/gasdetectionconnect/incoming/assets",
    // //     headers={"Authorization": "Bearer " + refresh_token["id_token"], "Content-Type": "application/json"},
    // //     data=json.dumps(data),
    // // )
    // //@ts-ignore

    // // let resp;
    // // if (!this.tokens) {
    // //   console.error(
    // //     "there is no token! make sure you acquired token first and try again!"
    // //   );
    // //   throw new Error(
    // //     "there is no token! make sure you acquired token first and try again!"
    // //   );
    // // }

    // // const token = this.tokens["id_token"];
    // // const headers = new Headers();
    // const token =
    //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImdiTDdDbzI5Nzk0UENyQTJQdTBDZHpJVEhBWmpGU3dBd3RDYl9TQ1ZRSXMifQ.eyJleHAiOjE2MzE3MDg4MTksIm5iZiI6MTYzMTcwNTIxOSwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9kcmFlZ2VyY29ubmVjdC5iMmNsb2dpbi5jb20vMmJlYzI3YTItZWViMC00ZDhlLTgzYWUtMDdiNzhmZDFhMmQ1L3YyLjAvIiwic3ViIjoiYjc1OTdmOTEtZGNiZi00MzNiLWJmZWYtZDZhZWU4OGQ5YTFjIiwiYXVkIjoiYjZhZTMxNmItNzkyYS00ZmUwLTgyNjAtNmI1MmE4NmE2ODU3IiwiYWNyIjoiYjJjXzFhX2EwMDIwX3N0YWdpbmdfc2lnbnVwb3JzaWduaW4iLCJub25jZSI6ImFVYVpwb0tNZFFnZCIsImlhdCI6MTYzMTcwNTIxOSwiYXV0aF90aW1lIjoxNjMxNzA1MjE3LCJvaWQiOiJiNzU5N2Y5MS1kY2JmLTQzM2ItYmZlZi1kNmFlZTg4ZDlhMWMiLCJuYW1lIjoibHVlcGNtdyIsInJpZ2h0cyI6WyJBY2Nlc3MuTUNfQmFzaWMiLCJBY2Nlc3MuQWNjZXNzV2ViQXBwIiwiUmVwb3J0aW5nLk1hbmFnZUFsbCIsIlVzZXJBbmRSb2xlTWFuYWdlbWVudC5NYW5hZ2VBbGwiLCJQcml2YWN5LlNob3dOYW1lcyIsIlByaXZhY3kuU2hvd1dvcmtlcnMiLCJYRG9jay5YRG9ja0FkbWl0dGFuY2UiLCJYRG9ja0xldmVsLkxldmVsNSJdLCJtY1RlbmFudElkIjoiMzg3YWM3ZDAtYmU3OC00ZGM5LWEyZTEtNTQ1MTZiZWU1YWI5IiwidGlkIjoiMmJlYzI3YTItZWViMC00ZDhlLTgzYWUtMDdiNzhmZDFhMmQ1In0.ldSnP7ZwuNxi9HdcyfmgUFT8GnzC05wcOYig_y6khY-Sn72Rcx26DIH-mlPZDfLoLMxd0LyNm406jhvWeaoSLuFXKMt6hZaHcmlePhmdafmXb4CmqezI0LheS5sknZoePXCvJ7MKPrJuEbh4YCdDcTbyhNOvGeGmlZwy0aLtLPLlKNRFv9HrS1q30C5nfeMulPEsQIC2oCc44E9O-Ju5SvQT905jNJfsX0-DxjD4LSjH0d0XuEJnKC7MaZyjiQamdnQ48jogSLLFbfvrJpfdNfSnDlsgsJ16p1C2-dUfNP5L_F9C-qfLLrt7Ai96PZqVP7R1jIG0Zj2lQnJ7dA7RLQ";
    // console.log("Bearer " + token);
    // // headers.append("Authorization", "Bearer " + token);
    // // headers.append("Content-Type", "application/json; charset=utf-8");
    // // // headers.append("X-Requested-With", "XMLHttpRequest");
    // // headers.append("Accept", "*/*");
    // // // headers.append("Cache-Control", "no-cache");

    // const headers = {
    //   "User-Agent": "python-requests/2.25.1",
    //   "Accept-Encoding": "gzip, deflate",
    //   /* prettier-ignore */
    //   "Accept": "*/*",
    //   /* prettier-ignore */
    //   "Connection": "keep-alive",
    //   /* prettier-ignore */
    //   "Authorization":
    //     "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImdiTDdDbzI5Nzk0UENyQTJQdTBDZHpJVEhBWmpGU3dBd3RDYl9TQ1ZRSXMifQ.eyJleHAiOjE2MzE3MDg4MTksIm5iZiI6MTYzMTcwNTIxOSwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9kcmFlZ2VyY29ubmVjdC5iMmNsb2dpbi5jb20vMmJlYzI3YTItZWViMC00ZDhlLTgzYWUtMDdiNzhmZDFhMmQ1L3YyLjAvIiwic3ViIjoiYjc1OTdmOTEtZGNiZi00MzNiLWJmZWYtZDZhZWU4OGQ5YTFjIiwiYXVkIjoiYjZhZTMxNmItNzkyYS00ZmUwLTgyNjAtNmI1MmE4NmE2ODU3IiwiYWNyIjoiYjJjXzFhX2EwMDIwX3N0YWdpbmdfc2lnbnVwb3JzaWduaW4iLCJub25jZSI6ImFVYVpwb0tNZFFnZCIsImlhdCI6MTYzMTcwNTIxOSwiYXV0aF90aW1lIjoxNjMxNzA1MjE3LCJvaWQiOiJiNzU5N2Y5MS1kY2JmLTQzM2ItYmZlZi1kNmFlZTg4ZDlhMWMiLCJuYW1lIjoibHVlcGNtdyIsInJpZ2h0cyI6WyJBY2Nlc3MuTUNfQmFzaWMiLCJBY2Nlc3MuQWNjZXNzV2ViQXBwIiwiUmVwb3J0aW5nLk1hbmFnZUFsbCIsIlVzZXJBbmRSb2xlTWFuYWdlbWVudC5NYW5hZ2VBbGwiLCJQcml2YWN5LlNob3dOYW1lcyIsIlByaXZhY3kuU2hvd1dvcmtlcnMiLCJYRG9jay5YRG9ja0FkbWl0dGFuY2UiLCJYRG9ja0xldmVsLkxldmVsNSJdLCJtY1RlbmFudElkIjoiMzg3YWM3ZDAtYmU3OC00ZGM5LWEyZTEtNTQ1MTZiZWU1YWI5IiwidGlkIjoiMmJlYzI3YTItZWViMC00ZDhlLTgzYWUtMDdiNzhmZDFhMmQ1In0.ldSnP7ZwuNxi9HdcyfmgUFT8GnzC05wcOYig_y6khY-Sn72Rcx26DIH-mlPZDfLoLMxd0LyNm406jhvWeaoSLuFXKMt6hZaHcmlePhmdafmXb4CmqezI0LheS5sknZoePXCvJ7MKPrJuEbh4YCdDcTbyhNOvGeGmlZwy0aLtLPLlKNRFv9HrS1q30C5nfeMulPEsQIC2oCc44E9O-Ju5SvQT905jNJfsX0-DxjD4LSjH0d0XuEJnKC7MaZyjiQamdnQ48jogSLLFbfvrJpfdNfSnDlsgsJ16p1C2-dUfNP5L_F9C-qfLLrt7Ai96PZqVP7R1jIG0Zj2lQnJ7dA7RLQ",
    //   "Content-Type": "application/json",
    // };

    // // const axiosInstance = axios.create({
    // //   baseURL:
    // //     "https://fd-mc-staging.azurefd.net/gasdetectionconnect/incoming/assets",
    // //   timeout: 2000,
    // //   headers: headers,
    // // });

    // const _device = {
    //   type: "pac",
    //   assetId: "x9000",
    //   sensors: ["so2"],
    // };
    // const url =
    //   "https://fd-mc-staging.azurefd.net/gasdetectionconnect/incoming/assets";

    // // const Axios = axios.create({
    // //   baseURL: "https://fd-mc-staging.azurefd.net",
    // // });
    // // Axios.defaults.headers.common["Authorization"] = "bearer " + token;

    // try {
    //   // const response = await axios.post(url, _device, {
    //   //   headers: headers,
    //   // });

    //   // const resp = await fetch(url, {
    //   //   method: "POST",
    //   //   body: JSON.stringify(_device),
    //   //   mode: "no-cors",
    //   //   headers: headers,
    //   // });

    //   const resp = await fetch(url, {
    //     method: "POST",
    //     // mode: "no-cors",
    //     redirect: "follow",
    //     headers: headers,
    //     body: JSON.stringify(_device),
    //   });
    //   // const res = await resp.json();
    //   console.log(resp);
    // } catch (e) {
    //   console.error(e);
    // }

    // // return response;
    // // try {
    // //   resp = await fetch(
    // //     "https://fd-mc-staging.azurefd.net/gasdetectionconnect/incoming/assets",
    // //     {
    // //       method: "POST",
    // //       headers: new Headers(headers),
    // //       body: JSON.stringify(device),
    // //     }
    // //   );
    // //   console.log(resp);
    // // } catch (e) {
    // //   throw new Error("an error accured: " + e);
    // // }

    // // let result;
    // // try {
    // //   result = await resp.json();
    // //   console.log(result);
    // // } catch (e) {
    // //   throw new Error("an error accured: " + e);
    // // }
    // // return result;
  }
  async _clearStorage() {
    for (const key of STORAGE_KEYS) {
      await localforage.removeItem(key);
    }
    return true;
  }
  async _scheduleNext(nextTask: string) {
    let nextStr = await localforage.getItem("next");
    if (nextStr) {
      nextStr += "+" + nextTask;
    } else nextStr = "+" + nextTask;
    console.log("adding ", nextTask, " to the tasks => ", nextStr);
    await localforage.setItem("next", nextStr);
    return true;
  }
  async _getNext() {
    let nextStr = (await localforage.getItem("next")) as string;
    if (nextStr) {
      return nextStr.split("+").slice(-1)[0];
    }
    return null;
  }

  async _removeNext(nextTask: string) {
    let nextStr = (await localforage.getItem("next")) as string;
    const next = nextStr.split("+").slice(-1)[0];
    console.assert(next === nextTask);
    nextStr = nextStr
      .split("+")
      .slice(0, -1)
      .map((item) => (item === "" ? undefined : item))
      .join("+");
    // console.log("nextStr: ", nextStr);
    if (nextStr.length) {
      await localforage.setItem("next", nextStr);
    } else {
      await localforage.removeItem("next");
      // console.log("next: ", next);
    }
  }

  async _setCurrentAccount(
    tryFirstLoadFromCache: boolean,
    account: CurrentAccountType,
    setLocalStorage = true
  ) {
    if (tryFirstLoadFromCache) {
      const loaded_account = await this._loadCurrentAccount(true);
      if (loaded_account) return;
    }
    if (setLocalStorage) {
      await localforage.setItem("account_id", account["id"]);
      await localforage.setItem("account_name", account["name"]);
      await localforage.setItem("account_email", account["email"]);
    }

    this._current_account = account;
  }
  async _loadCurrentAccount(noError = false) {
    const account = {};
    account["id"] = await localforage.getItem("account_id");
    account["name"] = await localforage.getItem("account_name");
    account["email"] = await localforage.getItem("account_email");

    if (!account["id"] || !account["name"] || !account["email"]) {
      if (noError) {
        return null;
      }

      throw new Error("no account could be found!");
    }
    this._current_account = account as AccountType;
    return this._current_account;
  }
  getToken(account: CurrentAccountType = this.current_account) {
    for (const acc of this.accounts) {
      if (acc["email"] === account["email"]) {
        return acc["tokens"];
      }
    }
  }
}
