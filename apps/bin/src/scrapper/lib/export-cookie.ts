export type ExportCookie = {
  domain: string;
  expirationDate?: number;
  hostOnly: boolean;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: "unspecified" | "lax" | "no_restriction";
  secure: boolean;
  session: boolean;
  storeId: string;
  value: string;
  id: number;
};

export const mapExportCookieToPlaywright = (cookies: ExportCookie[]) => {
  return cookies.map((cookie) => {
    const sameSiteMap = {
      unsepcified: "None",
      lax: "Lax",
      no_restriction: "None",
    };

    return {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      expires: cookie.expirationDate,
      httpOnly: cookie.httpOnly,
      path: cookie.path,
      // @ts-ignore
      sameSite: sameSiteMap[cookie.sameSite] || "None",
      secure: cookie.secure,
    };
  });
};
