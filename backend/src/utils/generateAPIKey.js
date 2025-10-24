import bcrypt from "bcryptjs";
import crypto from "crypto";
export const generateAPIKey = async () => {
  const prefix = "notipi_live_";

  // generates a random string of 32 characters
  const randomString = crypto
    .getRandomValues(new Uint8Array(16))
    .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
  const rawKey = `${prefix}${randomString}`;
  const hashedKey = await bcrypt.hash(rawKey, 10);

  return { rawKey, hashedKey };
};
