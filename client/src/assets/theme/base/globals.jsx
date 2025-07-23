import colors from "./colors";
// import bgAdmin from "/Users/dhruvrpansuriya/Documents/Dhruv Coding/Kriti 2025 Product Dev/Product_Dev_Kriti-25/client/src/assets/images/curved-images/";

const { info, dark } = colors;
export default {
  html: {
    scrollBehavior: "smooth",
    background: dark.body,
  },
  body: {
    // background: `url(${bgAdmin})`,
    backgroundSize: "cover",
  },
  "*, *::before, *::after": {
    margin: 0,
    padding: 0,
  },
  "a, a:link, a:visited": {
    textDecoration: "none !important",
  },
  "a.link, .link, a.link:link, .link:link, a.link:visited, .link:visited": {
    color: `${dark.main} !important`,
    transition: "color 150ms ease-in !important",
  },
  "a.link:hover, .link:hover, a.link:focus, .link:focus": {
    color: `${info.main} !important`,
  },
};
