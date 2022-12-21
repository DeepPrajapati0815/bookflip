const connection = require("../models/db");
connection;

const checkAdmin = (email) => {
  return new Promise(function (resolve, reject) {
    connection.query(
      `select * from adminreg where email = '${email}';`,
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

const addAdmin = (email, password) => {
  connection.query(
    `insert into adminreg (id,email,password)  values (uuid(),'${email}','${password}');`,
    (err) => {
      if (err) throw err;
      console.log("User registered Successfully");
    }
  );
};

const addproduct = async (
  title,
  author,
  category,
  imgUrl,
  price,
  totalQuantity,
  description
) => {
  connection.query(
    `insert into products (product_id,title,author,description,categories,total_quantity,rating,price,imageUrl)
    values (uuid(),"${title}","${author}","${description}","${category}",${totalQuantity},${Math.round(
      Math.random(5) * 10
    )},${price},"${imgUrl}");`,
    (err) => {
      if (err) throw err;
      console.log("User registered Successfully");
    }
  );
};

const listAllProducts = () => {
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

const editProduct = (
  id,
  title,
  author,
  description,
  category,
  totalQuantity,
  price,
  imageUrl
) => {
  return new Promise(function (resolve, reject) {
    connection.query(
      `update products set title = "${title}",author="${author}",description="${description}"
    ,categories="${category}",total_quantity=${totalQuantity},price=${price},imageUrl="${imageUrl}" 
    where product_id = "${id}";`,
      function (err, rows) {
        if (rows === undefined) {
          reject(new Error("Error rows is undefined"));
        } else {
          console.log("product edited");
          resolve(rows);
        }
      }
    );
  });
};

const deleteProduct = (id) => {
  return new Promise(function (resolve, reject) {
    connection.query(
      `delete from products where product_id = "${id}";`,
      function (err, rows) {
        if (rows === undefined) {
          reject(new Error("Error rows is undefined"));
        } else {
          console.log("product deleted");
          resolve(rows);
        }
      }
    );
  });
};

const listAllOrders = () => {
  return new Promise(function (resolve, reject) {
    connection.query(
      `select order_no,fname,lname,phone,address,product_id,quantity,total,orders.createdAt from orders,userreg where orders.user_id = userreg.user_id
    ;`,
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
  checkAdmin,
  addproduct,
  listAllProducts,
  editProduct,
  deleteProduct,
  addAdmin,
  listAllOrders,
};
