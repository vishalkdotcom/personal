import {
  IconType as ReactSimpleIcon,
  SiFigma,
  SiJavascript,
  SiNextdotjs,
  SiReact,
  SiTypescript,
} from "@icons-pack/react-simple-icons";

type Props = React.HTMLAttributes<HTMLElement>;

export function Expertise(props: Props) {
  return (
    <section {...props}>
      <div className="grid max-w-xl grid-cols-2 gap-3 xs:grid-cols-3 sm:gap-4 lg:max-w-2xl lg:gap-6">
        {skills.map(({ icon, text }, index) => (
          <Skill key={index} icon={icon} text={text} />
        ))}
      </div>
    </section>
  );
}

type SkillItem = {
  icon: ReactSimpleIcon;
  text: string;
};

const skills: SkillItem[] = [
  { icon: SiNextdotjs, text: "Next.js" },
  { icon: SiReact, text: "React.js" },
  { icon: SiTypescript, text: "TypeScript" },
  { icon: SiJavascript, text: "JavaScript" },
  { icon: SiFigma, text: "Figma" },
];

type SkillProps = SkillItem;

function Skill({ icon: Icon, text }: SkillProps) {
  return (
    <div className="flex items-center gap-x-2 sm:gap-x-3 lg:gap-x-4">
      <span className="inline-block">
        <Icon className="size-4 sm:size-6 lg:size-7" color="default" />
      </span>
      <span className="text-base tracking-wide sm:text-lg lg:text-xl">
        {text}
      </span>
    </div>
  );
}