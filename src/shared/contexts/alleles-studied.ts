import { createContext } from "react";

type AllelesStudiedContext = {
  allelesStudied: Array<string>;
  setAlleles: (newValue: Array<string>) => void;
  allelesStudiedLoading: boolean;
  setAllelesStudiedLoading: (newValue: boolean) => void;
  numAllelesAvailable: number;
  setNumAllelesAvailable: (newValue: number) => void;
};

export const AllelesStudiedContext = createContext<AllelesStudiedContext>({
  allelesStudied: [],
  setAlleles: () => {},
  allelesStudiedLoading: true,
  setAllelesStudiedLoading: () => {},
  numAllelesAvailable: -1,
  setNumAllelesAvailable: () => {},
});
