const itemInput = document.querySelector("input[name='itemInput']");
const shoppingListDiv = document.querySelector(".shopping-list");
const completedDiv = document.querySelector(".completed");
const clearCompletedBtn = document.querySelector("#clear-completed");

let shoppingList = [];
let completedList = [];

const saveToStore = function ({ shoppingList, completedList }) {
  window.localStorage.setItem(
    "shoppingApp_active",
    JSON.stringify(shoppingList)
  );

  window.localStorage.setItem(
    "shoppingApp_completed",
    JSON.stringify(completedList)
  );
};

const getFromStore = function () {
  const getActive = window.localStorage.getItem("shoppingApp_active");

  const getCompleted = window.localStorage.getItem("shoppingApp_completed");

  return {
    active: getActive ? JSON.parse(getActive) : [],
    completed: getCompleted ? JSON.parse(getCompleted) : [],
  };
};

const Item = (title, priority = "normal", id) => {
  return `<div class="item ${priority}" data-id="${id}" draggable="true">
            <div class="task">${title}</div>
            <div class="priority-control">
              <span class="high"></span>
              <span class="normal"></span>
              <span class="low"></span>
            </div>
            <div class="remove-btn">REMOVE</div>
          </div>`;
};

const renderShoppingList = () => {
  const domNodes = getShoppingList().map(({ item, priority, id }) => {
    return Item(item, priority, id);
  });

  shoppingListDiv.innerHTML = domNodes.join("");
};

const renderCompletedList = () => {
  const domNodes = getCompletedList().map(({ item, priority, id }) => {
    return Item(item, priority, id);
  });
  completedDiv.innerHTML = domNodes.join("");
};

const addToShoppingList = (item) => {
  if (item === "") {
    shoppingList = shoppingList;
  } else {
    const itemId = `${parseInt(
      Math.random() * 10000000
    )} - ${new Date().getTime()}`;

    shoppingList.push({
      id: itemId,
      item,
      priority: "normal",
    });
    saveToStore({
      shoppingList,
      completedList,
    });
  }
};

const setPriority = (itemId, priority) => {
  shoppingList = shoppingList.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        priority,
      };
    }
    return item;
  });

  saveToStore({
    shoppingList,
    completedList,
  });
};

const removeItem = (itemId) => {
  shoppingList = shoppingList.filter(({ id }) => id !== itemId);

  saveToStore({
    shoppingList,
    completedList,
  });
};

const addToCompletedList = (itemId) => {
  const getItem = shoppingList.find(({ id }) => id === itemId);
  shoppingList = shoppingList.filter(({ id }) => id !== itemId);
  completedList = [getItem, ...completedList];

  saveToStore({
    shoppingList,
    completedList,
  });
};

const clearCompleted = () => {
  completedList = [];
  saveToStore({
    shoppingList,
    completedList,
  });
};

const getShoppingList = () => shoppingList;

const getCompletedList = () => completedList;

const bootUp = () => {
  const { active, completed } = getFromStore();
  shoppingList = active;
  completedList = completed;
};

itemInput.addEventListener("keyup", function (evt) {
  if (evt.key === "Enter") {
    // Add to shopping list
    addToShoppingList(evt.target.value);

    // Update the view
    renderShoppingList();

    // Clearing the input field once enter is pressed
    this.value = "";
  }
});

shoppingListDiv.addEventListener("click", function (evt) {
  // Priority buttons
  if (evt.target.parentElement.classList.contains("priority-control")) {
    const priority = evt.target.classList.value;
    const itemId =
      evt.target.parentElement.parentElement.getAttribute("data-id");

    // Set priority
    setPriority(itemId, priority);

    // Re-render view
    renderShoppingList();
  }

  // Remove
  if (evt.target.classList.contains("remove-btn")) {
    const itemId = evt.target.parentElement.getAttribute("data-id");

    // If the item is removed, update the view

    const confirm = window.confirm("Do you really want to remove this item?");
    if (confirm) {
      removeItem(itemId);
      renderShoppingList();
    }
  }
});

shoppingListDiv.addEventListener("dragstart", function (evt) {
  if (evt.target.classList.contains("item")) {
    const getId = evt.target.getAttribute("data-id");
    evt.dataTransfer.setData("text/plain", getId);
  }
});

completedDiv.addEventListener("drop", function (evt) {
  const itemId = evt.dataTransfer.getData("text/plain");
  // Add item to completed div
  addToCompletedList(itemId);

  // Update shopping list view
  renderShoppingList();

  // Update completed list view
  renderCompletedList();
});

completedDiv.addEventListener("dragover", function (evt) {
  evt.preventDefault();
});

clearCompletedBtn.addEventListener("click", function (evt) {
  evt.preventDefault();
  clearCompleted();
  renderCompletedList();
});

(() => {
  bootUp();
  renderShoppingList();
  renderCompletedList();
})();
