"use client";
import { useEffect, useState } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import styles from "./styles.module.scss";

const LoadingProgressBar = () => {
  const MAX_PERCENTAGE = 80;
  const MIN_PERCENTAGE = 45;
  const [percentage, setPercentage] = useState(MAX_PERCENTAGE);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPercentage(
        percentage === MAX_PERCENTAGE ? MIN_PERCENTAGE : MAX_PERCENTAGE,
      );
    }, 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [percentage]);

  return (
    <CircularProgressbarWithChildren
      className={styles.rotating}
      value={percentage}
      styles={{
        path: {
          stroke: "#ccc",
          transition: "stroke-dashoffset 2s ease 0s",
        },
        trail: {
          stroke: "#fff",
        },
      }}
      strokeWidth={12}
    />
  );
};

export default LoadingProgressBar;
