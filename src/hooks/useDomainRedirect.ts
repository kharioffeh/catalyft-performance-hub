
import { useEffect } from 'react';

export const useDomainRedirect = () => {
  useEffect(() => {
    const must = 'catalyft.app';
    if (window.location.hostname !== must) {
      window.location.href = `https://${must}${window.location.pathname}${window.location.search}${window.location.hash}`;
    }
  }, []);
};
