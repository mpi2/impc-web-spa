import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type EnabledFlags = {
  isNNumbersFootnoteAvailable: boolean;
  isPleiotropyChartAvailable: boolean;
};

type Flag = {
  name: string;
  propName: keyof EnabledFlags;
  queryParamName: string;
  valueToEnable: string;
};

const listOfFlags: Array<Flag> = [
  {
    name: "N-numbers footnote",
    propName: "isNNumbersFootnoteAvailable",
    queryParamName: "nnumbersfootnote",
    valueToEnable: "enabled",
  },
  {
    name: "Embryo landing pleiotropy chart",
    propName: "isPleiotropyChartAvailable",
    queryParamName: "embryopleiotropychart",
    valueToEnable: "",
  },
];

export const useQueryFlags = () => {
  const searchParams = useSearchParams();

  const [flags, setFlags] = useState<EnabledFlags>({
    isNNumbersFootnoteAvailable: false,
    isPleiotropyChartAvailable: false,
  });
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    for (const [key, value] of Object.entries(params)) {
      const flag = listOfFlags.find((flag) => flag.queryParamName === key);
      if (flag) {
        const shouldBeEnabled =
          flag.valueToEnable === "" || flag.valueToEnable === value;
        setFlags((prevFlags) => {
          return {
            ...prevFlags,
            [flag.propName]: shouldBeEnabled,
          };
        });
      }
    }
  }, [searchParams]);
  return flags;
};
