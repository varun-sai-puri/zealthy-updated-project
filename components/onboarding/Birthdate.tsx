// components/onboarding/Birthdate.tsx
import { UseFormReturn , FieldErrors} from "react-hook-form";
import type { FormValues } from "../../lib/type";

type Props = { form: UseFormReturn<FormValues> };

export default function Birthdate({ form }: Props) {
  const e : FieldErrors<FormValues> = form.formState.errors;

  return (
    <div className="grid">
      <label className="label" htmlFor="birthdate">Birthdate</label>
      <input
        id="birthdate"
        className="input"
        type="date"
        {...form.register("Birthdate.date", { required: "Birthdate is required" })}
      />
      {e?.Birthdate?.date && <p className="error">{e.Birthdate.date.message}</p>}
    </div>
  );
}
