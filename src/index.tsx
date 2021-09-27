import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
// import reportWebVitals from "./reportWebVitals";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

import { BrowserRouter, Switch } from "react-router-dom";

const cache = createCache({
  key: "css",
  "+ prepend": true,
} as any);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter forceRefresh={true}>
      <Switch>
        <CacheProvider value={cache}>
          <App />
        </CacheProvider>
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
