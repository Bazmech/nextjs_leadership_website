import AspectMedia from "@/components/atoms/AspectMedia/AspectMedia";
import Button from "@/components/atoms/Button/Button";
import Link from "@/components/atoms/Link/Link";
import LockIcon from "@/components/atoms/LockIcon/LockIcon";
import LocalDateTime from "@/components/atoms/LocalDateTime/LocalDateTime";
import Section from "@/components/organisms/Section/Section";
import { ARTICLES_PATH } from "@/lib/articles";

export default function ArticleHero({
  title,
  excerpt,
  publishedAt,
  image,
  locked = false,
  signInHref,
}) {
  return (
    <Section className="py-24">
      <div className="col-span-12 md:col-span-8 md:col-start-3">
        <Link
          href={ARTICLES_PATH}
          className="text-sm font-medium text-primary transition-colors hover:text-primary-light"
        >
          ← All articles
        </Link>
        {publishedAt ? (
          <p className="mt-6 text-sm font-medium text-muted">
            <LocalDateTime value={publishedAt} mode="date" />
          </p>
        ) : null}
        {title ? (
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
        ) : null}
        {excerpt ? (
          <p className="mt-6 text-lg leading-relaxed text-muted">{excerpt}</p>
        ) : null}
        {locked ? (
          <div className="mt-8 grid justify-items-start gap-4">
            <p className="flex items-center gap-2 text-sm font-medium text-muted">
              <LockIcon className="size-4" />
              This article is for signed-in members.
            </p>
            {signInHref ? (
              <Link href={signInHref}>
                <Button as="span" variant="accent-sm">
                  Sign in to read
                </Button>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
      {image ? (
        <div className="relative col-span-12">
          <AspectMedia image={image} imageAlt={title || ""} />
          {locked ? (
            <span className="absolute right-4 top-4 z-10 grid size-12 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm">
              <LockIcon className="size-6" title="Members only" />
            </span>
          ) : null}
        </div>
      ) : null}
    </Section>
  );
}
