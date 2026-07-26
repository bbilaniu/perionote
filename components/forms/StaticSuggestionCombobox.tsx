"use client";

import { useMemo, useState } from "react";
import {
  EditableCombobox,
  type EditableComboboxSuggestion,
} from "@/components/forms/EditableCombobox";

export function StaticSuggestionCombobox({
  id,
  label,
  value,
  suggestions,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  suggestions: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [statusMessage, setStatusMessage] = useState("");
  const filteredSuggestions = useMemo(() => {
    const query = value.trim().normalize("NFKC").toLocaleLowerCase("en-CA");
    return suggestions
      .filter(
        (suggestion) =>
          !query ||
          suggestion
            .normalize("NFKC")
            .toLocaleLowerCase("en-CA")
            .includes(query),
      )
      .map(
        (suggestion, index): EditableComboboxSuggestion => ({
          id: `${id}-static-${index}`,
          label: suggestion,
        }),
      );
  }, [id, suggestions, value]);

  return (
    <EditableCombobox
      id={id}
      label={label}
      value={value}
      suggestions={filteredSuggestions}
      onValueChange={(nextValue) => {
        onChange(nextValue);
        setStatusMessage("");
      }}
      onSelectSuggestion={(suggestion) => {
        onChange(suggestion.label);
        setStatusMessage(`${suggestion.label} selected.`);
      }}
      statusMessage={statusMessage}
      emptyMessage="No matching suggestions. Enter a custom value if needed."
      placeholder={placeholder}
    />
  );
}
