import type { PriceItem } from "@/content/site";

export function PriceItemName({ name, keepNameVisible }: Pick<PriceItem, "name" | "keepNameVisible">) {
  return (
    <span className={keepNameVisible ? "shrink-0 whitespace-nowrap" : "min-w-0 truncate"} title={name}>
      {name}
    </span>
  );
}
