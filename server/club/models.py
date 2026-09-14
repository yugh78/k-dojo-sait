from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from .validators import validate_image


class Content(models.Model):
    is_demo = models.BooleanField(default=False, verbose_name="Демонстрационные данные")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True
        ordering = ["sort_order", "pk"]


class Program(Content):
    name = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    short_description = models.TextField(blank=True)
    description = models.TextField(blank=True)
    audience = models.CharField(max_length=160, blank=True)
    minimum_age = models.PositiveSmallIntegerField(null=True, blank=True)
    maximum_age = models.PositiveSmallIntegerField(null=True, blank=True)
    training_steps = models.TextField(blank=True, help_text="Один этап на строку")
    first_training = models.TextField(blank=True)
    equipment = models.TextField(blank=True)
    image = models.ImageField(upload_to="programs/", blank=True, validators=[validate_image])
    accent = models.CharField(
        max_length=12, default="red", choices=[("red", "Красный"), ("gold", "Золотой"), ("green", "Зелёный")]
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Coach(Content):
    full_name = models.CharField(max_length=180)
    slug = models.SlugField(unique=True)
    photo = models.ImageField(upload_to="coaches/", blank=True, validators=[validate_image])
    short_description = models.TextField(blank=True)
    biography = models.TextField(blank=True)
    qualifications = models.TextField(blank=True)
    achievements = models.TextField(blank=True)
    experience = models.CharField(max_length=160, blank=True)
    programs = models.ManyToManyField(Program, related_name="coaches", blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.full_name


class Certificate(Content):
    coach = models.ForeignKey(Coach, on_delete=models.CASCADE, related_name="certificates")
    title = models.CharField(max_length=160)
    image = models.ImageField(upload_to="certificates/", validators=[validate_image])


class Location(Content):
    name = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    address = models.CharField(max_length=250, blank=True)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
    )
    entrance = models.TextField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    route_url = models.URLField(blank=True)
    programs = models.ManyToManyField(Program, blank=True)
    photo = models.ImageField(upload_to="locations/", blank=True, validators=[validate_image])
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class TrainingGroup(Content):
    name = models.CharField(max_length=160)
    program = models.ForeignKey(Program, on_delete=models.PROTECT)
    minimum_age = models.PositiveSmallIntegerField(null=True, blank=True)
    maximum_age = models.PositiveSmallIntegerField(null=True, blank=True)
    audience = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Validity(Content):
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta(Content.Meta):
        abstract = True

    def clean(self):
        super().clean()
        if self.valid_from and self.valid_until and self.valid_until < self.valid_from:
            raise ValidationError("Дата окончания раньше даты начала.")


class ScheduleEntry(Validity):
    program = models.ForeignKey(Program, on_delete=models.PROTECT)
    training_group = models.ForeignKey(TrainingGroup, on_delete=models.PROTECT)
    location = models.ForeignKey(Location, on_delete=models.PROTECT, null=True, blank=True)
    coaches = models.ManyToManyField(Coach)
    weekday = models.PositiveSmallIntegerField(
        choices=list(
            enumerate(["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"])
        )
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    minimum_age = models.PositiveSmallIntegerField(null=True, blank=True)
    maximum_age = models.PositiveSmallIntegerField(null=True, blank=True)
    audience = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["weekday", "start_time", "sort_order"]

    def clean(self):
        super().clean()
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValidationError("Занятие должно заканчиваться после начала.")
        if self.training_group_id and self.program_id != self.training_group.program_id:
            raise ValidationError("Направление группы не совпадает.")
        if (
            self.minimum_age is not None
            and self.maximum_age is not None
            and self.minimum_age > self.maximum_age
        ):
            raise ValidationError("Некорректный возрастной диапазон.")

    def __str__(self):
        return f"{self.training_group} / {self.get_weekday_display()} {self.start_time}"


class PricingPlan(Validity):
    name = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    price = models.DecimalField(max_digits=9, decimal_places=2, validators=[MinValueValidator(0)])
    billing_period = models.CharField(max_length=40, default="месяц")
    sessions_per_week = models.PositiveSmallIntegerField(null=True, blank=True)
    unlimited = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    eligibility = models.TextField(blank=True)
    programs = models.ManyToManyField(Program, blank=True)
    training_groups = models.ManyToManyField(TrainingGroup, blank=True)
    category = models.CharField(
        max_length=20, default="standard", choices=[("standard", "Основной"), ("special", "Специальный")]
    )

    def __str__(self):
        return self.name


class DiscountProgram(Content):
    name = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    discount_type = models.CharField(max_length=20, choices=[("percent", "Процент"), ("free", "Бесплатно")])
    discount_value = models.DecimalField(
        max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    description = models.TextField(blank=True)
    eligibility_text = models.TextField(blank=True)
    applicable_programs = models.ManyToManyField(Program, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class GalleryAlbum(Content):
    title = models.CharField(max_length=180)
    slug = models.SlugField(unique=True)
    category = models.CharField(
        max_length=30,
        choices=[(v, v) for v in ["kyokushin", "bjj", "mowgli", "competitions", "camps", "exams", "club"]],
    )
    cover = models.ImageField(upload_to="gallery/", blank=True, validators=[validate_image])
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class GalleryImage(Content):
    album = models.ForeignKey(GalleryAlbum, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="gallery/", validators=[validate_image])
    caption = models.CharField(max_length=250)
    image_webp = models.ImageField(upload_to="gallery/", blank=True, validators=[validate_image])
    image_avif = models.ImageField(upload_to="gallery/", blank=True, validators=[validate_image])


class Event(Content):
    title = models.CharField(max_length=180)
    slug = models.SlugField(unique=True)
    program = models.ForeignKey(Program, on_delete=models.PROTECT, null=True, blank=True)
    event_type = models.CharField(
        max_length=30,
        choices=[
            (value, label)
            for value, label in [
                ("competition", "Соревнование"),
                ("camp", "Сборы"),
                ("exam", "Экзамен"),
                ("holiday", "Лагерь"),
                ("seminar", "Семинар"),
                ("club", "Клубное мероприятие"),
            ]
        ],
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=250, blank=True)
    age_text = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    content = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="events/", blank=True, validators=[validate_image])
    gallery = models.ForeignKey(GalleryAlbum, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(
        max_digits=9, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)]
    )
    registration_available = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)

    def clean(self):
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError("Дата окончания раньше даты начала.")

    def __str__(self):
        return self.title


class Athlete(Content):
    full_name = models.CharField(max_length=180)
    photo = models.ImageField(upload_to="athletes/", blank=True, validators=[validate_image])
    program = models.ForeignKey(Program, on_delete=models.PROTECT)
    biography = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.full_name


class Competition(Content):
    title = models.CharField(max_length=180)
    slug = models.SlugField(unique=True)
    date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=250, blank=True)
    description = models.TextField(blank=True)
    program = models.ForeignKey(Program, on_delete=models.PROTECT)
    cover_image = models.ImageField(upload_to="competitions/", blank=True, validators=[validate_image])
    gallery = models.ForeignKey(GalleryAlbum, on_delete=models.SET_NULL, null=True, blank=True)
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class CompetitionResult(Content):
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name="results")
    athlete = models.ForeignKey(Athlete, on_delete=models.PROTECT)
    category = models.CharField(max_length=160)
    place = models.PositiveSmallIntegerField(null=True, blank=True)
    result_text = models.CharField(max_length=250, blank=True)
    notes = models.TextField(blank=True)


class FAQ(Content):
    question = models.CharField(max_length=250)
    answer = models.TextField()
    program = models.ForeignKey(Program, on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.question


class SiteSettings(models.Model):
    name = models.CharField(max_length=100, default="K-Dojo")
    phone = models.CharField(max_length=30, default="+7 (925) 017-32-16")
    telegram = models.URLField(default="https://t.me/kdojokorolev")
    email = models.EmailField(blank=True)
    city = models.CharField(max_length=100, default="Королёв")
    hero_text = models.CharField(max_length=200, default="Спортивный клуб в Королёве")
    hero_image = models.ImageField(upload_to="site/", blank=True, validators=[validate_image])
    cta_text = models.CharField(max_length=100, default="Записаться бесплатно")
    about_text = models.TextField(blank=True)
    seo_description = models.CharField(
        max_length=300,
        default="Киокусинкай, BJJ и Маугли в Королёве. Занятия для детей и взрослых. Первая тренировка бесплатно.",
    )
    privacy_text = models.TextField(blank=True, help_text="TODO: утверждённая политика оператора")
    consent_text = models.TextField(blank=True, help_text="TODO: утверждённый текст согласия")
    legal_ready = models.BooleanField(
        default=False, help_text="Включить при заполненной и утверждённой политике и согласии"
    )

    def clean(self):
        if self.legal_ready and (not self.privacy_text.strip() or not self.consent_text.strip()):
            raise ValidationError("Заполните политику и согласие перед включением формы.")

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return "Настройки K-Dojo"
