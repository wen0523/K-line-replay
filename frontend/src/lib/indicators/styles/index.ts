import { MA } from "./MA";
import { EMA } from "./EMA";
import { SMA } from "./SMA";
import { BBI } from "./BBI";
import { VOL } from "./VOL";
import { MACD } from "./MACD";
import { BOLL } from "./BOLL";
import { KDJ } from "./KDJ";
import { RSI } from "./RSI";
import { BIAS } from "./BIAS";
import { BRAR } from "./BRAR";
import { CCI } from "./CCI";
import { DMI } from "./DMI";
import { CR } from "./CR";
import { PSY } from "./PSY";
import { DMA } from "./DMA";
import { TRIX } from "./TRIX";
import { OBV } from "./OBV";
import { VR } from "./VR";
import { WR } from "./WR";
import { MTM } from "./MTM";
import { EMV } from "./EMV";
import { SAR } from "./SAR";
import { AO } from "./AO";
import { ROC } from "./ROC";
import { PVT } from "./PVT";
import { AVP } from "./AVP";

export { MA, EMA, SMA, BBI, VOL, MACD, BOLL, KDJ, RSI, BIAS, BRAR, CCI, DMI, CR, PSY, DMA, TRIX, OBV, VR, WR, MTM, EMV, SAR, AO, ROC, PVT, AVP }

export const indicatorStyles = {
    "MA": MA,
    "EMA": EMA,
    "SMA": SMA,
    "BBI": BBI,
    "VOL": VOL,
    "MACD": MACD,
    "BOLL": BOLL,
    "KDJ": KDJ,
    "RSI": RSI,
    "BIAS": BIAS,
    "BRAR": BRAR,
    "CCI": CCI,
    "DMI": DMI,
    "CR": CR,
    "PSY": PSY,
    "DMA": DMA,
    "TRIX": TRIX,
    "OBV": OBV,
    "VR": VR,
    "WR": WR,
    "MTM": MTM,
    "EMV": EMV,
    "SAR": SAR,
    "AO": AO,
    "ROC": ROC,
    "PVT": PVT,
    "AVP": AVP,
}

export type IndicatorStyle = keyof typeof indicatorStyles;




