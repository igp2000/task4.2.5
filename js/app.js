
// список полученных репозиториев
let repositories = {};
// список выбранных репозиториев 
let list_repositories = {};

let input = null;
let menu = null;

// Первоначальная инициализация
function init() {
   input = document.querySelector("#input-search");
   if (input) {
      input.addEventListener("input", debounce(get_repositories, 1000));
   }
   menu = document.querySelector(".menu");
   if (menu) {
      menu.addEventListener('click', (event) => {
         add_repository(event.target.textContent);
         menu.innerHTML = '';
         input.value = '';
         repositories = {};
      });
   }
}

window.onload = init;


const debounce = (func, tm) => {
   let id_timeout = null;

   return function () {
      clearTimeout(id_timeout);
      id_timeout = setTimeout(() => func.call(this, input), tm);
   };
};


// получает репозитории с гитхаба
async function get_repositories() {

   if (!menu) { return; }
   // очищаем меню
   menu.innerHTML = '';

   input.value = input.value.trim();
   if (!input.value) { return; }

   try {
      repositories = await fetch(
         `https://api.github.com/search/repositories?q=${input.value}&sort=stars`,
         {
            headers: {
               accept: "toapplication/vnd.github.v3+json",
            },
         }
      );
      repositories = await repositories.json();
      repositories.items.splice(5);
      repositories = repositories.items.reduce((mas, item) => {
         mas[item.name] = {
            'owner': item.owner.login,
            'stars': item.stargazers_count
         };
         return mas;
      }, {});

      // показываем меню для выбора
      show_menu_repositories();

   } catch (err) {
      alert(`${err.name} : ${err.message} `);
      repositories = {};
   }

}


// показывает меню из пяти пунктов
function show_menu_repositories() {

   const fragment = document.createDocumentFragment();

   for (let key in repositories) {
      let li = document.createElement('LI');
      li.setAttribute("tabindex", 101);
      li.innerHTML = key;
      fragment.append(li);
   };
   menu.append(fragment);
}


// добавляет выбранный репозиторий в список
function add_repository(key) {

   if (list_repositories[key]) {
         alert(`Репозиторий "${key}" уже присутствует в списке`);
         return;
      }
   
   list_repositories[key] = JSON.parse(JSON.stringify(repositories[key]));

   let div = document.createElement('DIV');
   div.classList.add("list__item");

   let span = document.createElement('SPAN');
   let br = document.createElement('BR');
   span.innerHTML = `Name: ${key}`;
   div.append(span);
   div.append(br);

   span = document.createElement('SPAN');
   br = document.createElement('BR');
   span.innerHTML = `Owner: ${list_repositories[key].owner}`;
   div.append(span);
   div.append(br);

   span = document.createElement('SPAN');
   br = document.createElement('BR');
   span.innerHTML = `Stars: ${list_repositories[key].stars}`;
   div.append(span);

   let button = document.createElement('BUTTON');
   button.classList.add("btn-close");
   button.setAttribute("tabindex", 102);
   button.addEventListener("click", (event) => {
      delete list_repositories[key];
      div.remove();
    });
   div.append(button);

   let list = document.querySelector(".list");
   if (list) {
      list.prepend(div);
   }
}
