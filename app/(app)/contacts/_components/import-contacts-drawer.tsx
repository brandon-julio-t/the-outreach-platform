import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { parseXlsxToJson } from "@/lib/xlsx";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { useMutation } from "convex/react";
import { DownloadIcon, InfoIcon, KeyIcon, XIcon } from "lucide-react";
import React from "react";
import { parsePhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import z from "zod";

export function ImportContactsDrawer({
  children,
  open,
  setOpen,
}: {
  children?: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [localOpen, setLocalOpen] = useControllableState({
    defaultProp: open ?? false,
    prop: open,
    onChange: setOpen,
  });

  return (
    <Drawer open={localOpen} onOpenChange={setLocalOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="container mx-auto flex flex-col">
        <DrawerHeader className="">
          <DrawerTitle>Import Contacts</DrawerTitle>
          <DrawerDescription>Import contacts from a file.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody setOpen={setLocalOpen} />
      </DrawerContent>
    </Drawer>
  );
}

const rowSchema = z.object({
  name: z.string().nonempty(),
  phone: z.coerce
    .string()
    .nonempty()
    .transform((val, ctx) => {
      const result = parsePhoneNumber(val);
      if (!result) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid phone number",
        });
        return z.NEVER;
      }
      return result.format("E.164");
    }),
});

type RowSchema = z.infer<typeof rowSchema>;

function DrawerBody({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [parsed, setParsed] = React.useState<
    Array<
      z.ZodSafeParseResult<RowSchema> & { original: Record<string, string> }
    >
  >([]);

  const onReset = () => {
    setParsed([]);
  };

  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const createContactsBulk = useMutation(
    api.domains.contacts.mutations.createContactsBulk,
  );

  const onSubmit = async () => {
    setIsLoading(true);

    const contacts = parsed
      .map((row) => {
        if (!row.success) {
          return null;
        }
        return row.data;
      })
      .filter((c) => c !== null);

    await toast
      .promise(createContactsBulk({ contacts }), {
        loading: `Importing ${Number(parsed.length).toLocaleString()} contacts...`,
        success: `${Number(parsed.length).toLocaleString()} contacts imported successfully`,
        error: "Failed to import contacts",
      })
      .unwrap();

    setIsLoading(false);
    setOpen(false);
    setOpenConfirmation(false);
  };

  if (parsed.length <= 0) {
    return (
      <>
        <div className="p-4">
          <Input
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) {
                toast.error("No file selected", {
                  description: "Please select a file to import.",
                });
                return;
              }

              const json = await parseXlsxToJson({ file });

              e.target.value = "";

              const parsed = json.map((row) => {
                const result = rowSchema.safeParse(row);
                return { ...result, original: row as Record<string, string> };
              });

              if (parsed.length <= 0) {
                toast.error("No contacts found in the file", {
                  description: "Please check the file and try again.",
                });
                return;
              }

              console.log(parsed);

              setParsed(parsed);
            }}
          />
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button asChild>
            <a href="/templates/import-contacts.xlsx" download>
              <DownloadIcon /> Download Template
            </a>
          </Button>
        </DrawerFooter>
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-auto p-4">
        <Item variant="outline" className="mb-4">
          <ItemMedia variant="icon">
            <InfoIcon />
          </ItemMedia>
          <ItemContent>
            <ItemDescription className="line-clamp-none">
              The phone number will be used as unique contact identifier.
            </ItemDescription>
            <ItemDescription className="line-clamp-none">
              So if the phone number is already in the database, the contact
              will be updated.
            </ItemDescription>
            <ItemDescription className="line-clamp-none">
              And vice-versa, if the phone number is not in the database, the
              contact will be created.
            </ItemDescription>
          </ItemContent>
        </Item>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1 text-right">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>
                <KeyIcon className="mr-2 inline-block size-(--text-sm)" />
                <span>Phone</span>
              </TableHead>
              <TableHead>Error</TableHead>
              <TableHead className="w-1">&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parsed.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="text-right">{index + 1}.</TableCell>
                <TableCell>
                  {row.success ? row.data.name : row.original.name}
                </TableCell>
                <TableCell>
                  {row.success ? row.data.phone : row.original.phone}
                </TableCell>
                <TableCell>
                  {!row.success && (
                    <div className="text-destructive whitespace-break-spaces">
                      {z.prettifyError(row.error)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const filtered = [...parsed];
                      filtered.splice(index, 1);
                      setParsed(filtered);
                    }}
                  >
                    <XIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DrawerFooter>
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>

        <AlertDialog open={openConfirmation} onOpenChange={setOpenConfirmation}>
          <AlertDialogTrigger asChild>
            <Button>Submit</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Contacts</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit{" "}
                {Number(parsed.length).toLocaleString()} contacts? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <Button onClick={onSubmit} disabled={isLoading}>
                {isLoading && <Spinner />}
                Submit
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DrawerFooter>
    </>
  );
}
