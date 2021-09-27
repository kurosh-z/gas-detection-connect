/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Box, BoxProps } from "@mui/material";

import { animated } from "@react-spring/web";

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

export const ABox = animated(CustomBox);
