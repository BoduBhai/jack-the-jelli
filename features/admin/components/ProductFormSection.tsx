interface ProductFormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ProductFormSection({
  title,
  description,
  children,
}: ProductFormSectionProps) {
  return (
    <section className="flex flex-col gap-8">
      <div className="border-border border-b pb-4">
        <h2 className="font-heading text-foreground text-2xl font-medium">
          {title}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      </div>
      {children}
    </section>
  );
}
