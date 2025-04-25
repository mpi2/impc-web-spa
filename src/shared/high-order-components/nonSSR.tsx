import { PropsWithChildren } from "react";
import dynamic from "next/dynamic";

const NonSSR = (props: PropsWithChildren) => (
  <>{props.children}</>
);

export default dynamic(() => Promise.resolve(NonSSR), { ssr: false });