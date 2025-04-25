import dynamic from "next/dynamic";

export default dynamic(() => import("./ScrollToTopButton"), {
  ssr: false,
});
