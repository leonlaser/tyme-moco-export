interface Options {
  format: "date" | "time" | "timestamp";
  locale?: string;
}

export default function formatDateLocalized(
  dateString: string,
  options: Options,
) {
  const locale = options.locale ?? utils.localize("locale.identifier");
  const date = new Date(dateString);

  switch (options.format) {
    case "date":
      return date.toLocaleDateString(locale);
    case "time":
      return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "timestamp":
      return date.toLocaleString(locale);
  }
}
