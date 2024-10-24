<template>
  <!-- <form  > -->
    <fieldset>
      <legend>Заявка</legend>
      <div>
        <div><label>Ваше имя: <input type="text" name="token" v-model="name" placeholder="Введите Ваше имя" required></label></div>
        <div><label>Ваша почта: <input type="email" name="token" v-model="mail" placeholder="Введите Вашу почту" required></label></div>
        <div><label>Ваш номер телефона: <input type="phone" name="token" v-model="phone" placeholder="Введите Ваш номер телефона" required></label>
        </div>
      </div>
      <div>
        <button @click.prevent="subm()">отправить</button>
      </div>
    </fieldset>
  <!-- </form> -->
</template>

<script setup>
import { ref } from 'vue';

let name = ref('');
let mail = ref('');
let phone = ref('');

const subm = async () => {
  const data = {
    name: name.value,
    email: mail.value,
    phone: phone.value,
  };

  try {
    // Отправляем POST-запрос на сервер
    const response = await fetch('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  // Указываем, что отправляем JSON
      },
      body: JSON.stringify(data),  // Преобразуем объект в JSON
    });

    // Обрабатываем ответ сервера
    if (response.ok) {
      const result = await response.json();
      console.log('Ответ сервера:', result);
      // Здесь можно показать сообщение об успешной отправке
    } else {
      console.error('Ошибка при отправке данных:', response.status);
      // Обработать ошибку, например показать пользователю сообщение
    }
  } catch (error) {
    console.error('Ошибка:', error);
    // Обработать ошибку (например, проблемы с сетью)
  }
};
</script>

<style>
.TextArea {
  width: 100%;
}
</style>