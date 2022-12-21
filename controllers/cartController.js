const {
  checkCart,
  updateCart,
  addToCart,
  getCartItems,
  removeCartItem,
} = require("../models/userModel");

const fetchCartItems = async (req, res) => {
  const user_id = req.user.user_id.trim();

  const cartItems = await getCartItems(user_id);
  // console.log(cartItems);
  res.render("user/cart", { cartItems: cartItems });
};

const addCart = async (req, res) => {
  const id = req.body.product_id.trim();
  const quantity = Number(req.body.product_quantity.trim());
  const cartItem = await checkCart(id);
  const user_id = req.user.user_id.trim();
  // console.log(cartItem);
  if (!cartItem[0]) {
    addToCart(user_id, id, quantity);
  } else {
    updateCart(user_id, id, quantity);
  }
  res.redirect("/product/" + id);
};

const removeCart = (req, res) => {
  const product_id = req.body.product_id.trim();
  const user_id = req.user.user_id.trim();
  removeCartItem(user_id, product_id);

  res.redirect("/cart");
};

module.exports = {
  fetchCartItems,
  addCart,
  removeCart,
};
