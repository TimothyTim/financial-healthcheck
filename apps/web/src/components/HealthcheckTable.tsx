import type { HealthcheckCategory } from "@financial-healthcheck/shared";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categoryLabels: Record<HealthcheckCategory, string> = {
  savings: "Savings",
  debt: "Debt",
  budget: "Budget",
  investments: "Investments",
};

type CategoryRow = {
  category: HealthcheckCategory;
  label: string;
  score: number;
};

const columnHelper = createColumnHelper<CategoryRow>();

const columns = [
  columnHelper.accessor("label", {
    header: "Category",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("score", {
    header: "Score",
    cell: (info) => {
      const score = info.getValue();
      const variant =
        score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive";
      return <Badge variant={variant}>{score}</Badge>;
    },
  }),
];

interface HealthcheckTableProps {
  categories: Record<HealthcheckCategory, number>;
  overallScore: number;
}

export function HealthcheckTable({
  categories,
  overallScore,
}: HealthcheckTableProps) {
  const data: CategoryRow[] = (
    Object.entries(categories) as [HealthcheckCategory, number][]
  ).map(([category, score]) => ({
    category,
    label: categoryLabels[category],
    score,
  }));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>
          Overall score: <Badge>{overallScore}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
