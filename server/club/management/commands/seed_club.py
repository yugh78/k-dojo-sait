"""Idempotent, non-overwriting seed containing only facts supplied in the brief."""

from datetime import time
from django.core.management.base import BaseCommand
from django.db import transaction
from club import models as m


class Command(BaseCommand):
    help = "Populate supplied club facts without overwriting admin edits"

    @transaction.atomic
    def handle(self, *args, **options):
        programs = {}
        for slug, name, audience, low, high, accent, description, steps in [
            (
                "kyokushin",
                "Каратэ Киокусинкай",
                "Дети, подростки и взрослые",
                None,
                None,
                "red",
                "Основное историческое и соревновательное направление K-Dojo. Можно начать без опыта. Соревнования доступны желающим и подготовленным спортсменам.",
                "Разминка и движение\nТехника\nЛапы и снаряды\nРабота в парах\nСпарринги\nОФП / СФП",
            ),
            (
                "bjj",
                "BJJ и грэпплинг",
                "Дети от 7 лет",
                7,
                None,
                "gold",
                "Бразильское джиу-джитсу и грэпплинг. Работа с партнёром, освоение позиций и техники борьбы. Занятия направлены на физическое развитие и координацию.",
                "Разминка\nДвижения и базовая моторика\nИзучение позиции / техники\nРабота с партнёром\nСитуационная борьба\nОбщая физическая подготовка",
            ),
            (
                "mowgli",
                "Маугли",
                "Дети 3–7 лет",
                3,
                7,
                "green",
                "Самостоятельная спортивно-оздоровительная система для детей 3–7 лет. Это не карате: двигательные задания помогают развивать координацию, ловкость, гибкость и равновесие.",
                "Двигательные задания\nКоординационные упражнения\nОбщая физическая подготовка\nИгровые элементы\nРабота с собственным телом",
            ),
        ]:
            programs[slug], _ = m.Program.objects.get_or_create(
                slug=slug,
                defaults=dict(
                    name=name,
                    audience=audience,
                    minimum_age=low,
                    maximum_age=high,
                    accent=accent,
                    short_description=description,
                    description=description,
                    training_steps=steps,
                    first_training="На первую тренировку можно прийти без опыта. Не нужно заранее покупать полную экипировку. Уточните одежду у тренера.",
                ),
            )
        coaches = {}
        for slug, name, disciplines, desc in [
            (
                "korchashkin",
                "Сергей Сергеевич Корчашкин",
                ["kyokushin", "bjj"],
                "Тренер по Киокусинкай, BJJ и грэпплингу.",
            ),
            ("krylov", "Игорь Павлович Крылов", ["kyokushin"], "Тренер по Киокусинкай."),
            (
                "ryazhsky",
                "Ряжский Илья Юрьевич",
                ["mowgli"],
                "Прошёл обучение по системе «Маугли», имеет соответствующий сертификат.",
            ),
        ]:
            coach, created = m.Coach.objects.get_or_create(
                slug=slug, defaults={"full_name": name, "short_description": desc}
            )
            if created:
                coach.programs.set([programs[p] for p in disciplines])
            coaches[slug] = coach
        location, created = m.Location.objects.get_or_create(
            slug="koroleva-1a",
            defaults={
                "name": "Зал BJJ",
                "address": "г. Королёв, проспект Королёва, 1А",
                "phone": "+7 (925) 017-32-16",
                "route_url": "https://yandex.ru/maps/?text=Королёв%20проспект%20Королёва%201А",
            },
        )
        if created:
            location.programs.add(programs["bjj"])
        groups = [
            (
                "kyokushin",
                "Дети 9+ / Корчашкин",
                9,
                17,
                "Дети 9+",
                [0, 2, 4],
                "17:00",
                "18:30",
                ["korchashkin"],
            ),
            (
                "kyokushin",
                "Дети до 9 / Корчашкин",
                None,
                8,
                "Дети до 9 лет",
                [0, 2, 4],
                "18:45",
                "20:00",
                ["korchashkin"],
            ),
            (
                "kyokushin",
                "Дети до 9 / Крылов",
                None,
                8,
                "Дети до 9 лет",
                [0, 2, 4],
                "16:30",
                "17:45",
                ["krylov"],
            ),
            ("kyokushin", "Дети 9+ / Крылов", 9, 17, "Дети 9+", [0, 2, 4], "18:45", "20:15", ["krylov"]),
            ("kyokushin", "Взрослые", 18, None, "Взрослые", [0, 2, 4], "20:30", "22:00", ["krylov"]),
            (
                "kyokushin",
                "Детская совместная",
                None,
                17,
                "Дети",
                [1, 3],
                "16:30",
                "18:00",
                ["korchashkin", "krylov"],
            ),
            (
                "kyokushin",
                "Совместная тренировка",
                None,
                None,
                "Совместная тренировка",
                [5],
                "13:00",
                "14:30",
                [],
            ),
            ("bjj", "BJJ / дети от 7 лет", 7, 17, "Дети от 7 лет", [1, 3], "18:00", "19:30", ["korchashkin"]),
            ("bjj", "BJJ / дети от 7 лет", 7, 17, "Дети от 7 лет", [5], "11:00", "12:30", ["korchashkin"]),
            ("mowgli", "Маугли / 3–7 лет", 3, 7, "Дети 3–7 лет", [1, 3, 5], "18:00", "18:45", ["ryazhsky"]),
        ]
        for slug, name, low, high, audience, days, start, end, teachers in groups:
            group, _ = m.TrainingGroup.objects.get_or_create(
                name=name,
                program=programs[slug],
                defaults={"minimum_age": low, "maximum_age": high, "audience": audience},
            )
            for day in days:
                entry, created = m.ScheduleEntry.objects.get_or_create(
                    training_group=group,
                    weekday=day,
                    start_time=time.fromisoformat(start),
                    defaults={
                        "end_time": time.fromisoformat(end),
                        "program": programs[slug],
                        "location": location if slug == "bjj" else None,
                        "minimum_age": low,
                        "maximum_age": high,
                        "audience": audience,
                        "notes": "" if slug == "bjj" else "Адрес уточняйте у администрации клуба.",
                    },
                )
                if created:
                    entry.coaches.set([coaches[c] for c in teachers])
        for slug, name, price, count, unlimited, category, eligibility in [
            ("twice", "2 тренировки в неделю", 4500, 2, False, "standard", ""),
            ("three", "3 тренировки в неделю", 6000, 3, False, "standard", ""),
            ("unlimited", "Безлимит", 7000, None, True, "standard", "4 и более тренировок в неделю."),
            (
                "student",
                "Студенческий тариф",
                4000,
                None,
                False,
                "special",
                "Для взрослых студентов вузов и колледжей при предъявлении действующего студенческого билета.",
            ),
            (
                "team",
                "Спортивная команда Киокусинкай",
                5500,
                None,
                True,
                "special",
                "Только активным спортсменам Киокусинкай: участие во всех сезонных, зимних и летних сборах клуба, минимум 3 соревнования в год, активное участие в спортивной жизни. Право подтверждает тренер или администрация.",
            ),
        ]:
            plan, created = m.PricingPlan.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "price": price,
                    "sessions_per_week": count,
                    "unlimited": unlimited,
                    "category": category,
                    "eligibility": eligibility,
                },
            )
            if created:
                plan.programs.set([programs["kyokushin"]] if slug == "team" else list(programs.values()))
        for slug, name, value, kind, desc in [
            (
                "third",
                "Додзё — наш дом: 3-й член семьи",
                50,
                "percent",
                "Скидка 50% для третьего члена семьи.",
            ),
            ("fourth", "4-й член семьи и последующие", 100, "free", "Тренируются бесплатно."),
            ("large-family", "Многодетные семьи", 25, "percent", "Скидка 25% на абонементы."),
        ]:
            m.DiscountProgram.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "discount_value": value,
                    "discount_type": kind,
                    "description": desc,
                    "eligibility_text": "Условия одновременного применения нескольких льгот уточняйте у администрации клуба.",
                },
            )
        for question, answer, slug in [
            (
                "Можно ли прийти без опыта?",
                "Да. На первую тренировку не требуется знать технику или заранее покупать полную экипировку.",
                None,
            ),
            (
                "Первая тренировка бесплатная?",
                "Да, первая тренировка бесплатная. Запишитесь, чтобы согласовать группу.",
                None,
            ),
            (
                "Обязательны ли соревнования?",
                "Нет. Соревнования доступны желающим и подготовленным спортсменам.",
                None,
            ),
            (
                "Как выбрать направление?",
                "Маугли — физическое развитие детей 3–7 лет. BJJ — борьба для детей от 7 лет. Киокусинкай — занятия для детей, подростков и взрослых.",
                None,
            ),
            (
                "Что взять с собой?",
                "Точные требования к одежде и экипировке уточните у тренера перед первым занятием.",
                None,
            ),
            (
                "Это карате?",
                "Нет. Маугли — самостоятельная система физического воспитания и общей физической подготовки детей.",
                "mowgli",
            ),
            ("Сколько длится занятие?", "Занятие Маугли длится 45 минут.", "mowgli"),
            (
                "Как проходит занятие?",
                "Двигательные задания, координационные упражнения, ОФП, игровые элементы и работа с собственным телом.",
                "mowgli",
            ),
            (
                "Есть ли спарринги?",
                "В тренировочном процессе Киокусинкай предусмотрены спарринги. Условия участия обсудите с тренером.",
                "kyokushin",
            ),
            (
                "Что такое BJJ?",
                "Бразильское джиу-джитсу — направление борьбы. В K-Dojo дети осваивают позиции, технику и работу с партнёром.",
                "bjj",
            ),
        ]:
            m.FAQ.objects.get_or_create(
                question=question, defaults={"answer": answer, "program": programs.get(slug)}
            )
        m.SiteSettings.objects.get_or_create(
            pk=1,
            defaults={
                "about_text": "K-Dojo — спортивный клуб в Королёве. Здесь можно начать заниматься, развиваться и при желании постепенно перейти к серьёзному спорту."
            },
        )
        self.stdout.write(self.style.SUCCESS("Club facts seeded; existing content preserved."))
