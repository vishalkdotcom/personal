import {
  Atom as AtomIcon,
  DribbbleLogo,
  FigmaLogo,
  FileJs as FileJsIcon,
  FileTs as FileTsIcon,
  FileTsx as FileTsxIcon,
  GithubLogo,
  LinkedinLogo,
  StackOverflowLogo,
} from "@phosphor-icons/react/dist/ssr";

export default function Page() {
  return (
    <div className="relative h-full">
      <div className="absolute flex h-12 w-full flex-col justify-center pr-12">
        <div className="mr-6 flex items-baseline justify-end gap-x-6 text-lg text-muted-foreground">
          <span>About</span>
          <span>Work</span>
          <span>Contact</span>
        </div>
      </div>

      <div className="absolute right-0 top-12 flex w-12 flex-col items-center">
        <div className="flex flex-col gap-4 py-4 text-muted-foreground">
          <LinkedinLogo size={28} weight="light" />
          <GithubLogo size={28} weight="light" />
          <StackOverflowLogo size={28} weight="light" />
          <DribbbleLogo size={28} weight="light" />
        </div>
      </div>

      <div className="px-12 pt-28">
        <h1 className="relative font-display text-4xl font-normal tracking-wide">
          <span
            className="absolute left-[-4.6rem] top-[-2.10rem] block h-20 w-24 rotate-[18deg] bg-primary"
            aria-hidden="true"
          ></span>
          <span className="relative font-bold text-primary-foreground">V</span>
          <span className="relative">ishal Kumar</span>
        </h1>
      </div>

      <div className="mt-32 flex flex-col gap-y-2 px-12">
        <div className="flex items-center gap-x-2">
          <span className="inline-block">
            <FileTsxIcon size={20} weight="light" />
            {/* <AtomIcon size={20} weight="light" /> */}
          </span>
          <span className="text-lg">React.js</span>
        </div>
        <div className="flex items-center gap-x-2">
          <span className="inline-block">
            <FileJsIcon size={20} weight="light" />
          </span>
          <span className="text-lg">JavaScript</span>
        </div>
        <div className="flex items-center gap-x-2">
          <span className="inline-block">
            <FileTsIcon size={20} weight="light" />
          </span>
          <span className="text-lg">TypeScript</span>
        </div>
        <div className="flex items-center gap-x-2">
          <span className="inline-block">
            <FigmaLogo size={20} weight="light" />
          </span>
          <span className="text-lg">Figma</span>
        </div>
      </div>

      {/* <div className="absolute bottom-0 right-0 origin-top-right rotate-90"> */}
      {/* <div className="absolute bottom-12 right-4"> */}
      <div className="absolute inset-x-0 bottom-12 flex flex-col items-center">
        <h4 className="relative flex h-12 flex-row justify-center space-x-4 font-display text-xl font-bold uppercase leading-none tracking-wider">
          <span className="inline-flex items-center">Frontend</span>
          <span className="relative inline-flex items-center">
            <span
              // className="absolute inset-y-0 -left-2.5 -right-12 block bg-primary"
              className="absolute inset-y-0 -left-2.5 -right-4 block bg-primary"
              aria-hidden="true"
            ></span>
            <span className="relative text-primary-foreground">Engineer</span>
          </span>
        </h4>
        <p className="mt-1 space-x-1.5 px-4 text-right text-sm italic tracking-wide">
          <span className="text-muted-foreground">from</span>
          <span>Punjab, India</span>
        </p>
      </div>
    </div>
  );
}
