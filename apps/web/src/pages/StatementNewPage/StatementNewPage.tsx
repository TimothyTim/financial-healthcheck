import type {
  CreatePaymentInput,
  CreateStatementInput,
  UpdateStatementInput,
} from "@financial-healthcheck/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FullPageLoader } from "@/components/ui/spinner";
import { useUser } from "@/contexts/UserProvider";
import {
  CreateStatementError,
  UpdateStatementError,
  createStatement,
  fetchStatement,
  updateStatement,
} from "@/lib/api";
import { PaymentGroup } from "./components/PaymentGroup/PaymentGroup";
import {
  getDefaultStatementNewValues,
  getSampleStatementNewValues,
  getYearOptions,
  monthOptions,
  statementNewSchema,
  statementToFormValues,
  type StatementNewFormValues,
} from "./statement-new.schema";

function toPaymentInput(
  type: CreatePaymentInput["type"],
  items: StatementNewFormValues["income"],
): CreatePaymentInput[] {
  return items.map((item) => ({
    type,
    label: item.label.trim(),
    amount: { amount: Math.round(item.amount * 100) },
  }));
}

function toUpdateStatementInput(
  values: StatementNewFormValues,
): UpdateStatementInput {
  return {
    month: values.month,
    year: values.year,
    payments: [
      ...toPaymentInput("income", values.income),
      ...toPaymentInput("expense", values.essentialCosts),
      ...toPaymentInput("debtRepayment", values.debtCommitments),
    ],
  };
}

function toCreateStatementInput(
  userId: string,
  values: StatementNewFormValues,
): CreateStatementInput {
  return {
    userId,
    ...toUpdateStatementInput(values),
  };
}

export function StatementNewPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const statementId = searchParams.get("statementId");
  const isEditMode = Boolean(statementId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: existingStatement,
    isLoading: isLoadingStatement,
    isError: isStatementError,
    error: statementError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["statement", statementId],
    queryFn: () => fetchStatement(statementId!),
    enabled: isEditMode,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StatementNewFormValues>({
    resolver: zodResolver(statementNewSchema),
    defaultValues: getDefaultStatementNewValues(),
  });

  useEffect(() => {
    if (existingStatement) {
      reset(statementToFormValues(existingStatement));
    }
  }, [existingStatement, reset]);

  const createMutation = useMutation({
    mutationFn: createStatement,
    onSuccess: (statement) => {
      if (user) {
        void queryClient.invalidateQueries({
          queryKey: ["statements", user.id],
        });
      }

      navigate(`/statement/${statement.id}`);
    },
    onError: (error) => {
      if (error instanceof CreateStatementError) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError("Something went wrong. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: StatementNewFormValues) =>
      updateStatement(statementId!, toUpdateStatementInput(values)),
    onSuccess: (statement) => {
      if (user) {
        void queryClient.invalidateQueries({
          queryKey: ["statements", user.id],
        });
      }

      void queryClient.invalidateQueries({
        queryKey: ["statement", statementId],
      });

      navigate(`/statement/${statement.id}`);
    },
    onError: (error) => {
      if (error instanceof UpdateStatementError) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError("Something went wrong. Please try again.");
    },
  });

  const mutation = isEditMode ? updateMutation : createMutation;
  const isPending = mutation.isPending;

  if (!user) {
    return null;
  }

  if (isEditMode && isLoadingStatement) {
    return <FullPageLoader />;
  }

  if (isEditMode && (isStatementError || !existingStatement)) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-3xl px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {statementError instanceof Error
                  ? statementError.message
                  : "Unknown error"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Retrying…" : "Try again"}
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  function onSubmit(values: StatementNewFormValues) {
    if (!user) {
      return;
    }

    setSubmitError(null);

    if (isEditMode) {
      updateMutation.mutate(values);
      return;
    }

    createMutation.mutate(toCreateStatementInput(user.id, values));
  }

  function handleUseSampleData() {
    onSubmit(getSampleStatementNewValues());
  }

  const yearOptions = getYearOptions();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            {isEditMode
              ? "Edit financial statement"
              : "Add a new financial statement"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditMode
              ? "Update your monthly income, essential costs, and debt commitments."
              : "Record your monthly income, essential costs, and debt commitments."}
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <select
                id="month"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("month")}
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.month && (
                <p className="text-sm text-destructive">{errors.month.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <select
                id="year"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("year")}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>
          </section>

          <PaymentGroup
            title="Monthly income"
            name="income"
            control={control}
            register={register}
            errors={errors}
          />

          <PaymentGroup
            title="Monthly essential costs"
            name="essentialCosts"
            control={control}
            register={register}
            errors={errors}
          />

          <PaymentGroup
            title="Debt and financial commitments"
            name="debtCommitments"
            control={control}
            register={register}
            errors={errors}
          />

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditMode
                  ? "Saving…"
                  : "Submitting…"
                : isEditMode
                  ? "Save changes"
                  : "Submit statement"}
            </Button>
            {!isEditMode && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleUseSampleData}
              >
                Use sample data
              </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
