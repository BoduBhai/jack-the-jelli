"use client";

import { useState } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DISTRICTS_BY_DIVISION,
  DIVISIONS,
  getDivisionForDistrict,
} from "@/features/checkout/lib/delivery";
import {
  fieldLabelClassName,
  underlineInputClassName,
  underlineSelectClassName,
} from "@/features/checkout/lib/checkout-form";

/**
 * Division → District → Thana.
 *
 * Division is a UI affordance only: it narrows 64 districts down to a
 * readable list, and is never submitted as data — placeOrder derives the
 * stored division from the district, so the pair can't disagree however the
 * form is driven.
 *
 * Thana/upazila stays free text. A ~500-entry cascading dataset is bundle
 * weight the courier doesn't need, and the confirmation call catches typos.
 */
export default function DistrictFields({
  errors,
  values,
  district,
  onDistrictChange,
}: {
  errors: Record<string, string> | undefined;
  values: Record<string, string> | undefined;
  /** Lifted so the order summary can price delivery as soon as it's picked. */
  district: string;
  onDistrictChange: (district: string) => void;
}) {
  const [division, setDivision] = useState(
    () => getDivisionForDistrict(district) ?? "",
  );

  const districts = division
    ? DISTRICTS_BY_DIVISION[division as keyof typeof DISTRICTS_BY_DIVISION]
    : [];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Field>
        <FieldLabel htmlFor="division" className={fieldLabelClassName}>
          Division
        </FieldLabel>
        <Select
          value={division}
          onValueChange={(next) => {
            setDivision(next);
            // The old district almost certainly isn't in the new division.
            onDistrictChange("");
          }}
        >
          <SelectTrigger id="division" className={underlineSelectClassName}>
            <SelectValue placeholder="Select division" />
          </SelectTrigger>
          <SelectContent>
            {DIVISIONS.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field data-invalid={Boolean(errors?.district) || undefined}>
        <FieldLabel htmlFor="district" className={fieldLabelClassName}>
          District
        </FieldLabel>
        <Select
          name="district"
          value={district}
          onValueChange={onDistrictChange}
          disabled={!division}
        >
          <SelectTrigger
            id="district"
            aria-invalid={Boolean(errors?.district)}
            className={underlineSelectClassName}
          >
            <SelectValue
              placeholder={division ? "Select district" : "Division first"}
            />
          </SelectTrigger>
          <SelectContent>
            {districts.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors?.district}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors?.thana) || undefined}>
        <FieldLabel htmlFor="thana" className={fieldLabelClassName}>
          Thana / Upazila
        </FieldLabel>
        <Input
          id="thana"
          name="thana"
          autoComplete="address-level3"
          defaultValue={values?.thana}
          aria-invalid={Boolean(errors?.thana)}
          placeholder="e.g. Gulshan"
          className={underlineInputClassName}
        />
        <FieldError>{errors?.thana}</FieldError>
      </Field>
    </div>
  );
}
