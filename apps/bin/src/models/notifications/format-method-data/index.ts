import type { ServiceMethod, ServiceMethodData } from "../../service/lib";

const formatServiceMethodData = ({
  method,
  data,
}: {
  method: Pick<ServiceMethod, "title" | "name" | "fields">;
  data: ServiceMethodData;
}) => {
  const formattedFields = data.map((fields) => {
    const fieldsWithTitles = Object.entries(fields)
      .map(([name, value]) => {
        const fieldName = method.fields.find((field) => {
          return field.name === name;
        });

        if (!fieldName) {
          return null;
        }

        return `${fieldName.title}: ${value}`;
      })
      .filter(Boolean);

    return fieldsWithTitles.join("\n");
  });

  return `
${method.title}
${formattedFields.join("\n\n")}
`.trim();
};

export { formatServiceMethodData };
