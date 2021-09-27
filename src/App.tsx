/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Fragment } from "react";
import { Route } from "react-router-dom";
import { oauthConfig } from "./authConfig";
import { useGDC } from "./utils/OauthUtils";

import { Home } from "./pages/Home";

const App: React.FC = () => {
  const session = useGDC(oauthConfig);

  return (
    <Fragment>
      <Route
        exact
        path='/gas-detection-connect'
        component={() => <Home session={session} />}
      />

      <Route
        path='/other'
        render={() => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              margin: 20,
            }}
          >
            THIS IS THE AUTH
          </div>
        )}
      />
    </Fragment>
  );
};

export default App;
