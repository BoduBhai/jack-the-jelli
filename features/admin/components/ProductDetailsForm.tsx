import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/features/admin/lib/types";
import {
  fieldLabelClassName,
  PRODUCT_CATEGORIES,
  underlineInputClassName,
} from "@/features/admin/lib/product-form";

interface ProductDetailsFormProps {
  product: Product;
  onDirty: () => void;
}

export default function ProductDetailsForm({
  product,
  onDirty,
}: ProductDetailsFormProps) {
  return (
    <form
      className="flex flex-col gap-12 sm:gap-20 md:gap-32"
      onChange={onDirty}
      onSubmit={(e) => e.preventDefault()}
    >
      <section>
        <h3 className="border-border font-heading text-foreground mb-8 border-b pb-4 text-2xl font-medium">
          Basic Information
        </h3>
        <div className="flex flex-col gap-12">
          <Field>
            <FieldLabel htmlFor="product-name" className={fieldLabelClassName}>
              Product Name
            </FieldLabel>
            <Input
              id="product-name"
              defaultValue={product.name}
              className={`${underlineInputClassName} py-3 text-lg`}
            />
          </Field>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="sku" className={fieldLabelClassName}>
                SKU
              </FieldLabel>
              <Input
                id="sku"
                defaultValue={product.sku}
                className={underlineInputClassName}
                maxLength={16}
                placeholder="e.g. JTG-LEA-001"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="price" className={fieldLabelClassName}>
                Price (USD)
              </FieldLabel>
              <Input
                id="price"
                type="text"
                defaultValue={product.price.toFixed(2)}
                className={underlineInputClassName}
                pattern="^\$?\d+(\.\d{1,2})?$"
                placeholder="0.00"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="category" className={fieldLabelClassName}>
              Category
            </FieldLabel>
            <Select defaultValue={product.category} onValueChange={onDirty}>
              <SelectTrigger
                id="category"
                className="border-b-border h-12 justify-start rounded-none rounded-r-none border-t-0 border-r-0 border-b border-l-0"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>

      <section>
        <h3 className="border-border font-heading text-foreground mb-8 border-b pb-4 text-2xl font-medium">
          Product Description
        </h3>
        <Textarea
          placeholder="Describe the product story, materials, care instructions..."
          className="border-b-border min-h-50 resize-y rounded-none border-t-0 border-b border-l-0 text-base"
        />
      </section>
    </form>
  );
}
