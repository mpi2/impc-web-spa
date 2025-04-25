"use client";
import { useEffect, useState } from "react";
import { useScroll } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";

type Props = {
  scrollPercentage?: number;
};

const ScrollToTopButton = (props: Props) => {
  const { scrollPercentage = 200 } = props;
  const [showTopButton, setShowTopButton] = useState(false);
  const [{ perY }] = useScroll();

  useEffect(() => {
    const showButton = perY >= scrollPercentage;
    if (showButton && !showTopButton) {
      setShowTopButton(true);
    }
  }, [perY, scrollPercentage]);

  return (
    showTopButton && (
      <AnimatePresence>
        <motion.button
          className="btn impc-secondary-button back-to-top"
          onClick={() =>
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
          }
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FontAwesomeIcon icon={faAngleUp} />
          Back to top
        </motion.button>
      </AnimatePresence>
    )
  );
};

export default ScrollToTopButton;
