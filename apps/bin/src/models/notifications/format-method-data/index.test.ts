import type { ServiceMethod } from "@/models/service/lib";
import { describe, it } from "node:test";
import { equal } from "node:assert";
import { formatServiceMethodData } from ".";

const formattedServiceData = `
Метод
Поле: Значение
Поле 2: Значение 2

Поле: Значение
Поле 2: Значение 2`.trim();

describe("formatServiceMethodData should", () => {
  it("return formatted data", () => {
    const testService: Pick<ServiceMethod, "title" | "name" | "fields"> = {
      fields: [
        { name: "field", title: "Поле" },
        { name: "field2", title: "Поле 2" },
      ],
      name: "service",
      title: "Метод",
    };

    const serviceData = [
      { id: "Значеине", field: "Значение", field2: "Значение 2" },
      { id: "Значеине2", field: "Значение", field2: "Значение 2" },
    ];

    const formattedData = formatServiceMethodData({
      method: testService,
      data: serviceData,
    });

    equal(formattedData, formattedServiceData);
  });
});
