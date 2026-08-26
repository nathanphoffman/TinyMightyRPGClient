"use client";

import { Trash2 } from "lucide-react";
import { type UseFormRegister, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";
import type { CharacterFormControl, CharacterFormValues } from "./types";

export function InventoryField({
  control,
  register,
}: {
  control: CharacterFormControl;
  register: UseFormRegister<CharacterFormValues>;
}) {
  const inventoryFields = useFieldArray({ control, name: "inventory" });

  return (
    <FormSection
      title="Starting items"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inventoryFields.append({ name: "", quantity: 1 })}
        >
          Add item
        </Button>
      }
    >
      <div className="flex flex-col gap-2">
        {inventoryFields.fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input
              placeholder="Item name"
              className="flex-1"
              {...register(`inventory.${index}.name`)}
            />
            <Input
              type="number"
              min={1}
              className="w-20"
              {...register(`inventory.${index}.quantity`, { valueAsNumber: true })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Remove item"
              onClick={() => inventoryFields.remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {inventoryFields.fields.length === 0 && (
          <p className="text-base text-muted-foreground">No starting items yet.</p>
        )}
      </div>
    </FormSection>
  );
}
