export const tablesData = [
    {
        dayId: 1,
        platoons: [
            {
                platoonId: 4342,
                info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102] },
                    { id: 3, subject: "ТВВС", audiences: [] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: { topic: 6, subtopic: 1 }, type: "лекция", audience: 101},
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Кузнецов Виталий Владимирович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305,},
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101,}
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
            {
                platoonId: 4343, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 20, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 30, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 10, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
        ],
    },
    {
        dayId: 2,
        platoons: [
            {
                platoonId: 4344, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 200, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 300, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 100, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
            {
                platoonId: 4345, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2000, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3000, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1000, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
        ],
    },
    {
        dayId: 3,
        platoons: [
            {
                platoonId: 4346, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
            {
                platoonId: 4347, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
        ],
    },
    {
        dayId: 4,
        platoons: [
            {
                platoonId: 4348, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
            {
                platoonId: 4349, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
        ],
    },
    {
        dayId: 5,
        platoons: [
            {
                platoonId: 4350, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
            {
                platoonId: 4351, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
        ],
    },
    {
        dayId: 6,
        platoons: [
            {
                platoonId: 4352, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
            {
                platoonId: 4353, info: [
                    { id: 1, subject: "ОВП (ОУ)", audiences: [101, 102, 103] },
                    { id: 2, subject: "ОВП (ОП)", audiences: [101, 102, 103] },
                    { id: 3, subject: "ТВВС", audiences: [101, 102, 103] },
                    { id: 4, subject: "ОВП (ОC)", audiences: [101, 102, 103] },
                    { id: 5, subject: "ТЭиРЭО", audiences: [101, 102, 103] },
                    { id: 6, subject: "РЭО", audiences: [101, 102, 103] },
                ],
                columns: [
                    {
                        title: "1.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "8.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "15.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "22.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "29.09",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", type: "экзамен", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", type: "экзамен", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", type: "экзамен", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "05.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "12.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "19.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    },
                    {
                        title: "26.10",
                        cells: [
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 1, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" },
                            { id: 2, subject: "ОВП (ОП)", topic: 6, subtopic: 2, type: "семинар", audience: 202, teacher: "Петров Петр Петрович" },
                            { id: 3, subject: "ТВВС", topic: 6, subtopic: 3, type: "практика", audience: 305, teacher: "Сидоров Антон Алексеевич" },
                            { id: 1, subject: "ОВП (ОУ)", topic: 6, subtopic: 4, type: "лекция", audience: 101, teacher: "Иванов Иван Иванович" }
                        ]
                    }
                ],
            },
        ],
    },
];
