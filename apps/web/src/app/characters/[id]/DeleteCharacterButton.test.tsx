import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteCharacterButton } from "./DeleteCharacterButton";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const deleteCharacter = vi.fn();
vi.mock("@/lib/api/nest-client", () => ({
  nestApi: { deleteCharacter: (...args: unknown[]) => deleteCharacter(...args) },
}));

function renderButton() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DeleteCharacterButton id="char-1" name="Grum" token="tok" />
    </QueryClientProvider>,
  );
}

describe("DeleteCharacterButton", () => {
  beforeEach(() => {
    push.mockClear();
    deleteCharacter.mockReset();
  });

  it("does not delete until the dialog is confirmed", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Delete character" }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(deleteCharacter).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(deleteCharacter).not.toHaveBeenCalled();
  });

  it("deletes and navigates back to the list on confirm", async () => {
    const user = userEvent.setup();
    deleteCharacter.mockResolvedValue(undefined);
    renderButton();

    await user.click(screen.getByRole("button", { name: "Delete character" }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteCharacter).toHaveBeenCalledWith("char-1", "tok"));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/characters"));
  });

  it("keeps the dialog open and shows an error when the request fails", async () => {
    const user = userEvent.setup();
    deleteCharacter.mockRejectedValue(new Error("nope"));
    renderButton();

    await user.click(screen.getByRole("button", { name: "Delete character" }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't delete that character.");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
