import { useHistory } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Session } from "./Session";
import { UrlString } from "./UrlString";
import localforage from "localforage";

export const fetchTimeout = (
  url: string,
  ms: number,
  { signal, options }: { signal: AbortController["signal"]; options?: object }
) => {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...options });
  if (signal) signal.addEventListener("abort", () => controller.abort());
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
};

export const fetch_url = (uri: string) => {
  const controller = new AbortController();

  // document.querySelector("button.cancel").addEventListener("click", () => controller.abort());

  fetchTimeout(uri, 60000, { signal: controller.signal })
    .then((response) => response.json())
    .then((resp) => console.log(resp))
    .catch((error) => {
      if (error.name === "AbortError") {
        // fetch aborted either due to timeout or due to user clicking the cancel button
        console.warn("AbortError", error);
      } else {
        console.log("error", error);
      }
    });
};

export function base64urlencode(a: number[]) {
  let str = "";
  let bytes = new Uint8Array(a);
  let len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateRandomStr(length: number) {
  let str = "";
  let possibleChars = "abcdefghijklmnopqrstuvwxyz";
  possibleChars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  possibleChars += "0123456789";
  for (let i = 0; i < length; i++) {
    str += possibleChars.charAt(
      Math.floor(Math.random() * possibleChars.length)
    );
  }
  return str;
}

export function generateNonce() {
  return generateRandomStr(12);
}
export function generateState() {
  return generateRandomStr(6);
}

export async function generateHashFromStr(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedStr = base64urlencode(hashArray);

  return hashedStr;
}

export function generateCodeVerifier() {
  var array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join(
    ""
  );
}

export async function generatePKCE() {
  const code_verifier = generateCodeVerifier();
  const code_challange = await generateHashFromStr(code_verifier);

  return { code_verifier, code_challange };
}

export function navigateWindow(
  url: string,
  option: { history: boolean; timeOut: number } = {
    history: false,
    timeOut: 6000,
  }
): Promise<boolean> {
  if (option.history) {
    window.location.assign(url);
  } else {
    window.location.href = url;
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, option.timeOut);
  });
}

export function dispatchAuthEvent(data: { response: string }) {
  window.dispatchEvent(
    new CustomEvent("authorization-response", {
      detail: UrlString.getDeserializedHash(data["response"]),
    })
  );
}

export function decimalToHex(num: number): string {
  let hex: string = num.toString(16);
  while (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
}

function dispatchCodeEvent(data: { response: string }) {
  window.dispatchEvent(
    new CustomEvent("authorization-response", {
      detail: UrlString.getDeserializedHash(data["response"]),
    })
  );
}

export function useGDC(oauthConfig) {
  const session = useRef(
    new Session({
      clientId: oauthConfig["clientId"],
      baseUrl: oauthConfig["url"],
    })
  );
  const history = useHistory();

  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      if (window.location.href.search("code") === -1)
        window.sessionStorage.setItem("lHref", window.location.href);
    });

    window.addEventListener("load", async () => {
      if (UrlString.hashContainsKnownProperties(window.location.hash)) {
        dispatchCodeEvent({ response: window.location.href });
        window.sessionStorage.removeItem("lHref");
      }
      if (window.location.pathname === "/gas-detection-connect") {
        const token = await localforage.getItem("id_token");
        if (token) {
          session.current._loadFromCache();
        }
      }
    });

    window.addEventListener("authorization-response", async (ev) => {
      // const href = window.sessionStorage.getItem("lHref") as string;
      const code = ev["detail"]["code"] as string;
      localforage.setItem("code", code).then(async () => {
        try {
          await session.current._getRefreshTokenByCode();
        } catch (e) {
          console.error(
            "and error accured during handling code requrest: " + e
          );
        }
        history.replace("gas-detection-connect");
      });
    });
  }, [history]);

  return session;
}
