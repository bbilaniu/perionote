"use client";

import { NativeChoiceControl } from "@/components/forms/NativeChoiceControl";
import { Cambra123SixAdultControl } from "@/components/templates/shared/Cambra123SixAdultControl";
import { Cambra123ZeroToSixControl } from "@/components/templates/shared/Cambra123ZeroToSixControl";
import type {
  ChildCambra123Instrument,
  ChildDocumentationStatus,
} from "@/lib/templates/childRecareHygiene";
import {
  hasCambra123SixAdultContent,
  hasCambra123ZeroToSixContent,
  type Cambra123SixAdultAssessment,
  type Cambra123ZeroToSixAssessment,
} from "@/lib/templates/cambra123";

const instrumentOptions: Array<{
  value: Exclude<ChildCambra123Instrument, "">;
  label: string;
}> = [
  { value: "0-6", label: "Ages 0–6" },
  { value: "6-adult", label: "Ages 6–adult" },
];

export function PediatricCambra123Control({
  instrument,
  zeroToSixAssessment,
  sixAdultAssessment,
  cariesStatus,
  onInstrumentChange,
  onZeroToSixChange,
  onSixAdultChange,
}: {
  instrument: ChildCambra123Instrument;
  zeroToSixAssessment: Cambra123ZeroToSixAssessment;
  sixAdultAssessment: Cambra123SixAdultAssessment;
  cariesStatus: ChildDocumentationStatus;
  onInstrumentChange: (instrument: ChildCambra123Instrument) => void;
  onZeroToSixChange: (assessment: Cambra123ZeroToSixAssessment) => void;
  onSixAdultChange: (assessment: Cambra123SixAdultAssessment) => void;
}) {
  const currentAssessmentHasContent =
    instrument === "0-6"
      ? hasCambra123ZeroToSixContent(zeroToSixAssessment)
      : instrument === "6-adult"
        ? hasCambra123SixAdultContent(sixAdultAssessment)
        : false;
  const evidentDecaySelected = zeroToSixAssessment.yesItemIds.includes(
    "disease.evident-decay-white-spots",
  );

  function selectInstrument(nextInstrument: ChildCambra123Instrument) {
    if (nextInstrument === instrument) return;
    if (
      currentAssessmentHasContent &&
      !window.confirm(
        "Change the CAMBRA123 instrument? Existing answers will be retained but excluded from this note while the other instrument is selected.",
      )
    ) {
      return;
    }
    onInstrumentChange(nextInstrument);
  }

  function useCariesFindingInZeroToSixAssessment() {
    onZeroToSixChange({
      ...zeroToSixAssessment,
      completionStatus: "complete",
      yesItemIds: [
        ...zeroToSixAssessment.yesItemIds,
        ...(!evidentDecaySelected
          ? (["disease.evident-decay-white-spots"] as const)
          : []),
      ],
    });
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-semibold">CAMBRA123 instrument</legend>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Select the published instrument used for this pediatric encounter.
          Age 6 overlaps both instruments and remains a clinician choice.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {instrumentOptions.map((option) => (
            <NativeChoiceControl
              key={option.value}
              type="radio"
              name="child-recare-cambra-instrument"
              checked={instrument === option.value}
              onChange={() => selectInstrument(option.value)}
            >
              {option.label}
            </NativeChoiceControl>
          ))}
        </div>
      </fieldset>

      {!instrument ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
          Select an age-band instrument to display its assessment factors.
        </div>
      ) : null}

      {instrument === "0-6" ? (
        <>
          {cariesStatus === "yes" && !evidentDecaySelected ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
              <p>
                Caries detected is documented as Yes, but the related CAMBRA
                disease indicator is not selected.
              </p>
              <button
                type="button"
                className="rounded-xl bg-sky-700 px-4 py-2 font-semibold text-white transition hover:bg-sky-800"
                onClick={useCariesFindingInZeroToSixAssessment}
              >
                Use caries finding in CAMBRA
              </button>
            </div>
          ) : null}
          {cariesStatus === "no" && evidentDecaySelected ? (
            <p
              className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
              role="alert"
            >
              Review conflicting documentation: Caries detected is No while
              “Evident tooth decay or white spot lesions” is Yes in CAMBRA.
            </p>
          ) : null}
          <Cambra123ZeroToSixControl
            value={zeroToSixAssessment}
            onChange={onZeroToSixChange}
          />
        </>
      ) : null}

      {instrument === "6-adult" ? (
        <Cambra123SixAdultControl
          value={sixAdultAssessment}
          legacy={{ level: "", factors: [], notes: "" }}
          onChange={onSixAdultChange}
        />
      ) : null}
    </div>
  );
}
