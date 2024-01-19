type Props = React.HTMLAttributes<HTMLDivElement>;

export default function ProfessionIntro(props: Props) {
  return (
    <div {...props}>
      <h4 className="font-display text-xl font-bold uppercase leading-none tracking-widest sm:text-3xl sm:leading-none lg:text-5xl lg:leading-none">
        Frontend Engineer
      </h4>
      <p className="mt-0.5 space-x-1.5 text-sm italic tracking-wide sm:text-base lg:mt-1.5 lg:text-xl">
        <span className="text-muted-foreground">from</span>
        <span>Punjab, India</span>
      </p>
    </div>
  );
}
