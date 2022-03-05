// список полученных репозиториев
let repositories = {};
// список выбранных репозиториев
let list_repositories = {};

const debounce = (func, tm) => {
  let id_timeout = null;

  return function () {
    clearTimeout(id_timeout);
    id_timeout = setTimeout(() => func.call(this), tm);
  };
};

// получает репозитории с гитхаба
const get_repositories = async () => {
  if (!menu) {
    return;
  }
  menu.innerHTML = "";

  input.value = input.value.trim();
  if (!input.value) {
    return;
  }

  try {
    let repos = await fetch(
      `https://api.github.com/search/repositories?q=${input.value}&page=1&per_page=5&sort=stars`,
      {
        headers: {
          accept: "toapplication/vnd.github.v3+json",
        },
      }
    );
    repos = await repos.json();
    if (!repos.items || !repos.items.length) {
      throw new Error("Не найдено ни одного репозиторя");
    }
    repositories = repos.items.reduce((mas, item) => {
      mas[item.name] = {
        owner: item.owner.login,
        stars: item.stargazers_count,
      };
      return mas;
    }, {});

    // показываем меню для выбора
    show_menu_repositories();
  } catch (err) {
    alert(`${err.name} : ${err.message}`);
    repositories = {};
  }
};

// показывает меню из пяти пунктов
const show_menu_repositories = () => {
  const fragment = document.createDocumentFragment();

  for (let key in repositories) {
    let li = document.createElement("LI");
    li.setAttribute("tabindex", 101);
    li.innerHTML = key;
    fragment.append(li);
  }
  menu.append(fragment);
};

// добавляет выбранный репозиторий в список
const add_repository = (key) => {
  if (list_repositories[key]) {
    alert(`Репозиторий "${key}" уже присутствует в списке`);
    return;
  }

  list_repositories[key] = JSON.parse(JSON.stringify(repositories[key]));

  let div_repos = document.createElement("DIV");
  div_repos.classList.add("list__item");

  let span_txt_repos = document.createElement("SPAN");
  let element_br = document.createElement("BR");
  span_txt_repos.innerHTML = `Name: ${key}`;
  div_repos.append(span_txt_repos);
  div_repos.append(element_br);

  span_txt_repos = document.createElement("SPAN");
  element_br = document.createElement("BR");
  span_txt_repos.innerHTML = `Owner: ${list_repositories[key].owner}`;
  div_repos.append(span_txt_repos);
  div_repos.append(element_br);

  span_txt_repos = document.createElement("SPAN");
  element_br = document.createElement("BR");
  span_txt_repos.innerHTML = `Stars: ${list_repositories[key].stars}`;
  div_repos.append(span_txt_repos);

  let button_close = document.createElement("BUTTON");
  button_close.classList.add("btn-close");
  button_close.setAttribute("tabindex", 102);

  const btn_close_listener = () => {
    button_close.removeEventListener("click", btn_close_listener);
    delete list_repositories[key];
    div_repos.remove();
  };

  button_close.addEventListener("click", btn_close_listener);
  div_repos.append(button_close);

  let list_repos = document.querySelector(".list");
  if (list_repos) {
    list_repos.prepend(div_repos);
  }
};

const input = document.querySelector("#input-search");
const menu = document.querySelector(".menu");

if (input) {
  input.addEventListener("input", debounce(get_repositories, 180));
}
if (menu) {
  menu.addEventListener("click", (event) => {
    if (!event.target.textContent) {
      return;
    }
    add_repository(event.target.textContent);
    menu.innerHTML = "";
    input.value = "";
    for (const key of Object.keys(repositories)) {
      delete repositories[key];
    }
  });
}
