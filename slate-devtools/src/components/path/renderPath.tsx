import React from "react";
import { Path } from "slate";
import { styled } from "../../styles/stitches.config";

export type RenderPathProps = {
  path: Path;
};

export const RenderPath = ({ path }: RenderPathProps) => {
  return (
    <StyledPath>
      {path.map((val, i) => {
        return <div key={`${val}_${i}`}>{`${val},`}</div>;
      })}
    </StyledPath>
  );
};

const StyledPath = styled("div", {
  $reset: "",
  $flex: "",
  columnGap: "0.25rem",
  color: "white",

  "&::before": {
    content: `"["`,
    $reset: "",
    fontSize: "0.875rem",
    lineHeight: "1.25rrm",
    color: "#93c5fd",
  },

  "&::after": {
    content: `"]"`,
    $reset: "",
    fontSize: "0.875rem",
    lineHeight: "1.25rrm",
    color: "#93c5fd",
  },
  "& > div": {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
});
