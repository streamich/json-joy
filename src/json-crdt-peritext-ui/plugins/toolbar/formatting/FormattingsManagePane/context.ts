import * as React from "react";
import {FormattingManageState} from "./state";

export const context = React.createContext<FormattingManageState>(null!);
export const useFormatting = () => React.useContext(context);
