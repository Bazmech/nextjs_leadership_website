import CookiebotCookieListingBlock from "@/components/organisms/CookiebotCookieListingBlock/CookiebotCookieListingBlock";

export default function CookiebotCookieListing({ slice }) {
  return (
    <div data-slice-type={slice._type}>
      <CookiebotCookieListingBlock />
    </div>
  );
}
