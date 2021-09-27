/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css as emoCss } from "@emotion/react";

import { useState, useCallback, forwardRef, useEffect, useRef } from "react";
import { useTransition, animated, useSpring, config } from "@react-spring/web";
import { styled } from "@material-ui/styles";
import Button, { ButtonProps } from "@material-ui/core/Button";
import { Session, CurrentAccountType } from "../utils/Session";
import { Menu } from "../components/Menu";
import { AccountSelectionMenu } from "../components/AccountSelectionMenu";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/core/Alert";
import Stack from "@material-ui/core/Stack";
import localforage from "localforage";

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

export const CustomizedSnackbars: React.FC<{ results: ActionResult }> = ({
  results,
}) => {
  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success",
  });

  useEffect(() => {
    if (results) {
      setSnackState({
        open: true,
        severity: results["success"] ? "success" : "error",
      });
    }
  }, [results]);

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackState((curr) => ({ ...curr, open: false }));
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Snackbar
        open={snackState["open"]}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackState["severity"] as any}
          sx={{ width: "100%" }}
        >
          {results ? results["message"] : "undefined"}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

const ITEMS = {
  Authorization:
    "Redirects you to to the GDC login page, after login you will be redirected back here and the tokens will be acquired in in background",
  "Obtain Refresh Token From DB":
    "Obtians refresh token from Dräger server silently",
  "Update Token with refresh token":
    "To use this first obtain refresh token,after you did that you can refresh it form GDC server",
  "send Token to DB": "Sends obtianed Token to server ",
  "Add device to GDC": "Opens a menu where you can add a device to GDC",
  "Set Device's Location": "Sets the device's location for the given device",
};
const BaseBtn = styled(Button)<ButtonProps>({
  boxShadow: "none",
  fontFamily: " 'Montserrat', sans-serif",
  fontSize: "1.8em",
  fontWeight: 800,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  cursor: "pointer",
  lineHeight: "80px",
  willChange: "transoform, opacity",
  transform: "perspective(600px) rotateX(0deg)",
  transition: "all 200ms linear",
  justifyContent: "flex-start",
  width: "670px",

  "&:hover": {
    backgroundColor: "#272833",
    transform: "perspective(600px) rotateX(20deg)",
    transitions: "all 2s linear",
  },
  "&:active": {
    backgroundColor: "#272833",
  },
});
export const CustomBtn: React.FC<ButtonProps & { description: string }> = ({
  children,
  description,
  ...rest
}) => {
  const [hover, setHover] = useState(false);

  const spring = useSpring({
    opacity: hover ? 1 : 0,
    color: hover ? "#afbec9" : "#000000",
    delay: 200,
    config: config.gentle,
  });
  return (
    <div
      className='customBtn'
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "100vw",
        userSelect: "none",
      }}
    >
      <BaseBtn
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        {...rest}
      >
        {children}
      </BaseBtn>
      <animated.div
        style={{
          opacity: spring.opacity,
          color: spring.color,
          fontSize: "1rem",
          width: "400px",
        }}
      >
        {description}
      </animated.div>
    </div>
  );
};

const AnimBtn = animated(CustomBtn);

type ActionResult = { success: boolean; message: string } | null;

const useHandleForms = (session: React.MutableRefObject<Session>) => {
  const [result, setResult] = useState<ActionResult>(null);

  const handle_authorization = useCallback(
    async (account: { email: string; id: number; name: string }) => {
      try {
        await session.current.acquireAccessTokenInteractive(account);
      } catch (e) {
        console.warn(e);
        setResult({
          success: false,
          message: "An error accured during Obtaining the token",
        });
      }
    },
    [session]
  );

  useEffect(() => {
    (async () => {
      const requrested = await localforage.getItem(
        "acquired_token_interactive_requested"
      );
      if (requrested) {
        const res = await localforage.getItem("acquired_token_interactive_ok");
        if (res) {
          setResult({ success: true, message: "Successfully acquired tokens" });
        } else {
          setResult({
            success: false,
            message: "An error accured during obtaining the token",
          });
        }
        localforage.removeItem("acquired_token_interactive_requested");
        localforage.removeItem("acquired_token_interactive_ok");
      }
    })();
  }, []);

  const handle_obtain_refresh_token = useCallback(
    async (account: CurrentAccountType) => {
      try {
        const res = await session.current.obtainRefreshTokenFromDB(account);
        if (res) {
          setResult({
            success: true,
            message: "Successfully recieved refresh token from server",
          });
        }
      } catch (e) {
        console.warn(e);
        setResult({
          success: false,
          message: "failed to send the token to the server!",
        });
      }
    },
    [session]
  );

  const handle_obtain_tokne_with_refresh_token = useCallback(
    async (account: CurrentAccountType) => {
      try {
        const res = await session.current.obtainTokenWithRefreshToken(account);
        if (res) {
          setResult({
            success: true,
            message: "Successfully recieved refresh token from server",
          });
        }
      } catch (e) {
        console.warn(e);
        setResult({
          success: false,
          message: "failed to send the token to the server!",
        });
      }
    },
    [session]
  );
  const handle_to_server = useCallback(
    async (account: CurrentAccountType) => {
      try {
        const res = await session.current.sendRefreshTokenToDB(account, false);
        if (res) {
          setResult({
            success: true,
            message: "Successfully sent the updated tokens",
          });
        }
      } catch (e) {
        console.warn(e);
        setResult({
          success: false,
          message: "failed to send the token to the server!",
        });
      }
    },
    [session]
  );
  const handle_add_device = useCallback(
    async (device: { type: string; assetId: string; sensors: string[] }) => {
      console.log("handle ", device);
      const res = await session.current.addDeviceToGDC(device);
      console.log(res);
      // try {
      //   const res = await session.current.addDeviceToGDC(device);
      //   console.log(res);
      //   if (res) {
      //     setResult({
      //       success: true,
      //       message: "Successfully added the device to GDC",
      //     });
      //   }
      // } catch (e) {
      //   console.warn(e);
      //   setResult({
      //     success: false,
      //     message: "failed to add the device to GDC!",
      //   });
      // }
    },
    [session]
  );

  return {
    result,
    callbacks: [
      handle_authorization,
      handle_obtain_refresh_token,
      handle_obtain_tokne_with_refresh_token,
      handle_to_server,
      // handle_add_device,
    ],
  };
};

export const Home: React.FC<{ session: React.MutableRefObject<Session> }> = ({
  session,
}) => {
  const homeStyle = emoCss({
    backgroundColor: "transparent",
    ".menu": {
      display: "flex",
      alignItems: "center",
      height: "100vh",
      justifyContent: "start",
    },

    ".menu_list": {
      minWidth: "100px",
      padding: "0 20px",
      //   margin: "0 auto",
      height: Object.keys(ITEMS).length * 80 + "px",
    },
    ".items": {
      overflow: "hidden",
      marginLeft: "2rem",
      width: "100%",
      color: "white",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      willChange: "transform, opacity, height",
    },
  });

  const [items, _] = useState<string[]>(Object.keys(ITEMS));
  const transitions = useTransition(items, {
    from: {
      opacity: 0,
      height: 0,
      innerHeight: 0,
      transform: "perspective(600px) rotateX(0deg)",
      color: "#bac4cc",
    },
    enter: [{ opacity: 1, height: 90, innerHeight: 90 }],
    leave: [
      { color: "#c23369" },
      { innerHeight: 0 },
      { opacity: 0, height: 0 },
    ],
  });

  const { result, callbacks } = useHandleForms(session);
  const [openAddDevice, SetopenAddDevice] = useState(false);
  const [openAccountSelection, setOpenAccountSelection] = useState(false);
  const handle_form_ref = useRef<
    (account: CurrentAccountType) => Promise<void>
  >(callbacks[0] as any);
  // const [handle_form, setHandleForms] = useState<

  // >((() => {}) as any);

  return (
    <div className='homepage' css={homeStyle}>
      <div className='menu'>
        <div className='menu_list'>
          {transitions(
            ({ innerHeight, color, ...rest }, item_key, _, index) => (
              <animated.div className='items' style={rest}>
                <animated.div
                  style={{ overflow: "hidden", height: innerHeight }}
                >
                  <AnimBtn
                    style={{
                      color: color,
                    }}
                    className='btn'
                    size='large'
                    description={ITEMS[item_key]}
                    //@ts-ignore
                    onClick={() => {
                      // setHandleForms(callbacks[index] as any);
                      handle_form_ref.current = callbacks[index] as any;
                      setOpenAccountSelection(true);
                    }}
                  >
                    {item_key}
                  </AnimBtn>
                </animated.div>
              </animated.div>
            )
          )}
        </div>
      </div>
      <Menu
        open={openAddDevice}
        setOpen={SetopenAddDevice}
        handle_add_device={callbacks[4] as any}
      />
      <CustomizedSnackbars results={result} />
      <AccountSelectionMenu
        setOpen={setOpenAccountSelection}
        open={openAccountSelection}
        //@ts-ignore
        handle_form={handle_form_ref}
      />
    </div>
  );
};
