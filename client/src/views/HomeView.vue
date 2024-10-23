<template>
  <form action="/" method="post">
    <fieldset>
      <legend>Заявка</legend>
      <div>
        <div><label>Ваше имя: <input type="text" name="token" placeholder="Введите Ваше имя" required></label></div>
        <div><label>Ваша фамилия: <input type="text" name="token" placeholder="Введите Вашу фамилию" required></label></div>
        <div><label>Ваша почта: <input type="email" name="token" placeholder="Введите Вашу почту" required></label></div>
        <div><label>Ваш номер телефона: <input type="telephone" name="token" placeholder="Введите Ваш номер телефона" required></label>
        </div>
      </div>
      <div>
        <button type="submit">отправить</button>
      </div>
    </fieldset>
  </form>
</template>

<style>
.TextArea {
  width: 100%;
}
</style>