import { redirect } from "next/navigation";

/**
 * Root page that immediately redirects users to the dashboard.
 *
 * @returns {never} This function never returns as it triggers a redirect.
 */
export default function Home(): never {
  redirect("/dashboard");
}
