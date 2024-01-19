type Props = React.HTMLAttributes<HTMLDivElement>;

export default function Intro(props: Props) {
  return (
    <div {...props}>
      <h1 className="-ml-1 font-display text-4xl font-normal tracking-wide sm:-ml-2 sm:text-6xl">
        Vishal Kumar
      </h1>
      <p className="mt-2 max-w-xl text-base leading-relaxed tracking-wide sm:mt-3 sm:text-lg sm:leading-8">
        <span>
          Expert frontend engineer specialized in building robust interactive
          web apps.{" "}
        </span>
        <span>
          Crafting beautiful, scalable, and high performing web experiences
          since 2012.
        </span>
      </p>
    </div>
  );
}
