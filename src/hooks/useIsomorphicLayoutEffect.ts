
import { useEffect, useLayoutEffect } from 'react';

// SSR-safe useLayoutEffect that falls back to useEffect on server
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
