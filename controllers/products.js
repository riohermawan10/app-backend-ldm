const saltMd5 = require('salted-md5');
const path = require('path');
const db = require('../db/connection');
const Products = require("../models/products");
const Category = require("../models/categories");
const User = require("../models/user");
const response = require('../utils/response');
const message = require('../utils/responseMessage');


const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? ++page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, rows, totalPages, currentPage };
};

const getCategoryById = async (CategoriesModel, categoryId) => {
  const findCategory = await CategoriesModel.findOne({
    id: categoryId
  })

  if (!findCategory) {
    
    const allCategory = await CategoriesModel.findAll({});
      let findChild = {};
      for (let i = 0; i < allCategory.length; i++) {

        const childCategory = await allCategory[i].collectionFindOne('items', {
          id: categoryId
        });

        if (childCategory) {
          findChild = childCategory;
        }
        
      }

      if (Object.keys(findChild).length === 0) {
        return null;
      }

      let data = {
        categoryId: findChild.getId(),
        categoryName: findChild.name,
      }

      return data;

  }

  let data = {
    categoryId: findCategory.getId(),
    categoryName: findCategory.name,
  }

  return data;
};

const deleteFile = async (file) => {
  // let result = false;
  const bucket = db.storage().bucket();
  let pathName = "products/";
  await bucket.file(pathName + file).delete();
  
};

const uploadFile = async (file) => {
  const bucket = db.storage().bucket();
  const filename = saltMd5(file.originalname, 'salted@!') + path.extname(file.originalname);
  let pathName = "products/";
  const blob = bucket.file(pathName + filename);

  const blobWriter = await blob.createWriteStream({
    // public: true
  });

  blobWriter.on('error', (err) => {
      return res.status(400).json(err.message);
  });
  
  blobWriter.on('finish', () => {
    blob.makePublic();
    // return res.status(200).json(blob.publicUrl());
  });

  blobWriter.end(file.buffer);

  let thumbnail = decodeURIComponent(blob.publicUrl());
  let thumbnailPath = pathName + filename;

  return { thumbnail, thumbnailPath };

};

exports.fetch = async (req, res) => {

  /*
    #swagger.tags = ["Products"]
    #swagger.summary = "Fetch all products"
    #swagger.security = [{
      "Token": []
    }]
  */

  const { page, size } = req.query;
  const { limit, offset } = getPagination(page-1, size);
  try {
      const findProducts = await Products.findAll({ where: {}, limit: limit, offset: offset });
      const allProduct = await Products.findAll({});
      let result = [];

      for (let i = 0; i < findProducts.length; i++) {
        let category = await findProducts[i].collectionFindOne('categories');
        let user = await findProducts[i].collectionFindOne('users');
        result.push({
          id: findProducts[i].getId(),
          title: findProducts[i].title,
          description: findProducts[i].description,
          price: findProducts[i].price ? parseInt(findProducts[i].price) : 0,
          stock: findProducts[i].stock ? parseInt(findProducts[i].stock) : 0,
          weight: findProducts[i].weight ? parseInt(findProducts[i].weight) : 0,
          totalIn: findProducts[i].totalIn ? parseInt(findProducts[i].totalIn) : 0,
          totalOut: findProducts[i].totalOut ? parseInt(findProducts[i].totalOut) : 0,
          thumbnail: findProducts[i].thumbnail,
          thumbnailPath: findProducts[i].thumbnailPath,
          categories: {
            categoryId: category.categoryId,
            name: category.name,
          },
          users: {
            userId: user.userId,
            name: user.name,
          }
        });
      }

      let data = {
        count: allProduct.length,
        rows: result
      }
      const responses = getPagingData(data, page-1, limit);

      /*
        #swagger.responses[200] = {
          description: "Success Operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  resCode: { type: "integer", example: 200 },
                  resDesc: { type: "string", example: "Success Operation" },
                  values: {
                    type: "object",
                    properties: {
                      totalItems: { type: "integer", example: 1 },
                      rows: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            description: { type: "string" },
                            price: { type: "number" },
                            weight: { type: "number" },
                            stock: { type: "number" },
                            totalIn: { type: "number" },
                            totalOut: { type: "number" },
                            thumbnail: { type: "string" },
                            thumbnailPath: { type: "string" },
                            categories: {
                              type: "object",
                              properties: {
                                categoryId: { type: "string" },
                                name: { type: "string" },
                              }
                            },
                            users: {
                              type: "object",
                              properties: {
                                userId: { type: "string" },
                                name: { type: "string" },
                              }
                            },
                          }
                        }
                      },
                      totalPages: { type: "integer", example: 1 },
                      currentPage: { type: "integer", example: 1 },
                    }
                  }
                }
              }
            }
          }
        }

        #swagger.responses[400] = {
          description: "Bad Request",
          schema: {
            resCode: "400",
            resDesc: "Bad Request"
          }
        }

      */

      res.status(200).json(response.ok(responses, message.fetch));
      // res.status(200).json(result);
  } catch (err) {
      res.status(400).json(err.message);
  }

}

exports.add = async (req, res) => {

  /*
    #swagger.tags = ["Products"]
    #swagger.summary = "Add new products"
    #swagger.security = [{
      "Token": []
    }]
  */

  try {
      const { title, description, price, weight, stock, categories, users } = req.body;

      const findProduct = await Products.findOne({ where: { title: title } });
      if (findProduct) {
        return res.status(422).json(response.found("Product " + message.alreayExist));
      }

      const findCategory = await getCategoryById(Category, categories);

      const findUsers = await User.findOne({
        id: users,
      });

      if (!findCategory || !findUsers) {
        return res.status(404).json(response.nodeFound("Invalid Category or User"));
      }

      const { categoryId, categoryName } = findCategory;

      let category = {
        categoryId: categoryId,
        name: categoryName,
      };
      
      let user = {
        userId: findUsers.getId(),
        name: findUsers.nama,
      };

      const bucket = db.storage().bucket();
      const filename = saltMd5(req.file.originalname, 'salted@!') + path.extname(req.file.originalname);
      let pathName = "products/";
      const blob = bucket.file(pathName + filename);

      const blobWriter = await blob.createWriteStream({
        // public: true
      });

      blobWriter.on('error', (err) => {
          return res.status(400).json(err.message);
      });
      
      blobWriter.on('finish', () => {
        blob.makePublic();
        // return res.status(200).json(blob.publicUrl());
      });

      blobWriter.end(req.file.buffer);
      
      // blobWriter.on('finish', () => {
      let thumbnail = decodeURIComponent(blob.publicUrl());
      let thumbnailPath = pathName + filename;
      // })

      const saveProducts = await Products.create({
          title: title,
          description: description,
          price: price ? parseInt(price) : 0,
          weight: weight ? parseInt(weight) : 0,
          stock: stock ? parseInt(stock) : 0,
          thumbnail: thumbnail ? thumbnail : "",
          thumbnailPath: thumbnailPath ? thumbnailPath : "",
          totalIn: stock ? parseInt(stock) : 0,
          totalOut: 0,
          categories: category,
          users: user
      });

      if(saveProducts) {
        await saveProducts.collectionCreate('users', user);
        await saveProducts.collectionCreate('categories', category);
      }

      let result = {
        id: saveProducts.getId(),
        title: saveProducts.title,
        description: saveProducts.description,
        price: saveProducts.price,
        weight: saveProducts.weight,
        stock: saveProducts.stock,
        thumbnail: saveProducts.thumbnail,
        thumbnailPath: saveProducts.thumbnailPath,
        totalIn: saveProducts.totalIn,
        totalOut: saveProducts.totalOut,
        categories: {
          categoryId: categoryId,
          name: categoryName,
        },
        users: {
          userId: findUsers.getId(),
          name: findUsers.nama,
        },
      }

      /*
        #swagger.requestBody = {
          required: true,
          "content": {
            "multipart/form-data": {
              schema: { $ref: "#/definitions/Products" },
            }
          } 
        }

        #swagger.responses[201] = {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  resCode: { type: "integer", example: 200 },
                  resDesc: { type: "string", example: "Success Operation" },
                  values: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      price: { type: "number" },
                      weight: { type: "number" },
                      stock: { type: "number" },
                      totalIn: { type: "number" },
                      totalOut: { type: "number" },
                      thumbnail: { type: "string" },
                      thumbnailPath: { type: "string" },
                      categories: {
                        type: "object",
                        properties: {
                          categoryId: { type: "string" },
                          name: { type: "string" },
                        }
                      },
                      users: {
                        type: "object",
                        properties: {
                          userId: { type: "string" },
                          name: { type: "string" },
                        }
                      },
                    }
                  }
                }
              }
            }
          }
        }

        #swagger.responses[422] = {
          description: "Unprocessable Entity",
          schema: {
            resCode: "422",
            resDesc: "Product already exist",
          }
        }

        #swagger.responses[400] = {
          description: "Bad Request",
          schema: {
            resCode: "400",
            resDesc: "Bad Request",
          }
        }

        #swagger.responses[404] = {
          description: "Not Found",
          schema: {
            resCode: "404",
            resDesc: "Invalid Category or User",
          }
        }
        

      */

      return res.status(201).json(response.create(result, message.create));

      // return res.status(200).json(categoryId);
  } catch (err) {
      res.status(400).json(response.bad(err.message));
  }
}

exports.find = async (req, res) => {
  /*
    #swagger.tags = ["Products"]
    #swagger.summary = "Find products by id"
    #swagger.security = [{
      "Token": []
    }]
  */
  const id = req.params.id;
  try {

    const products = await Products.findOne({
      id: id,
    });

    if (!products) {
      return res.status(404).json(response.nodeFound("Product not found"));
    }

    const categories = await products.collectionFindOne('categories');
    const users = await products.collectionFindOne('users');

    let category = {
      categoryId: categories.categoryId,
      name: categories.name,
    };

    let user = {
      userId: users.userId,
      name: users.name,
    };

    let data = {
      id: products.getId(),
      title: products.title,
      description: products.description,
      price: parseInt(products.price),
      weight: parseInt(products.weight),
      stock: parseInt(products.stock),
      thumbnail: products.thumbnail,
      thumbnailPath: products.thumbnailPath,
      totalIn: parseInt(products.totalIn),
      totalOut: parseInt(products.totalOut),
      categories: category,
      users: user
    };

    /*

      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Product id',
      }

      #swagger.responses[200] = {
        description: "Successful operation",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                resCode: { type: "integer", example: 200 },
                resDesc: { type: "string", example: "Success Operation" },
                values: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    weight: { type: "number" },
                    stock: { type: "number" },
                    totalIn: { type: "number" },
                    totalOut: { type: "number" },
                    thumbnail: { type: "string" },
                    thumbnailPath: { type: "string" },
                    categories: {
                      type: "object",
                      properties: {
                        categoryId: { type: "string" },
                        name: { type: "string" },
                      }
                    },
                    users: {
                      type: "object",
                      properties: {
                        userId: { type: "string" },
                        name: { type: "string" },
                      }
                    },
                  }
                }
              }
            }
          }
        }
      }

      #swagger.responses[404] = {
        description: "Not Found",
        schema: {
          resCode: "404",
          resDesc: "Product not found",
        }
      }

      #swagger.responses[400] = {
        description: "Bad Request",
        schema: {
          resCode: "400",
          resDesc: "Bad Request",
        }
      }

    */

    return res.status(200).json(response.ok(data, message.fetch));

  } catch (err) {
    res.status(400).json(response.bad(err.message));
  }
}

exports.update = async (req, res) => {

  /*
    #swagger.tags = ["Products"]
    #swagger.summary = "Update products"
    #swagger.security = [{
      "Token": []
    }]
  */

  const id = req.params.id;
  const file = req.file;
  try {
    
    const { title, description, price, weight, stock, categories, users } = req.body;

    const findCategory = await getCategoryById(Category, categories);
    const findUsers = await User.findOne({
      id: users,
    });
    const findProduct = await Products.findOne({
      id: id,
    });

    if (!findCategory || !findUsers) {
      return res.status(404).json(response.nodeFound("Invalid Category or User"));
    }

    if (!findProduct) {
      return res.status(404).json(response.nodeFound("Invalid Product"));
    }

    const { categoryId, categoryName } = findCategory;

    let category = {
      categoryId: categoryId,
      name: categoryName,
    };
    
    let user = {
      userId: findUsers.getId(),
      name: findUsers.nama,
    };

    let stockResult = 0;
    if (stock === parseInt(findProduct.stock)) {
      stockResult = stock;
    } else if (stock > parseInt(findProduct.stock)) {
      const result = stock - parseInt(findProduct.stock);
      stockResult = parseInt(findProduct.totalIn) - result;
    } else {
      const result = parseInt(findProduct.stock) - stock;
      stockResult = parseInt(findProduct.totalIn) - result;
    }

    let image;
    let imagePath;

    if (file) {
      const imageFile = findProduct.thumbnailPath.split('/')[1];
      await deleteFile(imageFile);
      const { thumbnail, thumbnailPath } = await uploadFile(file);
      image = thumbnail;
      imagePath = thumbnailPath;
    }
    
    findProduct.title = title ? title : findProduct.title;
    findProduct.description = description ? description : findProduct.description;
    findProduct.price = price ? parseInt(price) : parseInt(findProduct.price);
    findProduct.weight = weight ? parseInt(weight) : parseInt(findProduct.weight);
    findProduct.stock = stock ? parseInt(stock) : parseInt(findProduct.stock);
    findProduct.totalIn = stockResult;
    findProduct.thumbnail = image ? image : findProduct.thumbnail;
    findProduct.thumbnailPath = imagePath ? imagePath : findProduct.thumbnailPath;
    findProduct.categories = category;
    findProduct.users = user;

    await findProduct.save();

    const getProduct = await Products.findOne({
      id: id
    });

    let data = {
      id: getProduct.getId(),
      title: getProduct.title,
      description: getProduct.description,
      price: parseInt(getProduct.price),
      weight: parseInt(getProduct.weight),
      stock: parseInt(getProduct.stock),
      thumbnail: getProduct.thumbnail,
      thumbnailPath: getProduct.thumbnailPath,
      totalIn: parseInt(getProduct.totalIn),
      totalOut: getProduct.totalOut ? parseInt(getProduct.totalOut) : 0,
      categories: category,
      users: user,
    };

    /*
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Product id',
      }
    
      #swagger.requestBody = {
        required: true,
        "content": {
          "multipart/form-data": {
            schema: {
              $ref: "#/definitions/Products"
            }
          }
        } 
      }

      #swagger.responses[201] = {
        description: "Successful operation",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                resCode: { type: "integer", example: 201 },
                resDesc: { type: "string", example: "Updated Success" },
                values: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    weight: { type: "number" },
                    stock: { type: "number" },
                    totalIn: { type: "number" },
                    totalOut: { type: "number" },
                    thumbnail: { type: "string" },
                    thumbnailPath: { type: "string" },
                    categories: {
                      type: "object",
                      properties: {
                        categoryId: { type: "string" },
                        name: { type: "string" },
                      }
                    },
                    users: {
                      type: "object",
                      properties: {
                        userId: { type: "string" },
                        name: { type: "string" },
                      }
                    },
                  }
                }
              }
            }
          }
        }
      }

      #swagger.responses[400] = {
        description: "Bad Request",
        schema: {
          resCode: "400",
          resDesc: "Bad Request",
        }
      }

      #swagger.responses[404] = {
        description: "Not Found",
        schema: {
          resCode: "404",
          resDesc: "Invalid Category or User",
        }
      }
        

      */

    return res.status(201).json(response.create(data, message.update));

  } catch (err) {
    res.status(400).json(err.message);
  }

}

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {

    /* 
      #swagger.tags = ["Products"]
      #swagger.summary = "Delete products"
      #swagger.security = [{
        "Token": []
      }]
    */

    const findProduct = await Products.findOne({
      id: id,
    });

    if (!findProduct) {
      return res.status(404).json(response.nodeFound("Invalid Product"));
    }

    const imageFile = findProduct.thumbnailPath.split('/')[1];
    await deleteFile(imageFile);

    const deleteProduct = await findProduct.destroy();
    if (deleteProduct) {
      return res.status(200).json(response.okDelete(`Product ${findProduct.title} Success Deleted!`));
    }

    /* 
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Product id',
      }

      #swagger.responses[400] = {
          description: "Bad Request",
          schema: {
            resCode: "400",
            resDesc: "Bad Request",
          }
        }

        #swagger.responses[404] = {
          description: "Not Found",
          schema: {
            resCode: "404",
            resDesc: "Invalid Product",
          }
        }

        #swagger.responses[200] = {
          description: 'Successful operation.',
          schema: {
            resCode: "200",
            resDesc: "Product success deleted!"
          }
        }
    */

  } catch (err) {
    res.status(400).json(err.message);
  }
}