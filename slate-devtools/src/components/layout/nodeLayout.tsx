import { styled } from "../../styles/stitches.config";

export const NodeLayout = styled("div", {
  $reset: "",
  fontSize: "0.875rem",

  "& > div": {
    $reset: "",

    "&:first-child": {
      display: "flex",
      columnGap: "0.75rem",

      ".devtools_slate_gray": {
        color: "#6B7280",
      },
    },
  },
});
