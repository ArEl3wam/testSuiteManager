import validator from "validator";

export default function isSiemensEmail(email: string) {
  if (!validator.isEmail(email)) return false;
  return email.split("@")[1].toLowerCase() === "siemens.com";
}
