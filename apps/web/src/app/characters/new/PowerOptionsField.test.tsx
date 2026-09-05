import type { CreateCharacterInput } from "@tmrpg/schemas";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { PowerOptionsField } from "./PowerOptionsField";
import { type CharacterFormValues, characterFormResolver, DEFAULT_FORM_VALUES } from "./types";

function Harness() {
  const { control, register } = useForm<CharacterFormValues, unknown, CreateCharacterInput>({
    resolver: characterFormResolver,
    defaultValues: DEFAULT_FORM_VALUES,
  });
  return <PowerOptionsField control={control} register={register} />;
}

// Picking "special power" adds category/dice dropdowns, so the type selects
// can't be found by position — they're the ones offering "attackBonus".
const typeSelects = () =>
  screen
    .getAllByRole("combobox")
    .filter((select) => select.querySelector('option[value="attackBonus"]'));

function typeSelect(slot: 0 | 1 | 2): HTMLSelectElement {
  const select = typeSelects()[slot];
  if (!select) throw new Error(`no power type dropdown for slot ${slot}`);
  return select as HTMLSelectElement;
}

const optionIn = (select: HTMLElement, name: RegExp) =>
  within(select).getByRole("option", { name }) as HTMLOptionElement;

describe("PowerOptionsField", () => {
  it("starts every slot unselected, with only +1 more power use greyed out", () => {
    render(<Harness />);

    expect(screen.getByText("Power 1")).toBeInTheDocument();
    expect(screen.getByText("Power 2")).toBeInTheDocument();
    expect(screen.getByText("Power 3")).toBeInTheDocument();

    for (const select of typeSelects()) {
      expect((select as HTMLSelectElement).value).toBe("");
      for (const option of within(select).getAllByRole("option")) {
        const el = option as HTMLOptionElement;
        // No caps hit yet; the extra-use pick has no special power to attach to.
        expect(el.disabled).toBe(el.value === "extraPowerUse");
      }
    }
  });

  it("greys out +2 attack bonus once two other slots have taken it", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.selectOptions(typeSelect(0), "attackBonus");
    expect(optionIn(typeSelect(2), /\+2 attack bonus/).disabled).toBe(false);

    await user.selectOptions(typeSelect(1), "attackBonus");
    const capped = optionIn(typeSelect(2), /\+2 attack bonus/);
    expect(capped.disabled).toBe(true);
    expect(capped.textContent).toContain("already maxed out");

    // The two slots holding the pick can still change their own minds.
    expect(optionIn(typeSelect(0), /\+2 attack bonus/).disabled).toBe(false);
  });

  it("greys out +2 defense once one other slot has taken it", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.selectOptions(typeSelect(0), "defenseBonus");

    expect(optionIn(typeSelect(1), /\+2 defense/).disabled).toBe(true);
    expect(optionIn(typeSelect(0), /\+2 defense/).disabled).toBe(false);
  });

  it("keeps +1 more power use disabled until another slot names a special power", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const extraUse = () => optionIn(typeSelect(1), /\+1 more power use/);

    expect(extraUse().disabled).toBe(true);
    expect(extraUse().textContent).toContain("add a special power first");

    // A special power slot exists now, but with no name it still can't be a
    // target — the hint switches to say what's actually missing.
    await user.selectOptions(typeSelect(0), "specialPower");
    expect(extraUse().disabled).toBe(true);
    expect(extraUse().textContent).toContain("name your special power first");

    await user.type(screen.getByPlaceholderText(/Power name/), "Fireball");
    expect(extraUse().disabled).toBe(false);
    expect(extraUse().textContent).not.toMatch(/special power first/);

    await user.selectOptions(typeSelect(1), "extraPowerUse");
    expect(await screen.findByRole("option", { name: "Fireball" })).toBeInTheDocument();
  });
});
