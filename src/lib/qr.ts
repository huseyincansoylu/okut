import "server-only";
import QRCode from "qrcode";

/** QR code for a URL as an SVG string that scales to its container. */
export function qrSvg(url: string) {
  return QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
}
