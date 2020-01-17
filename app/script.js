document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector(".search");
  const cartBtn = document.getElementById("cart");
  const whishListBtn = document.getElementById("whishlist");
  const goodsWrapper = document.querySelector(".goods-wrapper");
  const cart = document.querySelector(".cart");
  const category = document.querySelector(".category");

  const wishlist = [];

  const loading = () => {
    goodsWrapper.innerHTML = `<div id="spinner"><div class="spinner-loading"><div><div><div></div>
    </div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>
    `;
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
    loading();
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
            <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" data-goods-id=${id}></button>
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

  const openCart = event => {
    event.preventDefault();
    cart.style.display = "flex";
    document.addEventListener("keyup", closeCart);
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
  
  const toggleWhishList = (id, element) => {
    if (wishlist.includes(id)) {
      wishlist.splice(wishlist.indexOf(id), 1);
      element.classList.remove('active')
    } else {
      wishlist.push(id);
      element.classList.add('active')
    }
    console.log(wishlist)
  }

  const handleGoods = event => {
    const { target } = event;

    if (target.classList.contains('card-add-wishlist')) {
      const { goodsId: id} = target.dataset;
      toggleWhishList(id, target);
    }
  }

  cartBtn.addEventListener("click", openCart);
  cart.addEventListener("click", closeCart);
  category.addEventListener("click", choiceCategory);
  search.addEventListener("submit", searchGoods);
  goodsWrapper.addEventListener("click", handleGoods);

  getGoods(renderCard, randomFilter);
});
