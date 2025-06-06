const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUPPORT_FILE = path.join(DATA_DIR, 'supportRequests.json');
const RESTAURANTS_FILE = path.join(DATA_DIR, 'restaurants.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
  console.log('Создана папка data');
}

// Инициализация
const initialData = {
  [USERS_FILE]: [],
  [SUPPORT_FILE]: [],
  [RESTAURANTS_FILE]: [
    {
      id: 1,
      name: "Тот самый Каркарыч",
      deliveryTime: "24 мин",
      rating: 4.8,
      image: "/Assets/Resturent1.png",
      tags: ["Healthy"],
      menu: [
        { id: 1, name: "Chicken Hell", price: 599.99, time: "24 мин", rating: 4.8, image: "/Assets/Food1.png", tags: ["Healthy"] },
        { id: 2, name: "Botanic Panic", price: 999.99, time: "34 мин", rating: 4.9, image: "/Assets/Food2.png", tags: ["Trending"] }
      ]
    },
    {
      id: 2,
      name: "Булочки Хатабыча",
      deliveryTime: "24 мин",
      rating: 4.9,
      image: "/Assets/Resturent2.png",
      tags: ["Trending"],
      menu: [
        { id: 3, name: "Supreme Dish", price: 999.99, time: "34 мин", rating: 4.9, image: "/Assets/Food3.png", tags: ["Supreme"] },
        { id: 4, name: "Chicken Hell", price: 599.99, time: "24 мин", rating: 4.8, image: "/Assets/Food4.png", tags: ["Healthy"] }
      ]
    },
    {
      id: 3,
      name: "Пиво У Палыча",
      deliveryTime: "24 мин",
      rating: 5.0,
      image: "/Assets/Resturent3.png",
      tags: ["Supreme"],
      menu: [
        { id: 5, name: "Киссинг", price: 880.55, time: "34 мин", rating: 4.9, image: "/Assets/FoodKisser.png", tags: ["Supreme"] },
        { id: 6, name: "Астолависта", price: 1469.99, time: "24 мин", rating: 4.9, image: "/Assets/FoodPig.png", tags: ["Healthy"] }
      ]
    }
  ]
};

Object.entries(initialData).forEach(([file, data]) => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(data, null, 3));
    console.log(`Создан файл ${path.basename(file)}`);
  }
});

console.log('Хранилище успешно инициализировано!');