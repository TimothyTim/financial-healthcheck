import type {
  Control,
  FieldArrayPath,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StatementNewFormValues } from "../../statement-new.schema";

interface PaymentGroupProps {
  title: string;
  name: FieldArrayPath<StatementNewFormValues>;
  control: Control<StatementNewFormValues>;
  register: UseFormRegister<StatementNewFormValues>;
  errors: FieldErrors<StatementNewFormValues>;
}

export function PaymentGroup({
  title,
  name,
  control,
  register,
  errors,
}: PaymentGroupProps) {
  const { fields, append, remove } = useFieldArray({ control, name });
  const groupErrors = errors[name];

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>

      <div className="mt-4 space-y-4">
        {fields.map((field, index) => {
          const itemErrors = Array.isArray(groupErrors)
            ? groupErrors[index]
            : undefined;

          return (
            <div
              key={field.id}
              className="grid gap-4 sm:grid-cols-[1fr_140px_auto] sm:items-end"
            >
              <div className="space-y-2">
                <Label htmlFor={`${name}.${index}.label`}>Label</Label>
                <Input
                  id={`${name}.${index}.label`}
                  placeholder="e.g. Salary"
                  {...register(`${name}.${index}.label`)}
                />
                {itemErrors?.label && (
                  <p className="text-sm text-destructive">
                    {itemErrors.label.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${name}.${index}.amount`}>Amount (£)</Label>
                <Input
                  id={`${name}.${index}.amount`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...register(`${name}.${index}.amount`)}
                />
                {itemErrors?.amount && (
                  <p className="text-sm text-destructive">
                    {itemErrors.amount.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                Remove
              </Button>
            </div>
          );
        })}
      </div>

      {typeof groupErrors?.message === "string" && (
        <p className="mt-3 text-sm text-destructive">{groupErrors.message}</p>
      )}

      <Button
        type="button"
        variant="secondary"
        className="mt-4"
        onClick={() => append({ label: "", amount: 0 })}
      >
        Add item
      </Button>
    </section>
  );
}
