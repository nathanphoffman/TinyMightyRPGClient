"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { nestApi } from "@/lib/api/nest-client";

interface DeleteCharacterButtonProps {
  id: string;
  name: string;
  token: string;
}

export function DeleteCharacterButton({ id, name, token }: DeleteCharacterButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Controlled so the dialog stays open on a failed delete — the default
  // Action closes it, which would hide the error with no sign anything broke.
  const [open, setOpen] = useState(false);

  const deleteCharacter = useMutation({
    mutationFn: () => nestApi.deleteCharacter(id, token),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["character", id] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      setOpen(false);
      router.push("/characters");
    },
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (deleteCharacter.isPending) return;
        deleteCharacter.reset();
        setOpen(next);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          Delete character
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
        <AlertDialogDescription>
          This permanently deletes the character, along with its powers and inventory. It can&apos;t
          be undone.
        </AlertDialogDescription>

        {deleteCharacter.isError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            Couldn&apos;t delete that character. Please try again.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={deleteCharacter.isPending}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={deleteCharacter.isPending}
              onClick={(event) => {
                // Radix closes the dialog on Action click by default; we want it
                // to stay put until the request actually succeeds.
                event.preventDefault();
                deleteCharacter.mutate();
              }}
            >
              {deleteCharacter.isPending ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
