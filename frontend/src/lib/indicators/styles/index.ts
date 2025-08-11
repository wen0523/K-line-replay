import { MA }from "./MA";

export { MA }

export const indicatorStyles = {
    "MA":MA,
}

export type IndicatorStyle = keyof typeof indicatorStyles;




