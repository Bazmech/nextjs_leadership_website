import { requireStaffAppUser } from "@/lib/users";

export default async function UsersLayout({ children }) {
  await requireStaffAppUser();
  return children;
}
