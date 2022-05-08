import styles from "./Footer.module.css";

import React, { FunctionComponent } from "react";
import Image from "next/image";

const MINIMUM_SCREEN_LENGTH = 639;

const Footer: FunctionComponent = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.logoWrapper}>
        <p className={styles.preLogo}>Powered by</p>
        <Image
          src="/images/attribution.svg"
          layout="fixed"
          width={window.innerWidth > MINIMUM_SCREEN_LENGTH ? "100px" : "80px"}
          height={window.innerWidth > MINIMUM_SCREEN_LENGTH ? "20px" : "15px"}
          objectFit="contain"
          alt="Attribution Logo"
        />
      </div>
      <p className={styles.attribution}>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </div>
  );
};

export default Footer;