import { debounce } from "lodash";
import { useCallback, useEffect, useRef } from "react";

export function useLazyEffect(effect, deps = [], wait = 300) {
  const cleanUp = useRef();
  const effectRef = useRef();
  const updatedEffect = useCallback(effect, deps);
  effectRef.current = updatedEffect;
  const lazyEffect = useCallback(
    debounce(() => {
      cleanUp.current = effectRef.current?.();
    }, wait),
    [],
  );
  useEffect(lazyEffect, deps);
  useEffect(() => {
    return () => {
      cleanUp.current instanceof Function ? cleanUp.current() : undefined;
    };
  }, []);
}
