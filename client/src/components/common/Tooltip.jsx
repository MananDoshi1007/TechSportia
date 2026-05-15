import { useState, useRef } from "react";
import "./Tooltip.css";

export default function Tooltip({ children, text, position = "top", delay = 0 }) {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef();

  const showTip = () => {
    timeoutRef.current = setTimeout(() => {
      setActive(true);
    }, delay || 200);
  };

  const hideTip = () => {
    clearTimeout(timeoutRef.current);
    setActive(false);
  };

  if (!text) return children;

  return (
    <div className="tooltip-wrapper" onMouseEnter={showTip} onMouseLeave={hideTip}>
      {children}
      {active && (
        <div className={`tooltip-tip ${position}`}>
          {text}
        </div>
      )}
    </div>
  );
}
