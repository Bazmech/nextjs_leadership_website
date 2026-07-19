import { requireSuperAdminAppUser } from "@/lib/users";

export default async function QuestionsLayout({ children }) {
  await requireSuperAdminAppUser();
  return children;
}
