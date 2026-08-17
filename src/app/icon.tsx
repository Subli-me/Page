import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/settings";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const settings = await getSiteSettings();
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {settings.favicon_emoji ?? "👕"}
      </div>
    ),
    { ...size }
  );
}
