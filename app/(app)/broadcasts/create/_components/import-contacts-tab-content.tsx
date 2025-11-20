import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseXlsxToJson } from "@/lib/xlsx";
import { DownloadIcon, InfoIcon, UploadIcon, XIcon } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  CreateBroadcastFormSchema,
  importContactsForBroadcastRowSchema,
} from "../schemas";

export function ImportContactsTabContent({
  form,
}: {
  form: UseFormReturn<CreateBroadcastFormSchema>;
}) {
  const fieldArray = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  if (fieldArray.fields.length <= 0) {
    return (
      <FieldGroup>
        <Field>
          <Button type="button" asChild>
            <label>
              <UploadIcon />
              <span>Choose Excel File</span>
              <input
                type="file"
                accept=".xlsx"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    toast.error("No file selected", {
                      description: "Please select a file to import.",
                    });
                    return;
                  }

                  const json = await parseXlsxToJson({
                    file,
                  });

                  e.target.value = "";

                  const validRows = json
                    .map((row) =>
                      importContactsForBroadcastRowSchema.safeParse(row),
                    )
                    .filter((result) => result.success)
                    .map((d) => d.data);

                  if (validRows.length <= 0) {
                    toast.error("No valid contacts found in the file", {
                      description:
                        "Please check the file and make sure it is a Excel file with a valid phone number column.",
                    });
                    return;
                  }

                  fieldArray.append(validRows);

                  toast.success("Phone numbers imported successfully", {
                    description: `Imported ${validRows.length} phone numbers`,
                  });
                }}
              />
            </label>
          </Button>

          <Button variant="outline" asChild>
            <a href="/templates/import-contacts-for-broadcast.xlsx" download>
              <DownloadIcon />
              <span>Download Template</span>
            </a>
          </Button>
        </Field>
      </FieldGroup>
    );
  }

  return (
    <FieldGroup>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <InfoIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            {Number(fieldArray.fields.length).toLocaleString()} phone numbers
            will be tried for broadcast
          </ItemTitle>
          <ItemDescription className="line-clamp-none">
            Please make sure that these phone numbers are already in the
            database.
          </ItemDescription>
          <ItemDescription className="line-clamp-none">
            If the phone number is not in the database, it will be skipped.
          </ItemDescription>
        </ItemContent>
        <ItemActions className="mb-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.resetField("contacts");
            }}
          >
            Reset
          </Button>
        </ItemActions>
      </Item>

      <section className="max-h-96 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1 text-right">#</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-1">&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fieldArray.fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className="text-right">{index + 1}.</TableCell>
                <TableCell>{field.phone}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      fieldArray.remove(index);
                    }}
                  >
                    <XIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </FieldGroup>
  );
}
