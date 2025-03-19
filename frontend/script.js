document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list");
    const searchBar = document.getElementById("search-bar");
    const searchButton = document.getElementById("search-button");

    //отрисовка продуктов
    function renderProducts(products) {
        productList.innerHTML = "";
        products.forEach((product) => {
            const productDiv = document.createElement("a");
            productDiv.href = `product.html?id=${product._id}`;
            productDiv.classList.add("product");

            productDiv.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p><strong>$${product.price}</strong></p>
            `;

            productList.appendChild(productDiv);
        });
    }


    function fetchProducts() {
        fetch("http://localhost:5000/products")
            .then((response) => response.json())
            .then((products) => {
                renderProducts(products);

                searchBar.addEventListener("input", () => filterProducts(products));
                searchButton.addEventListener("click", () => filterProducts(products));
            })
            .catch((error) =>
                console.error("Ошибка при загрузке продуктов: ", error)
            );
    }

    //фильтрация продуктов
    function filterProducts(products) {
        const query = searchBar.value.toLowerCase();

        const filteredProducts = products.filter((product) => {
            return (
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query)
            );
        });

        renderProducts(filteredProducts);
    }


    // load products
    fetchProducts();
});