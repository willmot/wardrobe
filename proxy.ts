import { NextResponse, type NextRequest } from "next/server";

/** Local-only app: reject foreign Hosts and cross-origin writes. */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (!/^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/i.test(host)) {
    return NextResponse.json({ message: "Wardrobe is a local-only app." }, { status: 403 });
  }
  const origin = request.headers.get("origin");
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && origin && origin !== `http://${host}` && origin !== `https://${host}`) {
    return NextResponse.json({ message: "Cross-origin writes are disabled." }, { status: 403 });
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
