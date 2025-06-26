
import { useState, useEffect } from "react";

export const useSVGLoader = () => {
  const [svg, setSvg] = useState<string | null>(null);
  const [svgError, setSvgError] = useState<string | null>(null);

  useEffect(() => {
    setSvgError(null);
    setSvg(null);
    
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
            setSvgError("Could not load SVG anatomy diagram from /heatmap/body.svg or /heatmap/body_front.svg. " +
              "Make sure the file exists in the public/heatmap folder and your server is running.");
            setSvg(null);
          });
      });
  }, []);

  return { svg, svgError };
};
