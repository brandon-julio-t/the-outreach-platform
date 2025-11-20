import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseXlsxToJson } from "@/lib/xlsx";
import { DownloadIcon, UploadIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import z from "zod";
import {
  importContactsForBroadcastRowSchema,
  ImportContactsForBroadcastRowSchema,
} from "../schemas";

export default function ImportContactsForBroadcastDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="container mx-auto flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Import Contacts for Broadcast</DrawerTitle>
          <DrawerDescription>
            Import contacts for broadcast from a file.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerContentInner />
      </DrawerContent>
    </Drawer>
  );
}

type ParsedType = z.ZodSafeParseResult<ImportContactsForBroadcastRowSchema> & {
  original: Record<string, string>;
};

function DrawerContentInner() {
  const [parsed, setParsed] = React.useState<ParsedType[]>([]);

  if (parsed.length <= 0) {
    return (
      <>
        <section className="flex flex-col gap-4 p-4">
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

                  const parsed = json.map((row) => {
                    const result =
                      importContactsForBroadcastRowSchema.safeParse(row);
                    return {
                      ...result,
                      original: row as Record<string, string>,
                    };
                  });

                  if (parsed.length <= 0) {
                    toast.error("No contacts found in the file", {
                      description:
                        "Please check the file and make sure it is a Excel file with a phone number column.",
                    });
                    return;
                  }

                  setParsed(parsed);

                  toast.success("Contacts imported successfully", {
                    description: `Imported ${parsed.length} contacts`,
                  });
                }}
              />
            </label>
          </Button>
        </section>

        <DrawerFooter>
          <Button variant="outline" asChild>
            <a href="/templates/import-contacts-for-broadcast.xlsx" download>
              <DownloadIcon />
              <span>Download Template</span>
            </a>
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </>
    );
  }

  return (
    <>
      <section className="overflow-auto p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parsed.map((row) => {
              const ok = row.success;

              return (
                <TableRow key={row.original.name}>
                  <TableCell>
                    {ok ? row.data.phone : row.original.phone}
                  </TableCell>
                  <TableCell>
                    {!ok && (
                      <div className="text-destructive whitespace-break-spaces">
                        {z.prettifyError(row.error)}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      <DrawerFooter>
        <Button>Confirm</Button>
        <Button variant="outline" onClick={() => setParsed([])}>
          Reset
        </Button>
      </DrawerFooter>
    </>
  );
}
