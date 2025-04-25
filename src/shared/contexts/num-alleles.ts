import { createContext } from "react";

type NumAllelesContext = {
  numOfAlleles: number | undefined;
  setNumOfAlleles: (newValue: number) => void;
};

export const NumAllelesContext = createContext<NumAllelesContext>({
  numOfAlleles: undefined,
  setNumOfAlleles: () => {},
});
