import type { ServiceMethod, ServiceMethodData } from "../../service/lib";

const methodDataDivider = "-------------------";

const formatServiceMethodData = ({
  method,
  data,
}: {
  method: Pick<ServiceMethod, "title" | "name" | "fields">;
  data: ServiceMethodData;
}) => {
  const formattedFieldsWithDividers = data
    .map((fields, i) => {
      const fieldsEntries = Object.entries(fields);

      let formattedFields = fieldsEntries
        .map(([name, value]) => {
          const fieldName = method.fields.find((field) => {
            return field.name === name;
          });

          if (!fieldName) {
            return;
          }

          return `${fieldName.title}: ${value}`;
        })
        .join("\n");

      if (i !== data.length - 1) {
        formattedFields += `\n${methodDataDivider}`;
      }

      return formattedFields;
    })
    .join("\n");

  return `
${method.title}
${methodDataDivider}
${formattedFieldsWithDividers}
`;
};

export { formatServiceMethodData, methodDataDivider };
