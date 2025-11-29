import { useEffect, useRef } from "react";

export function useOutsideClick(onOutsideClick) {
  const elementsRef = useRef([]);

  const register = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  const unregister = (el) => {
    elementsRef.current = elementsRef.current.filter((e) => e !== el);
  };

  useEffect(() => {
    const handleClick = (e) => {
      const clickedInside = elementsRef.current.some((el) =>
        el.contains(e.target)
      );
      if (!clickedInside) {
        onOutsideClick?.();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onOutsideClick]);

  return { register, unregister };
}
