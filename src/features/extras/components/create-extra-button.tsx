"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ExtraFormDialog } from "@/features/extras/components/extra-form-dialog";

export function CreateExtraButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <PlusIcon />
        Nuevo extra
      </Button>
      {open && <ExtraFormDialog onClose={() => setOpen(false)} />}
    </>
  );
}
