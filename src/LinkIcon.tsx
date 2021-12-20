import { data } from "@i2analyze/notebook-sdk";
import { ReactNode } from "react";

import "./LinkIcon.css";

const WithIcon = () => (
  <svg version="1.1" x="0" y="0" viewBox="0 0 24 24">
    <path d="M1.5 10a3.5 3.5 0 105 5 3.5 3.5 0 00-5-5zm3.9 4a2 2 0 11-2.8-3 2 2 0 012.8 3z" />
    <rect x="6.8" y="12" width="15.4" height=".8" />
    <polygon points="23.5 12.4 19.2 16.7 18.5 16 22.1 12.4 18.5 8.9 19.2 8.2" />
  </svg>
);

const AgainstIcon = () => (
  <svg version="1.1" x="0" y="0" viewBox="0 0 24 24">
    <path d="M22.4 14.9a3.5 3.5 0 10-4.9-5 3.5 3.5 0 005 5zM18.6 11a2 2 0 112.7 2.8 2 2 0 01-2.7-2.8z" />
    <rect x="1.8" y="12" width="15.4" height=".8" />
    <polygon points=".5 12.4 4.7 8.2 5.5 8.9 1.9 12.4 5.5 16 4.7 16.7" />
  </svg>
);

const NoneIcon = () => (
  <svg version="1.1" x="0" y="0" viewBox="0 0 24 24">
    <rect x="2" y="11" width="20" height="2" />
  </svg>
);

const BothIcon = () => (
  <svg version="1.1" x="0" y="0" viewBox="0 0 24 24">
    <rect x="1.8" y="10.9" width="20" height="1" />
    <polygon points="1 11.4 5.3 7.2 6 7.9 2.4 11.4 6 15 5.3 15.7" />
    <polygon points="23 11.4 18.7 15.7 18 15 21.6 11.4 18 7.9 18.7 7.2" />
  </svg>
);

export const LinkIcon = ({ direction }: { direction: data.LinkDirection }) => {
  let Icon: ReactNode = null;

  switch (direction) {
    case "against":
      Icon = <AgainstIcon />;
      break;
    case "with":
      Icon = <WithIcon />;
      break;
    case "both":
      Icon = <BothIcon />;
      break;
    case "none":
      Icon = <NoneIcon />;
      break;
  }

  return <div className="icon-container">{Icon}</div>;
};
