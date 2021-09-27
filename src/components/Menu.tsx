/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, css as emoCss } from "@emotion/react";
import { useState, useCallback, useRef, Fragment } from "react";
import {
  Typography,
  TextField,
  Box,
  IconButton,
  Divider,
  Tooltip,
  Button,
  BoxProps,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AddCircleOutline, DeleteOutlineOutlined } from "@mui/icons-material";
import {
  useTransition,
  useSpring,
  useChain,
  useSpringRef,
  config,
  a,
} from "@react-spring/web";

type SetSensorListRef = React.MutableRefObject<
  React.Dispatch<React.SetStateAction<string[]>>
>;

const ListItem: React.FC<
  {
    setSensorList: SetSensorListRef;
    sensorName: string;
  } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
> = ({ setSensorList, sensorName, children, ...rest }) => {
  const ref = useRef<HTMLDivElement>(null);
  const handleDelBtn = useCallback(() => {
    setSensorList.current((curr) => {
      const val = ref.current?.innerText;

      const filtered = curr.filter(
        (item) => item.toUpperCase() !== val?.toUpperCase()
      );

      return filtered;
    });
  }, [setSensorList]);

  return (
    <div {...rest}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div ref={ref}>{sensorName}</div>
        <IconButton size='small' onClick={handleDelBtn}>
          <DeleteOutlineOutlined sx={{ fill: "#5584f2", fontSize: "1.4rem" }} />
        </IconButton>
      </div>
    </div>
  );
};
const AnimListItem = a(ListItem);
const SensorList: React.FC<
  {
    setSensorList: SetSensorListRef;
    sensorList: string[];
  } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
> = ({ children, sensorList, setSensorList, ...props }) => {
  const sensorStyle = emoCss({
    width: "200px",

    "& .MuiDivider-root": {
      borderColor: "#7da0ff",
      height: "60%",
    },
    ".sesnosrs__top": {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      height: "70px",
      width: "250px",
    },
    ".sensors_list": {
      listStyle: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    ".sensors_list__item": {
      minWidth: "90px",
      color: "wheat",
      textTransform: "uppercase",
      height: "30px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      //   borderLeft: ".1mm solid #7da0ff",
      //   pading: "10px",
    },
  });

  //   const [sensorList, setSensorList] = useState<string[]>([]);
  //   const refSetSensorList = useRef(setSensorList);
  const [textVal, setTextVal] = useState<string>("");

  const textFieldhandler = useCallback((val: string) => {
    setTextVal(val);
  }, []);
  const handleAddBtn = useCallback(() => {
    if (!textVal || textVal === "") return;
    if (sensorList.indexOf(textVal) !== -1) return;
    setSensorList.current((curr) => [...curr, textVal]);
  }, [textVal, sensorList, setSensorList]);

  const transitions = useTransition(sensorList, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <div className='sensors' css={sensorStyle} {...props}>
      <div className='sesnosrs__top'>
        <TextField
          required
          variant='outlined'
          label='sensor'
          value={textVal}
          onChange={(evt) => {
            textFieldhandler(evt.target.value);
          }}
        />
        <Divider orientation='vertical' />
        <Tooltip title='add sensor' placement='top-start'>
          <IconButton size='small' onClick={handleAddBtn}>
            <AddCircleOutline sx={{ fill: "#5584f2", fontSize: "1.8rem" }} />
          </IconButton>
        </Tooltip>
      </div>
      <div className='sensors__bottom'>
        <a.ul className='sensors_list'>
          <a.li className='sensors_list__item'>
            {transitions((style, item) => (
              <AnimListItem
                key={item}
                sensorName={item}
                style={style}
                setSensorList={setSensorList}
              />
            ))}
          </a.li>
        </a.ul>
      </div>
    </div>
  );
};

export const CustomBox: React.FC<
  BoxProps & { opacity: number; width: string; height: string }
> = ({ opacity, width, height, children, ...rest }) => {
  return (
    <Box
      component='form'
      className='menu_form'
      sx={{
        opacity: opacity,
        width: width,
        height: height,
      }}
      noValidate
      autoComplete={"off"}
      {...rest}
    >
      {children}
    </Box>
  );
};

const ABox = a(CustomBox);

const ASensorList = a(SensorList);
const ATypography = a(Typography);
const ATextField = a(TextField);

export const Menu: React.FC<{
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  handle_add_device: (device: {
    type: string;
    assetId: string;
    sensors: string[];
  }) => Promise<void>;
}> = ({ setOpen, open, handle_add_device }) => {
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
      //   width: "500px",
      //   height: "600px",
      willChange: "width, height",
      backgroundColor: "#3a3b4a",
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

    //textfield css:

    "& .MuiTextField-root": {
      m: 4,
      width: "15ch",
      margin: "10px",
    },
    ".MuiInputLabel-root": {
      color: "#c7ccd6",
    },
    "& label.Mui-focused": {
      color: "#e4eaf5",
    },
    //   "& .MuiInput-underline:after": {
    //     borderBottomColor: "green",
    //   },
    "& .MuiOutlinedInput-root": {
      color: "#e6ebf7",
      "& fieldset": {
        borderColor: "#b9bec7",
      },
      "&:hover fieldset": {
        borderColor: "#dde1eb",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#7da0ff",
      },
    },
    //textfield ends
    ".form_btns": {
      width: "500px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      bottom: "30px",
      position: "absolute",
    },
  });

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
  const transApi = useSpringRef();
  const transitions = useTransition(
    open ? Array.from(Array(6).fill(1).keys()) : [],
    {
      ref: transApi,
      trail: 20,
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    }
  );
  useChain(open ? ([springApi, transApi] as any) : [transApi, springApi], [
    0,
    open ? 0.1 : 0.6,
  ]);

  const [sensorList, setSensorList] = useState<string[]>([]);
  const refSetSensorList = useRef(setSensorList);

  const [textFields, setTextFields] = useState<{
    type: string;
    assetId: string;
  }>({ type: "", assetId: "" });

  const handleTextFields = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (evt.target.name === "Type") {
        setTextFields((curr) => ({ ...curr, type: evt.target.value }));
      }

      if (evt.target.name === "assetId") {
        setTextFields((curr) => ({ ...curr, assetId: evt.target.value }));
      }
    },
    [setTextFields]
  );

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
                ADD Device
              </ATypography>
            )}

            {index === 1 && (
              <Fragment>
                <ATypography className='label' style={style}>
                  Description:
                </ATypography>
                <ATypography gutterBottom className='description' style={style}>
                  Fill out the required fileds to add your device to the GDC
                  server. For more information please visit:
                  <a.br />
                  <a.a
                    className='link'
                    target='_blank'
                    rel='noopener noreferrer'
                    href='https://apim-mc-dev.portal.azure-api.net/docs/services/GasDetectionConnect-incoming/operations/post-assets?'
                  >
                    {"  "}
                    GDC's Documentation
                  </a.a>
                </ATypography>{" "}
              </Fragment>
            )}

            {index === 2 && (
              <Fragment>
                <ATypography className='label' style={style}>
                  Type of the device : e.g. PAC
                </ATypography>
                <ATextField
                  required
                  variant='outlined'
                  id='outlined-required'
                  label='Type'
                  name='Type'
                  style={style}
                  value={textFields["type"]}
                  onChange={handleTextFields}
                />
              </Fragment>
            )}
            {index === 3 && (
              <Fragment>
                <ATypography className='label' style={style}>
                  Asset ID : e.g. id-123-4
                </ATypography>
                <ATextField
                  required
                  variant='outlined'
                  id='outlined-required'
                  label='assetId'
                  name='assetId'
                  style={style}
                  value={textFields["assetId"]}
                  onChange={handleTextFields}
                />
              </Fragment>
            )}
            {index === 4 && (
              <Fragment>
                <ATypography className='label' style={style}>
                  Sensors : e.g. SO2
                </ATypography>
                <ASensorList
                  style={style}
                  setSensorList={refSetSensorList}
                  sensorList={sensorList}
                />
              </Fragment>
            )}
            {index === 5 && (
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
                  onClick={() => {
                    handle_add_device({
                      type: textFields["type"],
                      assetId: textFields["assetId"],
                      sensors: sensorList,
                    });
                  }}
                >
                  add device
                </Button>
              </a.div>
            )}
          </Fragment>
        ))}
      </ABox>
    </a.div>
  );
};
