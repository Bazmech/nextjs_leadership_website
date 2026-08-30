import CookiebotCookieListing from "@/components/molecules/CookiebotCookieListing/CookiebotCookieListing";
import { shouldLoadCookiebot } from "@/lib/cookiebot";
import Section from "@/components/organisms/Section/Section";

export default function CookiebotCookieListingBlock({
  id,
  className = "py-24",
}) {
  return (
    <Section id={id} className={className}>
      <div className="col-span-12 md:col-span-8">
        <CookiebotCookieListing enabled={shouldLoadCookiebot()} />
      </div>
    </Section>
  );
}
