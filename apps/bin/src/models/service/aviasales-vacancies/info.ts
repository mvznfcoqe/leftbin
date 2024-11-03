const info = {
  name: "aviasales-vacancies",
  baseUrl: "https://www.aviasales.ru/about/vacancies",
  active: true,
  methods: {
    getVacancies: "get-vacancies",
    fields: { name: "Название вакансии", url: "Ссылка" },
  },
};

export { info };
