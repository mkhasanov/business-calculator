# Moslashtirish qo‘llanmasi

## Ranglarni o‘zgartirish

Ranglar `css/style.css` ichida `:root` va `body.dark-mode` bloklarida aniqlangan.

## Brendni o‘zgartirish

- `index.html` ichidagi `Business Calculator Pack` nomini o‘zgartiring.
- `brand-mark` logotip yoki yorliqlarni yangilang.
- Matnlar Uzbek tilida qolishi kerak.

## Yangi kalkulyator qo‘shish

1. `js/data.js` fayliga yangi kalkulyator ob’ektini qo‘shing.
2. `categoryGroups` ichida kategoriya va id ni aniqlang.
3. `js/calculators.js` ichida hisoblash funksiyasini qo‘shing.
4. Agar kerak bo‘lsa, `renderDashboard` va dashboard formalarini yangilang.

## Formulalar va hisob-kitoblarni o‘zgartirish

`js/calculators.js` faylida har-bir kalkulyator uchun hisoblash logikasi mavjud. Formulalar o‘zgartirilganda natijalar avtomatik yangilanadi.

## Valyuta kurslarini o‘zgartirish

Sozlamalar panelidan kursni tog‘ri kiritish mumkin. Kurslar `localStorage` da saqlanadi.

## Kategoriyalarni o‘zgartirish

`js/data.js` ichida `categoryGroups` massivi ma’lumotlari ustidan ishlang.

## Tarix va sevimlilar

Tarix, sevimlilar va so‘nggi ishlatilgan kalkulyatorlar `localStorage` orqali saqlanadi.
