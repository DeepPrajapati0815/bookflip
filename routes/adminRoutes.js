const express = require("express");
const { getSingleProduct } = require("../models/userModel");

const router = express.Router();
const {
  addproduct,
  listAllProducts,
  editProduct,
  deleteProduct,
  listAllOrders,
} = require("../models/adminModel");

const upload = require("express-fileupload");
const path = require("path");
const { authenticateAdmin } = require("../middlewares/authMiddleware");

router.get("/admin", (req, res) => {
  res.render("admin/adminlogin", { msg: "", color: "" });
});

router.get("/adminhome", authenticateAdmin, (req, res) => {
  res.render("admin/adminhome");
});

router.use(upload());

router.post("/admin/addproduct", authenticateAdmin, async (req, res) => {
  const file = req.files.file;
  const fileName = file.name;

  await file.mv(
    path.join(__dirname, "..", "public", "images", "products", fileName),
    (err) => {
      if (err) {
        res.sendStatus(500);
      }
    }
  );

  const title = req.body.title;
  const author = req.body.author;
  const category = req.body.category;
  const imgUrl = "../../images/products/" + fileName;
  const price = req.body.price;
  const totalQuantity = req.body.totalQuantity;
  const description = req.body.description;

  addproduct(
    title,
    author,
    category,
    imgUrl,
    price,
    totalQuantity,
    description
  );

  res.render("admin/adminhome", { msg: "product added successfully " });
});

router.get("/admin/listproducts", authenticateAdmin, async (req, res) => {
  const products = await listAllProducts();
  // console.log(products);
  res.render("admin/productslist", { products: products, msg: "", color: "" });
});

router.post("/admin/editproduct", authenticateAdmin, async (req, res) => {
  const id = req.body.product_id.trim();
  const product = await getSingleProduct(id);
  res.render("admin/editproduct", { product: product[0], msg: "", color: "" });
});

router.post("/admin/edit", authenticateAdmin, async (req, res) => {
  const product_id = req.body.id.trim();
  const product = await getSingleProduct(product_id);
  const products = await listAllProducts();
  try {
    const title = req.body.title.trim();
    const author = req.body.author.trim();
    const category = req.body.category.trim();
    const price = req.body.price.trim();
    const totalQuantity = req.body.totalQuantity.trim();
    const description = req.body.description.trim();

    if (req?.files == null) {
      const imgUrl = product[0].imageUrl.trim();
      editProduct(
        product_id,
        title,
        author,
        description,
        category,
        totalQuantity,
        price,
        imgUrl
      );

      res.render("admin/productsList", {
        msg: "product edited",
        color: "success",
        products: products,
      });
    } else if (req.files !== null) {
      const file = req.files.file;
      const fileName = file.name;

      const imgUrl = "../../images/products/" + fileName.trim();

      await file.mv(
        path.join(__dirname, "..", "public", "images", "products", fileName),
        (err) => {
          if (err) {
            res.sendStatus(500);
          }
        }
      );

      editProduct(
        product_id,
        title,
        author,
        description,
        category,
        totalQuantity,
        price,
        imgUrl
      );
      res.render("admin/productsList", {
        msg: "product edited",
        color: "success",
        products: products,
      });
    }
  } catch (error) {
    res.render("admin/editProduct", {
      msg: "product can not edited",
      color: "danger",
      product: product,
    });
  }
});

router.post("/admin/deleteproduct", authenticateAdmin, async (req, res) => {
  const id = req.body.product_id.trim();
  const products = await listAllProducts();
  try {
    deleteProduct(id);

    res.render("admin/productsList", {
      products: products,
      msg: "product deleted successfully",
      color: "success",
    });
  } catch (error) {
    res.render("admin/productsList", {
      products: products,
      msg: "product can not deleted! ",
      color: "danger",
    });
  }
});

router.get("/admin/listorders", authenticateAdmin, async (req, res) => {
  const orders = await listAllOrders();
  res.render("admin/ordersList", { orders });
});

router.get("/adminlogout", authenticateAdmin, (req, res) => {
  res.cookie("adminjwt", "", { maxAge: 1 });
  res.redirect("/admin");
});

module.exports = router;
