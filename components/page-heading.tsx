type Props = {
  text: string;
};

export default function PageHeading({ text }: Props) {
  return (
    <h1 className="-ml-1 font-display text-4xl font-normal tracking-wide sm:-ml-2 sm:text-6xl lg:text-8xl">
      {text}
    </h1>
  );
}
