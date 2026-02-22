import * as React from 'react';

export type CustomComponents = Record<string, (props: object) => React.ReactNode>;

const context = React.createContext<CustomComponents>({});

export const CustomComponentsProvider = context.Provider;

export const useCustomComponents = () => React.useContext(context);
