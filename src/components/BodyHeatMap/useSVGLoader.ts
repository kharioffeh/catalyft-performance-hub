
import { useState, useEffect } from "react";

export const useSVGLoader = () => {
  const [svg, setSvg] = useState<string | null>(null);
  const [svgError, setSvgError] = useState<string | null>(null);

  useEffect(() => {
    setSvgError(null);
    setSvg(null);
    
    // First try the new detailed muscle map
    fetch("/assets/human-muscle-map.svg")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.text();
      })
      .then(setSvg)
      .catch(() => {
        // Fallback to original muscle files
        fetch("/assets/muscles.svg")
          .then(async (r) => {
            if (!r.ok) throw new Error(await r.text());
            return r.text();
          })
          .then(setSvg)
          .catch(() => {
            // Final fallback to original heatmap files
            fetch("/heatmap/body.svg")
              .then(async (r) => {
                if (!r.ok) throw new Error(await r.text());
                return r.text();
              })
              .then(setSvg)
              .catch(() => {
                fetch("/heatmap/body_front.svg")
                  .then(async (r) => {
                    if (!r.ok) throw new Error(await r.text());
                    return r.text();
                  })
                  .then(setSvg)
                  .catch((err) => {
                    setSvgError("Could not load detailed muscle SVG. Make sure the human-muscle-map.svg file exists in /assets/.");
                    setSvg(null);
                  });
              });
          });
      });
  }, []);

  return { svg, svgError };
};
