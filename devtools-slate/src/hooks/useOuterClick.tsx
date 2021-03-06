import { useEffect, useRef } from "react";

type Callback = (e: MouseEvent) => void;

export const useOuterClick = <T extends HTMLElement>(callback: Callback) => {
  const ref = useRef<T>(null);

  const onClickOutside = (e: MouseEvent) => {
    const targelElement = ref.current;
    if (!targelElement) return;

    if (!targelElement.contains(e.target as any)) {
      callback(e);
    } else {
      return;
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  });
  return ref;
};