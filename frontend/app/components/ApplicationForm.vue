<script setup lang="ts">
import type { Program, Location } from "~/types/api";
import { ageOutsideRange } from "~/utils/format";
const props = defineProps<{ programSlug?: string }>();
const route = useRoute();
const { data: programs } = await useClubApi<Program[]>("programs");
const { data: locations } = await useClubApi<Location[]>("locations");
const form = reactive({
  name: "",
  phone: "",
  age: "",
  program: "",
  location: "",
  message: "",
  consent: false,
  website: "",
});
const pending = ref(false);
const success = ref("");
const errors = ref<Record<string, string[] | string>>({});
const errorSummary = ref<HTMLDivElement>();
const successPanel = ref<HTMLDivElement>();
const selected = computed(() =>
  programs.value?.find((p) => String(p.id) === form.program),
);
const availableLocations = computed(
  () =>
    locations.value?.filter(
      (l) => !selected.value || l.programs.includes(selected.value.id),
    ) || [],
);
const ageHint = computed(() => {
  const p = selected.value;
  const age = Number(form.age);
  return p && form.age && ageOutsideRange(age, p.minimum_age, p.maximum_age)
    ? "Эта группа обычно рассчитана на другой возраст. Мы всё равно поможем подобрать вариант."
    : "";
});
watch(
  [() => props.programSlug, () => route.query.program, programs],
  () => {
    const slug = props.programSlug || route.query.program;
    form.program = String(
      programs.value?.find((p) => p.slug === slug)?.id || "",
    );
  },
  { immediate: true },
);
watch(
  () => form.program,
  () => {
    if (!availableLocations.value.some((l) => String(l.id) === form.location))
      form.location = "";
  },
);
onMounted(() => {
  form.location =
    typeof route.query.location === "string" ? route.query.location : "";
});
async function submit() {
  if (pending.value) return;
  errors.value = {};
  pending.value = true;
  try {
    const csrf = await $fetch<{ csrfToken: string }>("/api/csrf/");
    const response = await $fetch<{ message: string }>("/api/applications/", {
      method: "POST",
      headers: { "X-CSRFToken": csrf.csrfToken },
      body: {
        ...form,
        age: form.age ? Number(form.age) : null,
        program: form.program ? Number(form.program) : null,
        location: form.location ? Number(form.location) : null,
        training_group:
          route.query.group && route.query.program === selected.value?.slug
            ? Number(route.query.group)
            : null,
        source_page: route.path,
        utm_source: String(route.query.utm_source || "").slice(0, 150),
        utm_medium: String(route.query.utm_medium || "").slice(0, 150),
        utm_campaign: String(route.query.utm_campaign || "").slice(0, 150),
      },
    });
    success.value = response.message;
    await nextTick();
    successPanel.value?.focus();
  } catch (error: unknown) {
    const response = error as {
      data?: { errors?: Record<string, string[] | string> };
      statusCode?: number;
    };
    errors.value = response.data?.errors || {
      form:
        response.statusCode === 429
          ? "Слишком много попыток. Попробуйте позже или позвоните в клуб."
          : "Не удалось отправить заявку. Попробуйте ещё раз или позвоните в клуб.",
    };
    await nextTick();
    errorSummary.value?.focus();
  } finally {
    pending.value = false;
  }
}
</script>
<template>
  <section id="application" class="application">
    <p class="eyebrow">ВАШ ПЕРВЫЙ ШАГ</p>
    <h2>Начнём с тренировки?</h2>
    <p>
      Оставьте заявку. Поможем выбрать направление и согласуем удобную группу.
    </p>
    <div
      v-if="success"
      ref="successPanel"
      tabindex="-1"
      class="success"
      role="status"
    >
      <h3>До встречи в K-Dojo</h3>
      {{ success }}
    </div>
    <form v-else @submit.prevent="submit">
      <div
        v-if="Object.keys(errors).length"
        ref="errorSummary"
        tabindex="-1"
        role="alert"
        class="form-error"
      >
        <p v-for="(error, key) in errors" :key="key">
          {{ Array.isArray(error) ? error.join(" ") : error }}
        </p>
      </div>
      <div class="form-grid">
        <label class="field"
          >Ваше имя<input
            v-model="form.name"
            name="name"
            autocomplete="name"
            maxlength="100"
            required /></label
        ><label class="field"
          >Телефон<input
            v-model="form.phone"
            name="phone"
            autocomplete="tel"
            type="tel"
            maxlength="30"
            required
            placeholder="+7 (___) ___-__-__"
        /></label>
        <label class="field"
          >Возраст занимающегося<input
            v-model="form.age"
            name="age"
            type="number"
            min="1"
            max="120"
            inputmode="numeric"
          /><span v-if="ageHint" class="muted">{{ ageHint }}</span></label
        >
        <label class="field"
          >Направление<select v-model="form.program" name="program">
            <option value="">Не знаю — помогите выбрать</option>
            <option v-for="p in programs" :key="p.id" :value="String(p.id)">
              {{ p.name }}
            </option>
          </select></label
        >
        <label class="field full"
          >Зал<select v-model="form.location" name="location">
            <option value="">Помогите подобрать зал</option>
            <option
              v-for="l in availableLocations"
              :key="l.id"
              :value="String(l.id)"
            >
              {{ l.address || l.name }}
            </option>
          </select></label
        >
        <label class="field full"
          >Комментарий <span class="muted">Необязательно</span
          ><textarea v-model="form.message" name="message" maxlength="2000" />
        </label>
      </div>
      <label class="honeypot" aria-hidden="true"
        >Ваш сайт<input
          v-model="form.website"
          name="website"
          tabindex="-1"
          autocomplete="off"
      /></label>
      <label class="consent"
        ><input
          v-model="form.consent"
          name="consent"
          type="checkbox"
          required
        /><span
          >Я даю
          <NuxtLink to="/personal-data"
            >согласие на обработку персональных данных</NuxtLink
          >
          и ознакомлен(а) с
          <NuxtLink to="/privacy">политикой конфиденциальности</NuxtLink>.</span
        ></label
      >
      <button class="button" :disabled="pending" type="submit">
        {{ pending ? "Отправляем…" : "Записаться бесплатно" }}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  </section>
</template>
