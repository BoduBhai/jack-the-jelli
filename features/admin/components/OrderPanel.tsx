interface OrderPanelProps {
  title: string;
  children: React.ReactNode;
}

/**
 * The bordered, rule-under-the-heading panel the order detail screen is built
 * from. Same idea as ProductFormSection, in the admin panel's own key: a plain
 * uppercase label rather than a serif heading, because these sit in a column
 * beside the order rather than leading a form.
 */
export default function OrderPanel({ title, children }: OrderPanelProps) {
  return (
    <section className="border-border space-y-6 border p-6">
      <div>
        <h2 className="text-foreground text-sm font-semibold tracking-widest uppercase">
          {title}
        </h2>
        <div className="bg-border mt-2 h-px w-16" />
      </div>
      {children}
    </section>
  );
}
