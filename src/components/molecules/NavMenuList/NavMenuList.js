import NavLink from "@/components/molecules/NavLink/NavLink";

function DropdownNavItem({ item }) {
  const hasChildren = item.children?.length > 0;

  if (!hasChildren) {
    return (
      <li>
        <NavLink href={item.href || undefined}>{item.label}</NavLink>
      </li>
    );
  }

  return (
    <li className="group relative">
      <NavLink href={item.href || undefined}>{item.label}</NavLink>
      <ul className="invisible absolute left-0 top-full z-50 mt-1 grid min-w-44 gap-1 border border-border bg-surface p-3 opacity-0 shadow-sm transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {item.children.map((child) => (
          <li key={child.id}>
            <NavLink href={child.href || undefined}>{child.label}</NavLink>
          </li>
        ))}
      </ul>
    </li>
  );
}

function InlineNavItem({ item }) {
  return (
    <li className="grid gap-2">
      <NavLink href={item.href || undefined}>{item.label}</NavLink>
      {item.children?.length > 0 ? (
        <ul className="grid gap-2 border-l border-border pl-3">
          {item.children.map((child) => (
            <li key={child.id}>
              <NavLink href={child.href || undefined}>{child.label}</NavLink>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function NavMenuList({ items, className = "", variant = "dropdown" }) {
  if (!items?.length) return null;

  const Item = variant === "inline" ? InlineNavItem : DropdownNavItem;

  return (
    <ul className={className.trim()}>
      {items.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </ul>
  );
}
