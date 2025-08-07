import Link from "next/link";
import { headers } from "next/headers";
import { FaHome } from "react-icons/fa";
import { RaisedButton } from "@/app/widgets/widgets";

export default async function NotFound() {
  const headersList = await headers();
  const domain = headersList.get("host");
  //const data = await getSiteData(domain)
  return (
    <div className="flex h-screen">
      <div className="flex flex-col m-auto text-center space-y-10">
        <h2>Not Found</h2>
        <p>Could not find requested page</p>

        <Link href="/">GO TO HOMEPAGE</Link>
      </div>
    </div>
  );
}
