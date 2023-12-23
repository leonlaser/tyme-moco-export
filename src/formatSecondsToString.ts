export default function formatDuration(
  value: number,
  unit: "m" | "s" = "s",
): string {
  switch (unit) {
    case "s":
      break;
    case "m":
      value *= 60;
      break;
    default:
      utils.log("Unit '" + unit + "' is not supported in formatDuration()");
      return value + "s";
  }

  const year = Math.floor(value / 31536000);
  const days = Math.floor((value % 31536000) / 86400);
  const hours = Math.floor(((value % 31536000) % 86400) / 3600);
  const minutes = Math.floor((((value % 31536000) % 86400) % 3600) / 60);
  const seconds = (((value % 31536000) % 86400) % 3600) % 60;

  const resultArray = [];

  if (year > 0) resultArray.push(year + "y");
  if (days > 0) resultArray.push(days + "d");
  if (hours > 0) resultArray.push(hours + "h");
  if (minutes > 0) resultArray.push(minutes + "m");
  if (seconds > 0) resultArray.push(seconds + "s");

  return resultArray.join(" ");
}
