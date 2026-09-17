from django.core.management import BaseCommand, CommandError
from club.models import SiteSettings, Program, Coach, ScheduleEntry


class Command(BaseCommand):
    help = "Report missing publication content without inventing it"

    def handle(self, *args, **options):
        site = SiteSettings.objects.first()
        if not site:
            raise CommandError("TODO: create SiteSettings")
        if not site.hero_image:
            self.stdout.write("TODO: upload real club hero photograph")
        if not site.legal_ready:
            self.stdout.write("TODO: fill and approve privacy/consent text before production form")
        for program in Program.objects.filter(is_active=True):
            if not program.image:
                self.stdout.write(f"TODO: photograph for {program.slug}")
            if not program.equipment:
                self.stdout.write(f"TODO: equipment instructions for {program.slug}")
        for coach in Coach.objects.filter(is_active=True):
            if not coach.photo:
                self.stdout.write(f"TODO: portrait for {coach.slug}")
            if not coach.biography:
                self.stdout.write(f"TODO: biography for {coach.slug}")
        missing = ScheduleEntry.objects.filter(location__isnull=True).count()
        self.stdout.write(f"TODO: confirm locations for {missing} schedule entries")
