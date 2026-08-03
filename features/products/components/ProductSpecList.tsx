import {
  RETURNS_COPY,
  SHIPPING_COPY,
} from "@/features/products/lib/product-copy";

interface ProductSpecListProps {
  sku: string;
  category: string;
}

/**
 * The hairline-ruled list DESIGN.md prescribes: label on the left, value on the
 * right, one rule per row. Carries both the product's own record and the terms
 * that apply to every piece, so nothing is hidden behind a disclosure.
 */
export default function ProductSpecList({
  sku,
  category,
}: ProductSpecListProps) {
  const rows = [
    { label: "Reference", value: sku },
    { label: "Collection", value: category },
    { label: "Shipping", value: SHIPPING_COPY },
    { label: "Returns", value: RETURNS_COPY },
  ];

  return (
    <dl className="border-outline-variant/20 mt-8 border-b">
      {rows.map((row) => (
        <div
          key={row.label}
          className="border-outline-variant/20 flex justify-between gap-8 border-t py-6"
        >
          <dt className="text-foreground shrink-0 text-[12px] font-semibold tracking-[0.1em] uppercase">
            {row.label}
          </dt>
          <dd className="text-on-surface-variant max-w-[60%] text-right text-[16px] leading-[1.6]">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
