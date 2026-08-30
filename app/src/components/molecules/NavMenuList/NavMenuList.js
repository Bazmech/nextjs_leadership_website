import NavLink from "@/components/molecules/NavLink/NavLink";

function DropdownNavItem({ item, tone, onNavigate }) {
  const hasChildren = item.children?.length > 0;

  if (!hasChildren) {
    return (
      <li>
        <NavLink href={item.href || undefined} tone={tone} onClick={onNavigate}>
          {item.label}
        </NavLink>
      </li>
    );
  }

  return (
    <li className="group relative">
      <NavLink href={item.href || undefined} tone={tone} onClick={onNavigate}>
        {item.label}
      </NavLink>
      <ul className="invisible absolute left-0 top-full z-50 mt-1 grid min-w-44 gap-1 border border-border bg-surface p-3 opacity-0 shadow-sm transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {item.children.map((child) => (
          <li key={child.id}>
            <NavLink
              href={child.href || undefined}
              onClick={onNavigate}
            >
              {child.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </li>
  );
}

function InlineNavItem({ item, tone, onNavigate }) {
  return (
    <li className="grid gap-2">
      <NavLink href={item.href || undefined} tone={tone} onClick={onNavigate}>
        {item.label}
      </NavLink>
      {item.children?.length > 0 ? (
        <ul
          className={`grid gap-2 border-l pl-3 ${
            tone === "inverse" ? "border-white/30" : "border-border"
          }`}
        >
          {item.children.map((child) => (
            <li key={child.id}>
              <NavLink
                href={child.href || undefined}
                tone={tone}
                onClick={onNavigate}
              >
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function NavMenuList({
  items,
  className = "",
  variant = "dropdown",
  tone = "default",
  onNavigate,
}) {
  if (!items?.length) return null;

  const Item = variant === "inline" ? InlineNavItem : DropdownNavItem;

  return (
    <ul className={className.trim()}>
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          tone={tone}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}
