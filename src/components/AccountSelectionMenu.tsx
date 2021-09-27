/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css as emoCss } from "@emotion/react";
import { useState, useCallback, Fragment, useEffect } from "react";
import { Typography, IconButton, Tooltip, Button } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { PeopleAlt } from "@material-ui/icons";
import localforage from "localforage";
import {
  useTransition,
  useSpring,
  useChain,
  useSpringRef,
  config,
  a,
} from "@react-spring/web";
import { ABox } from "./ABox";

import { ACCOUNTS, CurrentAccountType, Session } from "../utils/Session";

const ATypography = a(Typography);
export const AccountBtn: React.FC<
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > & {
    account_id: number;
    account_name: string;
    account_email: string;
    selected: CurrentAccountType | null;
    handle_click: (account: CurrentAccountType) => void;
  }
> = ({
  children,
  account_id,
  account_name,
  account_email,
  selected,
  onClick,
  handle_click,
  style,
  ...rest
}) => {
  const [hover, setHover] = useState(false);

  const acc_btn_css = emoCss({
    // backgroundColor: "#272833",
    width: 240,
    willChange: "opacity, backgroundColor",
    transition: "backgroundColor .5s ease-in-out",
    whiteSpace: "nowrap",
    cursor: "pointer",
    // border: "1mm solid #272833 ",
    borderRadius: 5,
    marginLeft: 10,

    ".btn_label": {
      color: "#d8e1e8",
      fontFamily: " 'Montserrat', sans-serif",
      fontSize: ".9rem",
      fontWeight: 800,
      textDecoration: "none",
      margin: "0 0 0 10px",
      width: 40,
      willChange: "color, transform",
      transition: "color, transform .1s linear",
      "&.selected": {
        color: "#fbe0a4",
        transform: "scale(1.06)",
      },
    },

    "&.hovered": {
      backgroundColor: "#272833",
      // backgroundColor: "red",
      // transform: "scale(1.2)",
    },
  });
  const classnames = selected
    ? selected["email"] === account_email
      ? "btn_label selected"
      : "btn_label"
    : "btn_label";
  return (
    <div
      style={style}
      {...rest}
      css={acc_btn_css}
      className={hover ? "hovered" : ""}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        navigator.clipboard.writeText(account_email);
        handle_click({
          email: account_email,
          id: account_id,
          name: account_name,
        });
      }}
    >
      <Tooltip title='select & copy email' placement='top'>
        <IconButton>
          <PeopleAlt sx={{ fill: "#5584f2", fontSize: "1.4rem" }} />
          <Typography className={classnames}>id: {account_id}</Typography>
          <Typography className={classnames}> {account_name}</Typography>
        </IconButton>
      </Tooltip>
    </div>
  );
};

const AAccountBtn = a(AccountBtn);

export const AccountSelectionMenu: React.FC<{
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  handle_form: React.MutableRefObject<
    (account: CurrentAccountType) => Promise<void>
  >;
}> = ({ setOpen, open, handle_form }) => {
  const theme = useTheme();
  const menuStyle = emoCss({
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(228, 229, 245,0.4)",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    ".menu_form": {
      position: "relative",
      boxShadow: theme.shadows[12],
      borderRadius: "5px",
      padding: "25px",
      paddingBottom: "100px",
      //   width: "500px",
      //   height: "600px",
      willChange: "width, height",
      backgroundColor: "#3a3b4a",
      display: "grid",
      gridTemplateRows: "40px 20px 70px repeat(auto-fit, minmax(30px, 1fr))",
    },
    ".title": {
      color: "#d8e1e8",
      fontFamily: " 'Montserrat', sans-serif",
      fontWeight: 800,
      fontSize: "1.5rem",
      textTransform: "uppercase",
    },
    ".description": {
      color: "#d8e1e8",
      // fontFamily: " 'Montserrat', sans-serif",
      fontWeight: 400,
      fontSize: "1rem",
      margin: "5px 10px 10px 10px",
    },
    ".link": {
      color: "#94aeeb",
      fontSize: ".9rem",
      textDecoration: "none",
    },
    ".label": {
      color: "#d8e1e8",
      fontFamily: " 'Montserrat', sans-serif",
      fontSize: ".9rem",
      fontWeight: 800,
      textDecoration: "none",
      margin: "0 0 0 10px",
      //   textTransform: "uppercase",
    },
    ".form_btns": {
      width: "500px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      bottom: "30px",
      position: "absolute",
    },
  });

  const [selected_account, setSelectedAccount] =
    useState<CurrentAccountType | null>(null);
  const setInitAcc = useCallback(async () => {
    const email = (await localforage.getItem("account_email")) as string;
    const name = (await localforage.getItem("account_name")) as string;
    const id = (await localforage.getItem("account_id")) as string;
    if (email && name && id) {
      setSelectedAccount({ email, name, id: parseInt(id) });
    }
  }, []);
  useEffect(() => {
    setInitAcc();
  }, [setInitAcc]);

  const handle_account_selection = useCallback(
    (account: CurrentAccountType) => {
      setSelectedAccount(account);
    },
    [setSelectedAccount]
  );
  const [visibility, setVisibility] = useState(open);
  const springApi = useSpringRef();
  const { width, height, opacity } = useSpring({
    ref: springApi,
    config: config.stiff,
    // config: { mass: 1, tension: 130, friction: 20 },
    from: { width: "100px", height: "100px", opacity: 0 },
    to: {
      width: open ? "500px" : "100px",
      height: open ? "600px" : "100px",
      opacity: open ? 1 : 0,
      //   background: open ? "#fafcff" : "blue",
    },
    onRest: () => {
      if (!open) setVisibility(() => false);
    },
    onStart: () => {
      if (open) setVisibility(() => true);
    },
  });
  const ac_len = ACCOUNTS.length;
  const transApi = useSpringRef();
  const transitions = useTransition(
    open
      ? Array.from(
          Array(ac_len + 3)
            .fill(1)
            .keys()
        )
      : [],
    {
      ref: transApi,
      trail: 20,
      config: config.default,
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    }
  );
  useChain(open ? ([springApi, transApi] as any) : [transApi, springApi], [
    0,
    open ? 0.1 : 0.6,
  ]);

  return (
    <a.div
      className='menu_wraaper'
      css={menuStyle}
      style={{ display: visibility ? "flex" : "none", opacity: opacity }}
    >
      <ABox
        component='form'
        className='menu_form'
        opacity={opacity}
        width={width}
        height={height}
      >
        {transitions((style, item, _, index) => (
          <Fragment>
            {index === 0 && (
              <ATypography gutterBottom className='title' style={style}>
                Account Selection
              </ATypography>
            )}

            {index === 1 && (
              <Fragment>
                <ATypography className='label' style={style}>
                  Description:
                </ATypography>
                <ATypography gutterBottom className='description' style={style}>
                  choose one of the accounts below and after redirect use the
                  same Account to log in:
                </ATypography>
              </Fragment>
            )}

            {index > 1 && index < ac_len + 2 && (
              <AAccountBtn
                style={style}
                account_id={ACCOUNTS[index - 2]["id"]}
                account_name={ACCOUNTS[index - 2]["name"]}
                account_email={ACCOUNTS[index - 2]["email"]}
                selected={selected_account}
                handle_click={handle_account_selection}
              />
            )}

            {index === ac_len + 2 && (
              <a.div className='form_btns' style={style}>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant='outlined'
                  disabled={selected_account ? false : true}
                  onClick={() => {
                    if (selected_account) {
                      setOpen(false);
                      handle_form.current(selected_account);
                    }
                  }}
                >
                  OK
                </Button>
              </a.div>
            )}
          </Fragment>
        ))}
      </ABox>
    </a.div>
  );
};
