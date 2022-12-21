const {
  getProducts,
  getProductsByCategory,
  getSingleProduct,
} = require("../models/userModel");

const fetchProducts = async (req, res) => {
  const products = await getProducts();
  // console.log(products);
  res.render("user/products", { products: products });
};

const fetchCategoryProducts = async (req, res) => {
  const cat = req.params.category;
  const categorieProducts = await getProductsByCategory(cat);
  res.render("user/products", { products: categorieProducts });
};

const fetchSingleProduct = async (req, res) => {
  const id = req.params.id;
  const foundProduct = await getSingleProduct(id);
  res.render("user/productDetails", { product: foundProduct[0] });
};

module.exports = {
  fetchCategoryProducts,
  fetchProducts,
  fetchSingleProduct,
};
