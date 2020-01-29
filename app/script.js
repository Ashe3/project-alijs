document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector(".search");
  const cartBtn = document.getElementById("cart");
  const wishListBtn = document.getElementById("wishlist");
  const goodsWrapper = document.querySelector(".goods-wrapper");
  const cart = document.querySelector(".cart");
  const category = document.querySelector(".category");
  const cartCounter = cartBtn.querySelector(".counter");
  const wishListCounter = wishListBtn.querySelector(".counter");
  const cartWrapper = document.querySelector(".cart-wrapper");

  const wishlist = [];

  const cartlist = {};

  const loading = name => {
    const spinner = `<div id="spinner"><div class="spinner-loading"><div><div><div></div>
    </div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>
    `;

    if (name === "renderCard") {
      goodsWrapper.innerHTML = spinner;
    }

    if (name === "renderCart") {
      cartWrapper.innerHTML = spinner;
    }
  };

  const renderCard = items => {
    goodsWrapper.textContent = "";

    if (items.length) {
      items.forEach(({ id, title, price, imgMin }) =>
        goodsWrapper.append(createCardGoods(id, title, price, imgMin))
      );
    } else {
      goodsWrapper.textContent = "Nothing";
    }
  };

  const getGoods = (handler, filter) => {
    loading(handler.name);
    fetch("db/db.json")
      .then(response => response.json())
      .then(filter)
      .then(handler);
  };

  const createCardGoods = (id, title, price, img) => {
    const card = document.createElement("div");
    card.className = "card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3";
    card.innerHTML = `								
    <div class="card">
        <div class="card-img-wrapper">
            <img class="card-img-top" src="${img}" alt="">
            <button class="card-add-wishlist ${
              wishlist.includes(id) ? "active" : ""
            }" data-goods-id=${id}></button>
        </div>
        <div class="card-body justify-content-between">
            <a href="#" class="card-title">${title}</a>
            <div class="card-price">${price} ₽</div>
            <div>
                <button class="card-add-cart" data-goods-id=${id}>Добавить в корзину</button>
            </div>
        </div>
    </div>`;
    return card;
  };

  const createCartGoods = (id, title, price, img) => {
    const card = document.createElement("div");
    card.className = "goods";
    card.innerHTML = `								
    <div class="goods-img-wrapper">
      <img class="goods-img" src="${img}" alt="">
    </div>
    <div class="goods-description">
      <h2 class="goods-title">${title}</h2>
      <p class="goods-price">${price} ₽</p>
    </div>
    <div class="goods-price-count">
      <div class="goods-trigger">
        <button class="goods-add-wishlist ${
          wishlist.includes(id) ? "active" : ""
        }" 
          data-goods-id="${id}"></button>
        <button class="goods-delete" data-goods-id="${id}"></button>
    </div>
      <div class="goods-count">${cartlist[id]}</div>
    </div>`;
    return card;
  };

  const renderCart = goods => {
    cartWrapper.textContent = "";

    if (goods.length) {
      goods.forEach(({ id, title, price, imgMin }) =>
        cartWrapper.append(createCartGoods(id, title, price, imgMin))
      );
    } else {
      cartWrapper.innerHTML =
        '<div id="cart-empty">Ваша корзина пока пуста</div>';
    }
  };

  const closeCart = event => {
    const { target } = event;

    if (
      target === cart ||
      target.classList.contains("cart-close") ||
      event.keyCode === 27
    ) {
      cart.style.display = "";
      document.removeEventListener("keyup", closeCart);
    }
  };

  const calcTotalPrice = goods => {
    const sum = goods.reduce((sum, {id, price}) => sum + price * cartlist[id], 0);
    cart.querySelector('.cart-total>span').textContent = sum.toFixed(2);
  }

  const showCardBasket = goods => {
    const cartGoods = goods.filter(item => cartlist[item.id]);
    calcTotalPrice(cartGoods)
    return cartGoods;
  };

  const openCart = event => {
    event.preventDefault();
    cart.style.display = "flex";
    document.addEventListener("keyup", closeCart);
    getGoods(renderCart, showCardBasket);
  };

  const randomFilter = items => items.sort(() => Math.random() - 0.5);

  const choiceCategory = event => {
    event.preventDefault();
    const { target } = event;

    if (target.classList.contains("category-item")) {
      const { category: cat } = target.dataset;
      getGoods(renderCard, goods =>
        goods.filter(({ category }) => category.includes(cat))
      );
    }
  };

  const searchGoods = event => {
    event.preventDefault();

    const input = event.target.elements.searchGoods;
    const inputValue = input.value.trim();
    if (inputValue !== "") {
      const searchString = new RegExp(inputValue, "gi");
      getGoods(renderCard, goods =>
        goods.filter(({ title }) => searchString.test(title))
      );
    } else {
      search.classList.add("error");
      setTimeout(() => {
        search.classList.remove("error");
      }, 2000);
    }

    input.value = "";
  };

  const checkCount = () => {
    wishListCounter.textContent = wishlist.length;
    cartCounter.textContent = Object.keys(cartlist).length;
  };

  const getCookie = name => {
    let matches = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
  };

  const cookieQuery = get => {
    if (get) {
      if (getCookie("goodsCart")) {
        Object.assign(cartlist, JSON.parse(getCookie("goodsCart")));
        checkCount();
      }
    } else {
      document.cookie = `goodsCart=${JSON.stringify(
        cartlist
      )}; max-age=86400e3`;
    }
  };

  const storageQuery = get => {
    if (get) {
      if (localStorage.getItem("wishlist")) {
        wishlist.push(...JSON.parse(localStorage.getItem("wishlist")));
      }
    } else {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
    checkCount();
  };

  const toggleWhishList = (id, element) => {
    if (wishlist.includes(id)) {
      wishlist.splice(wishlist.indexOf(id), 1);
      element.classList.remove("active");
    } else {
      wishlist.push(id);
      element.classList.add("active");
    }
    checkCount();
    storageQuery();
  };

  const addCart = id => {
    if (cartlist[id]) {
      cartlist[id] += 1;
    } else {
      cartlist[id] = 1;
    }
    checkCount();
    cookieQuery();
  };

  const handleGoods = event => {
    const { target } = event;

    if (target.classList.contains("card-add-wishlist")) {
      const { goodsId: id } = target.dataset;
      toggleWhishList(id, target);
    }

    if (target.classList.contains("card-add-cart")) {
      addCart(target.dataset.goodsId);
    }
  };

  const showWishList = () => {
    getGoods(renderCard, goods =>
      goods.filter(({ id }) => wishlist.includes(id))
    );
  };

  cartBtn.addEventListener("click", openCart);
  cart.addEventListener("click", closeCart);
  category.addEventListener("click", choiceCategory);
  search.addEventListener("submit", searchGoods);
  goodsWrapper.addEventListener("click", handleGoods);
  wishListBtn.addEventListener("click", showWishList);

  getGoods(renderCard, randomFilter);
  storageQuery(true);
  cookieQuery(true);
});
