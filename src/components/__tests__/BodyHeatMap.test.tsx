
import React from "react";
import { render } from "@testing-library/react";
import { BodyHeatMap } from "../BodyHeatMap";

describe("BodyHeatMap", () => {
  it("renders with no data", () => {
    const { container } = render(<BodyHeatMap athleteId="dummy" />);
    expect(container).toMatchSnapshot();
  });
});
