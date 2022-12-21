const express = require("express");
const cartController = require("../controllers/cartController");
const {
  getProducts,
  createCODOrder,
  emptyCart,
  createOnlineOrder,
  getSingleProduct,
  fetchOrders,
} = require("../models/userModel");
require("dotenv").config();

const razorpayInstance = require("../config/razorpay");

const transporter = require("../config/smtp");
const productsController = require("../controllers/productsController");
const router = express.Router();

router.get("/", async (req, res) => {
  const products = await getProducts();

  // console.log(products);
  res.render("user/home", { products: products });
});

router.get("/products", productsController.fetchProducts);

router.get("/products/:category", productsController.fetchCategoryProducts);

router.get("/product/:id", productsController.fetchSingleProduct);

router.post("/addtocart", cartController.addCart);

router.post("/removecart", cartController.removeCart);

router.get("/cart", cartController.fetchCartItems);

router.post("/orderplace", async (req, res) => {
  const paymentOption = req.body.paymentoption.trim();
  const cartItems = JSON.parse(req.body.cart);
  const order_id = Math.round(Math.random() * 99999999);

  let products = [];
  let item_quantity = [];
  let item_total = [];
  const user = req.user;
  const user_id = req.user.user_id.trim();

  try {
    for (let i = 0; i < cartItems.length; i++) {
      const product = await getSingleProduct(cartItems[i].product_id.trim());
      item_quantity.push(cartItems[i].quantity);
      item_total.push(cartItems[i].price * cartItems[i].quantity);
      products.push(product[0]);
    }
    let str = `<table border="1">
      <tr>
          <th>title</th>
          <th>author</th>
          <th>price</th>
          <th>quantity</th>
          <th>total</th>
      </tr>
      `;
    let total = 0;
    for (let i = 0; i < products.length; i++) {
      total += item_total[i];
      str += `<tr>
          <td>${products[i].title} </td>
          <td>${products[i].author}</td>
          <td>${products[i].price}</td>
          <td>${item_quantity[i]}</td>
          <td>${item_total[i]}</td>
          </tr>
          `;
    }
    str += ` <tr>
              <th colspan="4">Total</th>
              <td>${total}</td>
          </tr>
          </table>`;

    if (paymentOption === "cod") {
      createCODOrder(
        order_id,
        user_id,
        JSON.stringify(products),
        JSON.stringify(item_quantity),
        JSON.stringify(item_total)
      );

      emptyCart(req.user.user_id.trim());

      let info = await transporter.sendMail({
        from: process.env.USER_MAIL, // sender address
        to: user.email, // list of receivers
        subject: "Your Order has been successfully placed", // Subject line
        html: `<p>Thank you for shopping Your Order has been successfully placed</p>
          <b>Your Order Id is #${order_id}</b>
          ${str}
          <p>your items will be delivered soon at your address and payment will be cash on delivery</p>`, // html body
      });

      res.render("user/orderplaced", {
        cartItems: cartItems,
        order_id: order_id,
      });
    }
    if (paymentOption === "online") {
      // console.log("online mode");

      emptyCart(req.user.user_id.trim());

      const receiptId = Math.floor(Math.random() * 99999999);
      const rzpOrder = {
        amount: total * 100, // rzp format with paise
        currency: "INR",
        receipt: receiptId, //Receipt no that corresponds to this Order,
        payment_capture: true,
      };
      try {
        const response = await razorpayInstance.orders.create(rzpOrder);
        // console.log(response);
        const obj = {
          order_id: response.id,
          currency: response.currency,
          amount: response.amount,
        };

        const object = {
          cartItems,
          order_id,
          obj,
          products,
          item_quantity,
          item_total,
          total,
        };
        res.render("user/payment", {
          object: object,
          obj,
          total,
        });
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/ordercomplete", async function (req, res) {
  const cartItems = req.body.data.cartItems;
  const products = req.body.data.products;
  const item_quantity = req.body.data.item_quantity;
  const item_total = req.body.data.item_total;
  const rzpobj = req.body.data.obj;
  const order_id = req.body.data.order_id;
  const rzpresponse = req.body.response;
  const user_id = req.user.user_id.trim();
  const email = req.user.email;
  if (
    cartItems &&
    products &&
    item_quantity &&
    item_total &&
    rzpresponse &&
    rzpobj &&
    order_id
  ) {
    try {
      createOnlineOrder(
        order_id,
        user_id,
        JSON.stringify(products),
        JSON.stringify(item_quantity),
        JSON.stringify(item_total),
        rzpresponse.payment_id,
        rzpresponse.razorpay_order_id,
        rzpresponse.razorpay_signature
      );

      let str = `<table border="1">
      <tr>
          <th>title</th>
          <th>author</th>
          <th>price</th>
          <th>quantity</th>
          <th>total</th>
      </tr>
      `;
      let total = 0;
      for (let i = 0; i < products.length; i++) {
        total += item_total[i];
        str += `<tr>
          <td>${products[i].title} </td>
          <td>${products[i].author}</td>
          <td>${products[i].price}</td>
          <td>${item_quantity[i]}</td>
          <td>${item_total[i]}</td>
          </tr>
          `;
      }
      str += ` <tr>
              <th colspan="4">Total</th>
              <td>${total}</td>
          </tr>
          </table>`;

      let info = await transporter.sendMail({
        from: process.env.USER_MAIL, // sender address
        to: email, // list of receivers
        subject: "Your Order has been successfully placed", // Subject line
        html: `<p>Thank you for shopping Your Order has been successfully placed</p>
          <b>Your Order Id is #${order_id}</b>
          ${str}
          <p>your items will be delivered soon at your address and payment in taken online mode</p>`, // html body
      });

      console.log(info);
      res.redirect("/");
    } catch (error) {
      res.redirect("/");
    }
  }
});

router.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/login");
});

router.get("/orders", async (req, res) => {
  const user_id = req.user.user_id.trim();
  try {
    const orders = await fetchOrders(user_id);

    console.log(orders);

    res.render("user/ordersList", { orders });
  } catch (error) {
    res.render("user/ordersList", {
      orders: [],
    });
  }
});

module.exports = router;

//
