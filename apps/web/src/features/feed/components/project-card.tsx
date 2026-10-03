import { CssPreview, GamePreview, PortfolioPreview, SaasPreview } from "@/components/site-previews";
import { ArrowUpRightIcon } from "./icons";

export type Preview =
  | { kind: "game"; cells: string }
  | { kind: "portfolio" }
  | { kind: "css" }
  | { kind: "saas"; bars: number[] };

export type Project = {
  /** Describes the site in screenshot and link labels, e.g. "Browser game". */
  name: string;
  title: string;
  description: string;
  category: string;
  stack: string[];
  /** Avatar colours of collaborators, until posts carry real people. */
  collaborators: string[];
  likes: number;
  preview: Preview;
};

type Props = {
  project: Project;
  liked: boolean;
  onToggleLike: () => void;
};

export function ProjectCard({ project, liked, onToggleLike }: Props) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-card-border bg-white">
      <div className="relative h-[230px] overflow-hidden">
        {/* role="img" sits on the drawing only, so the link beside it stays reachable. */}
        <div role="img" aria-label={`Screenshot of ${project.name}`} className="h-full">
          <PreviewDrawing preview={project.preview} />
        </div>
        <span className="absolute top-3 left-3 rounded-xl bg-white px-2.5 py-[5px] text-xs font-bold text-navy">
          {project.category}
        </span>
        <a
          href="#visit"
          aria-label={`Visit ${project.name}`}
          className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-yellow"
        >
          <ArrowUpRightIcon className="stroke-navy" />
        </a>
      </div>

      <div className="flex grow flex-col gap-3 px-5 pt-[18px] pb-4">
        <div>
          <h3 className="text-[21px]/[26px] font-semibold">{project.title}</h3>
          <p className="mt-1 mb-0 text-[15px]/[22px] text-ink-muted">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((stack) => (
            <span key={stack} className="rounded-[7px] bg-chip px-[9px] py-1 text-xs font-semibold">
              {stack}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-card-divider pt-3">
          <div className="flex items-center gap-2">
            <span className="inline-block size-7 rounded-full bg-navy" />
            <span className="text-sm font-semibold">[Creator]</span>
            <span className="ml-0.5 flex">
              {project.collaborators.map((color, i) => (
                <span
                  key={i}
                  className="-ml-1.5 size-[22px] rounded-full border-2 border-white"
                  style={{ background: color }}
                />
              ))}
            </span>
          </div>
          <button
            type="button"
            aria-pressed={liked}
            aria-label={`Like ${project.title}`}
            onClick={onToggleLike}
            className="group flex h-9 items-center gap-1.5 rounded-[18px] bg-transparent px-2.5 text-sm font-semibold text-navy"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinejoin="round"
              aria-hidden="true"
              className="fill-none stroke-navy group-aria-pressed:fill-yellow"
            >
              <path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.5C20 15.3 12 20 12 20z" />
            </svg>
            <span>{project.likes + (liked ? 1 : 0)}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function PreviewDrawing({ preview }: { preview: Preview }) {
  switch (preview.kind) {
    case "game":
      return <GamePreview cells={preview.cells} />;
    case "portfolio":
      return <PortfolioPreview />;
    case "css":
      return <CssPreview />;
    case "saas":
      return <SaasPreview bars={preview.bars} />;
  }
}
