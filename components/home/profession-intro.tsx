type Props = React.HTMLAttributes<HTMLElement>;

export function ProfessionIntro(props: Props) {
  return (
    <section {...props}>
      <h2 className="font-display text-2xl font-bold uppercase leading-none tracking-widest sm:text-3xl sm:leading-none lg:text-4xl lg:leading-none">
        Frontend Engineer
      </h2>
      <p className="mt-2 space-x-1.5 text-sm italic tracking-wide sm:text-base lg:text-lg">
        <span className="text-muted-foreground">from</span>
        <span>Punjab, India</span>
      </p>
    </section>
  );
}