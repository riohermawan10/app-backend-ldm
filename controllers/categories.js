const Categories = require("../models/categories");
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

exports.fetch = async (req, res) => {
  /*
    #swagger.tags = ["Categories"]
    
    #swagger.summary = "Get all categories"

    #swagger.security = [{
      "Token": []
    }]
    
  */
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page-1, size);
  try {
      const category = await Categories.findAll({ where: {}, limit: limit, offset: offset });
      const allCategory = await Categories.findAll();

      let result = [];
      for (let i = 0; i < category.length; i++) {
        
        const findChildCategory = await category[i].collectionFindAll('items');
        const childCategory = findChildCategory.map(item => {
          const parentId = item.parentPath.split('/')[1];
          return {
            id: item.getId(),
            name: item.name,
            label: item.label,
            icon: item.icon,
            description: item.description,
            parent_id: parentId,
          }
        });

        result.push({
          id: category[i].getId(),
          name: category[i].name,
          icon: category[i].icon,
          label: category[i].label,
          description: category[i].description,
          items: childCategory,
        });
        
      }

      let data = {
        count: allCategory.length,
        rows: result
      }

      const responses = getPagingData(data, page-1, limit);

      /* 
        #swagger.responses[200] = {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  resCode: {
                    type: "string",
                    example: "200"
                  },
                  resDesc: {
                    type: "string",
                    example: "Fetch All success!"
                  },
                  values: {
                    type: "object",
                    properties: {
                      totalItems: { type: "number", example: "10" },
                      rows: { 
                        type: "array",
                        items : {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            icon: { type: "string" },
                            label: { type: "string" },
                            description: { type: "string" },
                            items: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "string" },
                                  name: { type: "string" },
                                  label: { type: "string" },
                                  description: { type: "string" },
                                  parent_id: { type: "string" },
                                }
                              }
                            }
                          }
                        }
                      },
                      totalPages: { type: "number", example: "1" },
                      currentPage: { type: "number", example: "1" },
                    }
                  }
                }
              },
            }
          },
        }

        #swagger.responses[400] = {
          description: 'Bad Request.',
          schema: {
            resCode: "400",
            resDesc: "Bad Request!"
          }
        }

      */

      return res.status(200).json(response.ok(responses, message.fetch));
  } catch (err) {
      return res.status(400).json(err.message);
  }

}

exports.findById = async (req, res) => {

  /*
    #swagger.tags = ["Categories"]
    
    #swagger.summary = "Get category by id"

    #swagger.security = [{
      "Token": []
    }]
    
  */

  const id = req.params.id;
  try {
      const category = await Categories.findOne({
          id: id,
      });

      /*
        #swagger.responses[404] = {
          description: 'Category Not found.',
          schema: {
              resCode: "404",
              resDesc: "Category Id Not Found!"
            }
        }
      */

      if(!category){
        return res.status(404).json(response.nodeFound(`Category Not Found!`));
      }

      const childCategory = await category.collectionFindAll('items');
      // let items = [];

      const items = childCategory.map(item => {
        return {
          id: item.getId(),
          name: item.name,
          label: item.label,
          icon: item.icon,
          description: item.description,
          parent_id: id,
        }
      });

      let data =  {
        id: category.getId(),
        name: category.name,
        label: category.label,
        description: category.description,
        items: items,
      };

      /*
        #swagger.parameters['id'] = {
          in: 'path',
          required: true,
          description: 'Category id',
        }

        #swagger.responses[200] = {
          description: 'Successful operation.',
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  resCode: {
                    type: "string",
                    example: "200"
                  },
                  resDesc: {
                    type: "string",
                    example: "Inquiry success!"
                  },
                  values: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      label: { type: "string" },
                      description: { type: "string" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            label: { type: "string" },
                            description: { type: "string" },
                          }
                        }
                      }
                    }
                  }
                }
              },
            }
          },
        }

        #swagger.responses[400] = {
          description: 'Bad Request.',
          schema: {
            resCode: "400",
            resDesc: "Bad Request!"
          }
        }

      */
      return res.status(200).json(response.ok(data, message.inquiry));
      // res.status(200).json(findUser);

  } catch (err) {
      return res.status(400).json(response.bad(err.message));
  }
}

exports.add = async (req, res) => {

   /*
    #swagger.tags = ["Categories"]
    
    #swagger.summary = "Add new category"

    #swagger.security = [{
      "Token": []
    }]
    
  */

  try {
      const { name, label, icon, description, parent_id } = req.body;

      const findCategory = await Categories.findOne({
        where: {
          name: name
        }
      });

      if (findCategory) {
        return res.status(400).json(response.bad(`Category with name ${findCategory.name} is exists!`));
      }

      if (parent_id === '' || parent_id === null) {
        
        const data = await Categories.create({
          name: name,
          label: label,
          icon: icon,
          description: description,
        });

        let result = {
          id: data.getId(),
          name: data.name,
          icon: data.icon,
          label: data.label,
          description: data.description          
        }

        return res.status(201).json(response.create(result, message.create));

      }
      
      const category = await Categories.findOne({
        id: parent_id
      });

      const findChildCategory = await category.collectionFindOne('items',{
        where: {
          name: name
        }
      });

      if (findChildCategory) {
        return res.status(400).json(response.bad(`Category with name ${findChildCategory.name} is exists!`));
      }

      const categoryChild = await category.collectionCreate('items', {
        name: name,
        label: label,
        icon: icon,
        description: description,
      });

      let result = {
        id: categoryChild.getId(),
        name: categoryChild.name,
        icon: categoryChild.icon,
        label: categoryChild.label,
        description: categoryChild.description
      }

      /*
        #swagger.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/Categories" },
              examples: { 
                Categories: { $ref: "#/components/examples/Categories" }
              }
            }
          }
        }

        #swagger.responses[201] = {
          description: 'Successful operation.',
          schema: {
            resCode: "201",
            resDesc: "Create success!",
            values: {
              id: "v2d3KUJPdTcnOzBcFo52",
              name: 'SW0892',
              label: 'sw0892',
              icon: 'sw',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat',
            }
          }
        }

        #swagger.responses[400] = {
          description: 'Bad Request.',
          schema: {
            resCode: "400",
            resDesc: "Bad Request!"
          }
        }

      */

      return res.status(201).json(response.create(result, message.create));
      
      // res.status(201).json(child);
  } catch (err) {
      return res.status(400).json(err.message);
      // console.log(err);
  }
}

exports.update = async (req, res) => {

  /*
    #swagger.tags = ["Categories"]
    
    #swagger.summary = "Update category by id"

    #swagger.security = [{
      "Token": []
    }]

  */

  try {
    
    const id = req.params.id;
    const { name, label, icon, description, parent_id } = req.body;

    const findCategory = await Categories.findOne({
      id: id
    });

    if (parent_id) {

      const allCategory = await Categories.findAll({});
      let findChild = {};
      for (let i = 0; i < allCategory.length; i++) {

        const childCategory = await allCategory[i].collectionFindOne('items', {
          id: id
        });

        if (childCategory) {
          findChild = childCategory;
        }
        
      }

      if (Object.keys(findChild).length === 0) {
        return res.status(404).json(response.nodeFound(`Category Not Found!`)) 
      } 
      
      await findChild.update({
        name: name,
        label: label,
        icon: icon,
        description: description
      });

      const parentId = findChild.parentPath.split('/')[1];
      const category = await Categories.findOne({
        id: parentId
      });

      const findChildCategory = await category.collectionFindOne('items', {
        id: id
      });

      let result = {
        id: findChildCategory.getId(),
        name: findChildCategory.name,
        icon: findChildCategory.icon,
        label: findChildCategory.label,
        description: findChildCategory.description
      };

      return res.status(201).json(response.create(result, 'Category ' + message.update));

    } 



    findCategory.name = name ? name : findCategory.name;
    findCategory.label = label ? label : findCategory.label;
    findCategory.icon = icon ? icon : findCategory.icon;
    findCategory.description = description ? description : findCategory.description;

    await findCategory.save();

    const getCategory = await Categories.findOne({
      id: id
    });

    let data = {
      id: getCategory.getId(),
      name: getCategory.name,
      icon: getCategory.icon,
      label: getCategory.label,
      description: getCategory.description
    } 

    /* 
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Category id',
      }

      #swagger.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/Categories" },
              examples: { 
                Categories: { $ref: "#/components/examples/Categories" }
              }
            }
          }
        }

      #swagger.responses[201] = {
        description: 'Successful operation.',
        schema: {
          resCode: "201",
          resDesc: "Update success!",
          values: {
            id: "v2d3KUJPdTcnOzBcFo52",
            name: 'SW0892',
            label: 'sw0892',
            icon: 'sw',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat',
          }
        }
      }

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Category Not Found!"
        }
      }

      #swagger.responses[400] = {
        description: 'Bad Request.',
        schema: {
          resCode: "400",
          resDesc: "Bad Request!"
        }
      }

    */

    return res.status(201).json(response.create(data, 'Category ' + message.update));

  } catch (err) {
    // console.log(err);
    return res.status(400).json(response.bad(err.message));
    

  }

}


exports.delete = async (req, res) => {

   /*
    #swagger.tags = ["Categories"]
    
    #swagger.summary = "Delete category"

    #swagger.security = [{
      "Token": []
    }]
    
    #swagger.parameters['id'] = {
      in: 'path',
        required: true,
        description: 'Category id',
      }

  */

  try {
    
    const id = req.params.id;

    const findCategory = await Categories.findOne({
      id: id
    });

    if (!findCategory) {

      const allCategory = await Categories.findAll({});
      let findChild = {};
      for (let i = 0; i < allCategory.length; i++) {

        const childCategory = await allCategory[i].collectionFindOne('items', {
          id: id
        });

        if (childCategory) {
          findChild = childCategory;
        }
        
      }

      if (Object.keys(findChild).length === 0) {
        return res.status(404).json(response.nodeFound(`Category Not Found!`)) 
      } 
      
      const deleteChildCategory = await findChild.destroy();
  
      if (deleteChildCategory) {
        return res.status(200).json(response.okDelete(`Category ${findChild.name} Success Deleted!`));
      }

    }

    const deleteCategory = await findCategory.destroy();

    if (deleteCategory) {
      return res.status(200).json(response.okDelete(`category ${findCategory.name} Success Deleted!`));
    }

    /*
        #swagger.responses[404] = {
          description: 'Category Not found.',
          schema: {
              resCode: "404",
              resDesc: "Category Id Not Found!"
            }
        }

        #swagger.responses[400] = {
          description: 'Bad Request.',
          schema: {
            resCode: "400",
            resDesc: "Bad Request!"
          }
        }

        #swagger.responses[200] = {
          description: 'Successful operation.',
          schema: {
            resCode: "200",
            resDesc: "Category success deleted !"
          }
        }

      */


  } catch (err) {
    return res.status(400).json(err.message);
  }

}

exports.parent = async (req, res) => {


  /*
    #swagger.tags = ["Categories"]
    #swagger.summary = "Get parent category"
    #swagger.security = [{
      "Token": []
    }]
  */

  try {
    
    const findCategory = await Categories.findAll({});
    
    let data = findCategory.map(category => {
      return {
        id: category.getId(),
        name: category.name,
        icon: category.icon,
        label: category.label,
        description: category.description
      }
    });

    /*
      #swagger.responses[200] = {
        description: 'Successful operation.',
        schema: {
          resCode: "200",
          resDesc: "Fetch All Success!",
          values: [ 
            {
              id: "d2eTFSWhMg0zjKCLxrcU",
              name: 'Kabel',
              label: 'kabel',
              icon: 'kbl',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'
            }
          ]
        }
      }
    */

    return res.status(200).json(response.ok(data, message.fetch));
    

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
  }
}