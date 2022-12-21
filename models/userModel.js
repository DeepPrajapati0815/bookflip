const connection = require("../models/db");
connection;

const addUser = (firstname, lastname, email, mobile, address, password) => {
  connection.query(
    `insert into userreg (user_id,fname,lname,email,phone,address,password)  values (uuid(),'${firstname}','${lastname}','${email}','${mobile}','${address}','${password}');`,
    (err) => {
      if (err) throw err;
      console.log("User registered Successfully");
    }
  );
};

const addToken = (token, email) => {
  connection.query(
    `update userreg set token = "${token}" where email = "${email}"`,
    (err) => {
      if (err) throw err;
      console.log("token update Successfully");
    }
  );
};

const checkToken = (token) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `select * from userreg where token = "${token}";`,
      function (err, rows) {
        console.log(rows);
        if (rows === undefined) {
          reject(new Error("Error rows is undefined"));
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const updatePassword = (email, password) => {
  connection.query(
    `update userreg set password = "${password}" where email = "${email}"`,
    (err) => {
      if (err) throw err;
      console.log("password update Successfully");
    }
  );
};

const checkUser = (email) => {
  return new Promise(function (resolve, reject) {
    console.log(
      `select user_id,fname,lname,email,phone,address,password from userreg where email = '${email}';`
    );
    connection.query(
      `select user_id,fname,lname,email,phone,address,password from userreg where email = '${email}';`,
      function (err, rows) {
        console.log(rows);
        if (rows === undefined) {
          reject(new Error("Error rows is undefined"));
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getProducts = () => {
  return new Promise(function (resolve, reject) {
    connection.query(`select * from products;`, function (err, rows) {
      if (rows === undefined) {
        reject(new Error("Error rows is undefined"));
      } else {
        resolve(rows);
      }
    });
  });
};

const getProductsByCategory = (category) => {
  return new Promise(function (resolve, reject) {
    connection.query(
      `select * from products where categories = "${category}";`,
      function (err, rows) {
        if (rows === undefined) {
          reject(new Error("Error rows is undefined"));
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getSingleProduct = (product_id) => {
  return new Promise(function (resolve, reject) {
    connection.query(
      `select * from products where product_id = "${product_id}";`,
      function (err, rows) {
        if (rows === undefined) {
          reject(new Error("Error rows is undefined"));
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const addToCart = (user_id, product_id, quantity) => {
  connection.query(
    `insert into cart (cart_id,user_id,product_id,quantity) values (uuid(),"${user_id}","${product_id}","${quantity}")`,
    (err) => {
      if (err) throw err;
      console.log("User registered Successfully");
    }
  );
};

const checkCart = (user_id, product_id) => {
  return new Promise(function (resolve, reject) {
    connection.query(
      `select * from cart where product_id = "${product_id}" and user_id = "${user_id}";`,
      function (err, rows) {
        if (rows === undefined) {
          reject(new Error("Error rows is undefined"));
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const updateCart = (user_id, product_id, quantity) => {
  connection.query(
    `update cart set quantity =  quantity + ${quantity} where product_id = "${product_id} and user_id = "${user_id}"";`,
    (err) => {
      if (err) throw err;
      console.log("User registered Successfully");
    }
  );
};

const getCartItems = (user_id) => {
  return new Promise(function (resolve, reject) {
    connection.query(
      `select cart_id,cart.product_id,quantity,title,author,description,categories,total_quantity,rating,price,imageUrl from cart,products where  cart.product_id = products.product_id and user_id ="${user_id}" `,
      function (err, rows) {
        if (rows === undefined) {
          reject(new Error("Error rows is undefined"));
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const removeCartItem = (user_id, product_id) => {
  console.log(
    `delete from cart where product_id = "${product_id}" and user_id = "${user_id}"`
  );
  connection.query(
    `delete from cart where product_id = "${product_id}" and user_id = "${user_id}";`,
    (error, results) => {
      if (error) return console.error(error.message);

      console.log("Deleted Row(s):", results.affectedRows);
    }
  );
};

const createCODOrder = (order_no, user_id, products, quantity, total) => {
  connection.query(
    `
    insert into orders (order_id,order_no,user_id,product_id,quantity,total,payment_mode) 
    values (uuid(),'${order_no}','${user_id}','${products}','${quantity}','${total}',"COD")`,
    (err) => {
      if (err) throw err;
      console.log("order created Successfully");
    }
  );
};

const createOnlineOrder = (
  order_no,
  user_id,
  products,
  quantity,
  total,
  payment_id,
  razorpay_order_id,
  razorpay_signature
) => {
  connection.query(
    `
    insert into orders (order_id,order_no,user_id,product_id,quantity,total,payment_id,razorpay_order_id,razorpay_signature,payment_mode) 
    values (uuid(),'${order_no}','${user_id}','${products}','${quantity}','${total}',"${payment_id}",
    "${razorpay_order_id}",
    "${razorpay_signature}",
    "online")`,
    (err) => {
      if (err) throw err;
      console.log("order online created Successfully");
    }
  );
};

const emptyCart = (user_id) => {
  connection.query(`delete from cart where user_id = "${user_id}"`, (err) => {
    if (err) throw err;
    console.log("order created Successfully");
  });
};

const fetchOrders = (user_id) => {
  return new Promise(function (resolve, reject) {
    connection.query(
      `select order_no,fname,lname,phone,address,product_id,quantity,total,orders.createdAt from orders,userreg where orders.user_id = userreg.user_id and orders.user_id = "${user_id}";`,
      function (err, rows) {
        if (rows === undefined) {
          reject(new Error("Error rows is undefined"));
        } else {
          resolve(rows);
        }
      }
    );
  });
};

module.exports = {
  addUser,
  checkUser,
  getProducts,
  getProductsByCategory,
  getSingleProduct,
  addToCart,
  createOnlineOrder,
  checkCart,
  updateCart,
  getCartItems,
  removeCartItem,
  createCODOrder,
  addToken,
  emptyCart,
  checkToken,
  updatePassword,
  fetchOrders,
};
