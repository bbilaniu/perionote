import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";

describe("NativeChoiceControl", () => {
  it("renders a checked native checkbox inside its full clickable label", () => {
    const markup = renderToStaticMarkup(
      createElement(
        NativeChoiceControl,
        {
          type: "checkbox",
          checked: true,
          onChange: () => undefined,
        },
        "Hand instrumentation",
      ),
    );

    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain("checked");
    expect(markup).toContain("Hand instrumentation");
  });

  it("renders grouped native radios for exclusive choices", () => {
    const markup = renderToStaticMarkup(
      createElement(
        NativeChoiceControl,
        {
          type: "radio",
          name: "note-output",
          checked: false,
          onChange: () => undefined,
        },
        "Hygiene",
      ),
    );

    expect(markup).toContain('type="radio"');
    expect(markup).toContain('name="note-output"');
    expect(markup).not.toContain("checked");
  });
});
