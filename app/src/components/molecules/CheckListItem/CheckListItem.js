export default function CheckListItem({ children }) {
  return (
    <li className="flex items-center gap-3 text-foreground">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">
        ✓
      </span>
      {children}
    </li>
  );
}
