const saltMd5 = require('salted-md5');
const path = require('path');
const Jobs = require('../models/jobs');
const User = require('../models/user');
const Products = require('../models/products');
const db = require('../db/connection');
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

  const resultData = rows.map(item => {
    const progress = progressFunction(item);
    return {
      id: item.id,
      deskripsi: item.deskripsi,
      alamat: item.alamat,
      pic_gedung: item.pic_gedung,
      no_telpon_pic: item.no_telpon_pic,
      catatan: item.catatan,
      detail: item.detail,
      status_teknisi: item.status_teknisi,
      status_supervisor: item.status_supervisor,
      tanggal_pemasangan: item.tanggal_pemasangan,
      image: item.image,
      progress: progress,
      user: item.user,
      product: item.product,
      status_job: item.status_job,
    }
  });

  return { totalItems, rows: resultData, totalPages, currentPage };
};

const progressFunction = (data) => {

  let progress = 5;
  if (data.user.length) {
    progress += 5;
  }

  if(data.product.length) {
    progress += 5;
  }

  if(data.image.length) {
    progress += 15;
  }

  if (data.status_teknisi === 'Pending') {
    progress += 5;
  } else if (data.status_teknisi === 'Progress') {
    progress += 20;
  } else if (data.status_teknisi === 'Done') {
    progress += 30;
  }

  if (data.status_supervisor === 'Pending') {
    progress += 5;
  } else if (data.status_supervisor === 'Progress') {
    progress += 20;
  } else if (data.status_supervisor === 'Done') {
    progress += 30;
  } 

  if(data.status_job === true) {
    progress += 10;
  }

  return progress;
  
};

const uploadFile = async (file) => {
  const bucket = db.storage().bucket();
  const filename = saltMd5(file.originalname, 'salted@!') + path.extname(file.originalname);
  let pathName = "jobs/";
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

const deleteFile = async (file) => {
  // let result = false;
  const bucket = db.storage().bucket();
  let pathName = "jobs/";
  await bucket.file(pathName + file).delete();
  
};

exports.fetch = async (req, res) => {
  /*
    #swagger.tags = ["Jobs"]
    
    #swagger.summary = "Get all Jobs"

    #swagger.security = [{
      "Token": []
    }]
    
  */
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page-1, size);
  try {
      const findJob = await Jobs.findAll({ where: {}, limit: limit, offset: offset});
      const allJob = await Jobs.findAll({});
      
      let result = [];
      for (let i = 0; i < findJob.length; i++) {
        
        const findImage = await findJob[i].collectionFindAll('image');
        const image = findImage.map(item => {
          return {
            keterangan: item.keterangan,
            thumbnail: item.thumbnail,
            thumbnailPath: item.thumbnailPath,
          };
        });

        const findProduct = await findJob[i].collectionFindAll('product');
        const product = findProduct.map(item => {
          return {
            id: item.productId,
            name: item.name,
            jumlah: item.jumlah,
            keterangan: item.keterangan,
            lokasi_pemasangan: item.lokasi_pemasangan,
          };
        });

        const findUser = await findJob[i].collectionFindAll('user');
        const user = findUser.map(item => {
          return {
            id: item.userId,
            name: item.name,
            email: item.email,
            nomor_telepon: item.nomor_telepon,
          };
        });

        result.push({
          id: findJob[i].getId(),
          deskripsi: findJob[i].deskripsi,
          detail: findJob[i].detail,
          catatan: findJob[i].catatan,
          alamat: findJob[i].alamat,
          no_telpon_pic: findJob[i].no_telpon_pic,
          pic_gedung: findJob[i].pic_gedung,
          tanggal_pemasangan: findJob[i].tanggal_pemasangan,
          status_teknisi: findJob[i].status_teknisi,
          status_supervisor: findJob[i].status_supervisor,
          image: image,
          product: product,
          user: user,
          status_job: findJob[i].status_job,
        });
        
      }

      let data = {
        count: allJob.length,
        rows: result
      }

      const responses = getPagingData(data, page-1, limit);

      /* 
        #swagger.responses[200] = {
            description: 'Successful operation.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    resCode: { type: 'number', example: 200 },
                    resDesc: { type: 'string', example: 'Fetch All Success' },
                    values: {
                      type: 'object',
                      properties: {
                        totalItems: { type: 'number', example: 1 },
                        rows: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              deskripsi: { type: 'string' },
                              detail: { type: 'string' },
                              catatan: { type: 'string' },
                              alamat: { type: 'string' },
                              no_telpon_pic: { type: 'string' },
                              pic_gedung: { type: 'string' },
                              tanggal_pemasangan: { type: 'string' },
                              status_teknisi: { type: 'string' },
                              status_supervisor: { type: 'string' },
                              image: {
                                type: 'object',
                                properties: {
                                  keterangan: { type: 'string' },
                                  thumbnail: { type: 'string' },
                                  thumbnailPath: { type: 'string' },
                                }
                              },
                              progress: { type: 'number' },
                              user: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    nomor_telepon: { type: 'string' },
                                  }
                                }
                              },
                              product: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    jumlah: { type: 'string' },
                                    keterangan: { type: 'string' },
                                    lokasi_pemasangan: { type: 'string' },
                                  }
                                }
                              },
                              status_job: { type: 'boolean' },
                            }
                          }
                        },
                        totalPages: { type: 'number', example: 1 },
                        currentPage: { type: 'number', example: 1 },
                      }
                    }
                  }
                }
              }
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

      return res.status(200).json(response.ok(responses, message.fetch));
  } catch (err) {
      return res.status(400).json(err.message);
  }

}

exports.find = async (req, res) => {
  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Find Jobs by id"
    #swagger.security = [{
      "Token": []
    }]
  */
  const id = req.params.id;
  try {

    const job = await Jobs.findOne({
      id: id
    });

    if(!job) {
      return res.status(404).json(response.nodeFound(message.notFound));
    }

    const findImage = await job.collectionFindAll('image');
    const image = findImage.map(item => {
      return {
        keterangan: item.keterangan,
        thumbnail: item.thumbnail,
        thumbnailPath: item.thumbnailPath,
      };
    });

    const findProduct = await job.collectionFindAll('product');
    const product = findProduct.map(item => {
      return {
        id: item.productId,
        name: item.name,
        jumlah: item.jumlah,
        keterangan: item.keterangan,
        lokasi_pemasangan: item.lokasi_pemasangan,
      };
    });

    const findUser = await job.collectionFindAll('user');
    const user = findUser.map(item => {
      return {
        id: item.userId,
        name: item.name,
        email: item.email,
        nomor_telepon: item.nomor_telepon,
      };
    });

    const result = {
      id: job.getId(),
      deskripsi: job.deskripsi,
      detail: job.detail,
      catatan: job.catatan,
      alamat: job.alamat,
      no_telpon_pic: job.no_telpon_pic,
      pic_gedung: job.pic_gedung,
      tanggal_pemasangan: job.tanggal_pemasangan,
      status_teknisi: job.status_teknisi,
      status_supervisor: job.status_supervisor,
      image: image,
      product: product,
      user: user,
      status_job: job.status_job,
    }

    /*
      #swagger.parameters[id] = {
        in: 'path',
        description: "Jobs id",
        required: true,
      }

      #swagger.responses[200] = {
        description: 'Successful operation.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                resCode: { type: 'number', example: 200 },
                resDesc: { type: 'string', example: 'Fetch All Success' },
                values: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deskripsi: { type: 'string' },
                    detail: { type: 'string' },
                    catatan: { type: 'string' },
                    alamat: { type: 'string' },
                    no_telpon_pic: { type: 'string' },
                    pic_gedung: { type: 'string' },
                    tanggal_pemasangan: { type: 'string' },
                    status_teknisi: { type: 'string' },
                    status_supervisor: { type: 'string' },
                    image: {
                      type: 'object',
                      properties: {
                        keterangan: { type: 'string' },
                        thumbnail: { type: 'string' },
                        thumbnailPath: { type: 'string' },
                      }
                    },
                    progress: { type: 'number' },
                    user: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' },
                          nomor_telepon: { type: 'string' },
                        }
                      }
                    },
                    product: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          jumlah: { type: 'string' },
                          keterangan: { type: 'string' },
                          lokasi_pemasangan: { type: 'string' },
                        }
                      }
                    },
                    status_job: { type: 'boolean' },
                  }
                }
              }
            }
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

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Inquiry Not Found!"
        }
      }

    */

    return res.status(200).json(response.ok(result, message.inquiry));

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
  }
}

exports.add = async (req, res) => {

  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Add Jobs"
    #swagger.security = [{
      "Token": []
    }]
  */

  try {
    
    const { deskripsi, alamat, pic_gedung, no_telpon_pic, catatan, detail, tanggal_pemasangan, status_teknisi, status_supervisor } = req.body;

    const findJob = await Jobs.findOne({
      where: { deskripsi: deskripsi }
    });

    if(findJob) {
      return res.status(422).json(response.found(`Jobs ${message.alreadyExists}`));
    }

    const job = await Jobs.create({
      deskripsi: deskripsi,
      alamat: alamat,
      pic_gedung: pic_gedung,
      no_telpon_pic: no_telpon_pic,
      catatan: catatan,
      detail: detail,
      tanggal_pemasangan: tanggal_pemasangan,
      status_teknisi: status_teknisi,
      status_supervisor: status_supervisor,
      status_job: false,
    });

    let result = {
      id: job.getId(),
      deskripsi: job.deskripsi,
      detail: job.detail,
      catatan: job.catatan,
      alamat: job.alamat,
      no_telpon_pic: job.no_telpon_pic,
      pic_gedung: job.pic_gedung,
      tanggal_pemasangan: job.tanggal_pemasangan,
      status_teknisi: job.status_teknisi,
      status_supervisor: job.status_supervisor,
    };

    /*
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/definitions/Jobs" },
            examples: {
              Jobs: { $ref: "#/components/examples/Jobs" }
            }
          }
        }
      }

      #swagger.responses[201] = {
        description: 'Successful operation.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                resCode: { type: 'number', example: 201 },
                resDesc: { type: 'string', example: 'Created Success' },
                values: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deskripsi: { type: 'string' },
                    detail: { type: 'string' },
                    catatan: { type: 'string' },
                    alamat: { type: 'string' },
                    no_telpon_pic: { type: 'string' },
                    pic_gedung: { type: 'string' },
                    tanggal_pemasangan: { type: 'string' },
                    status_teknisi: { type: 'string' },
                    status_supervisor: { type: 'string' },
                    status_job: { type: 'boolean' },
                  }
                }
              }
            }
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

      #swagger.responses[422] = {
        description: 'Unprocessable Entity.',
        schema: {
          resCode: "422",
          resDesc: "Jobs already exists!"
        }
      }

    */

    return res.status(201).json(response.create(result, message.create));

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
  }
}

exports.update = async (req, res) => {

  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Update Jobs"
    #swagger.security = [{
      "Token": []
    }]
  */

  const id = req.params.id;
  try {

    const { deskripsi, alamat, pic_gedung, no_telpon_pic, catatan, detail, tanggal_pemasangan, status_teknisi, status_supervisor } = req.body;

    const job = await Jobs.findOne({
      id: id
    });

    if(!job) {
      return res.status(404).json(response.nodeFound(`Jobs ${message.notFound}`));
    }

    job.deskripsi = deskripsi ? deskripsi : job.deskripsi;
    job.alamat = alamat ? alamat : job.alamat;
    job.pic_gedung = pic_gedung ? pic_gedung : job.pic_gedung;
    job.no_telpon_pic = no_telpon_pic ? no_telpon_pic : job.no_telpon_pic;
    job.catatan = catatan ? catatan : job.catatan;
    job.detail = detail ? detail : job.detail;
    job.tanggal_pemasangan = tanggal_pemasangan ? tanggal_pemasangan : job.tanggal_pemasangan;
    job.status_teknisi = status_teknisi ? status_teknisi : job.status_teknisi;
    job.status_supervisor = status_supervisor ? status_supervisor : job.status_supervisor;

    await job.save();

    const findJob = await Jobs.findOne({
      id: id
    });

    let result = {
      id: findJob.getId(),
      deskripsi: findJob.deskripsi,
      detail: findJob.detail,
      catatan: findJob.catatan,
      alamat: findJob.alamat,
      no_telpon_pic: findJob.no_telpon_pic,
      pic_gedung: findJob.pic_gedung,
      tanggal_pemasangan: findJob.tanggal_pemasangan,
      status_teknisi: findJob.status_teknisi,
      status_supervisor: findJob.status_supervisor,
      status_job: findJob.status_job,
    };

    return res.status(201).json(response.create(result, message.update));

    /*
      #swagger.parameters[id] = {
        in: 'path',
        description: "Jobs id",
        required: true,
      }

      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/definitions/Jobs" },
            examples: {
              Jobs: { $ref: "#/components/examples/Jobs" }
            }
          }
        }
      }

      #swagger.responses[201] = {
        description: 'Successful operation.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                resCode: { type: 'number', example: 201 },
                resDesc: { type: 'string', example: 'Updated Success' },
                values: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deskripsi: { type: 'string' },
                    detail: { type: 'string' },
                    catatan: { type: 'string' },
                    alamat: { type: 'string' },
                    no_telpon_pic: { type: 'string' },
                    pic_gedung: { type: 'string' },
                    tanggal_pemasangan: { type: 'string' },
                    status_teknisi: { type: 'string' },
                    status_supervisor: { type: 'string' },
                  }
                }
              }
            }
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

      #swagger.responses[422] = {
        description: 'Unprocessable Entity.',
        schema: {
          resCode: "422",
          resDesc: "Jobs already exists!"
        }
      }

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Jobs not found!"
        }
      }

    */

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
  }
}

exports.delete = async (req, res) => {

  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Delete Jobs"
    #swagger.security = [{
      "Token": []
    }]
  */

  const id = req.params.id;
  try {

    const job = await Jobs.findOne({
      id: id
    });

    if(!job) {
      return res.status(404).json(response.nodeFound(`Jobs ${message.notFound}`));
    }

    const findImage = await job.collectionFindAll('image');

    if (findImage.length > 0) {
      const imageFile = findImage[0].thumbnailPath.split('/')[1];
      await deleteFile(imageFile);
    }

    await job.destroy();
    return res.status(200).json(response.okDelete(message.delete));

    /*
      #swagger.parameters[id] = {
        in: 'path',
        description: "Jobs id",
        required: true,
      }

      #swagger.responses[200] = {
        description: 'Successful operation.',
        schema: {
          resCode: "200",
          resDesc: "Deleted Success"
        }
      }

      #swagger.responses[400] = {
        description: 'Bad Request.',
        schema: {
          resCode: "400",
          resDesc: "Bad Request!"
        }
      }

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Jobs not found!"
        }
      }

    */


  } catch (err) {
    console.log(err);
    return res.status(400).json(response.bad(err.message));  
  }
}

exports.addUser = async (req, res) => {

  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Add users to Jobs"
    #swagger.security = [{
      "Token": []
    }]
  */

  try{

    const { users, jobId } = req.body;
    const job = await Jobs.findOne({
      id: jobId
    });

    if(!job) {
      return res.status(404).json(response.nodeFound(`Jobs ${message.notFound}`));
    }

    const findUser = await User.findOne({
      id: users
    });

    if(!findUser) {
      return res.status(404).json(response.nodeFound(`Users ${message.notFound}`));
    }

    let usersData = {
      userId: findUser.getId(),
      name: findUser.nama,
      email: findUser.email,
      nomor_telepon: findUser.nomor_telepon,
    };

    const userCollection = await job.collectionFindOne('user', {
      where: {
        userId: users
      }
    });

    if(userCollection) {
      return res.status(422).json(response.found(`Users ${message.alreadyExists} in Jobs`));
    }

    await job.collectionCreate('user', usersData);

    const getUser = await job.collectionFindAll('user');
    let resultUser = getUser.map(user => {
      return {
        id: user.getId(),
        name: user.name,
        email: user.email,
        nomor_telepon: user.nomor_telepon,
      }
    });

    let result = {
      id: job.getId(),
      deskripsi: job.deskripsi,
      detail: job.detail,
      catatan: job.catatan,
      alamat: job.alamat,
      no_telpon_pic: job.no_telpon_pic,
      pic_gedung: job.pic_gedung,
      status_teknisi: job.status_teknisi,
      status_supervisor: job.status_supervisor,
      tanggal_pemasangan: job.tanggal_pemasangan,
      users: resultUser,
    };

    return res.status(201).json(response.create(result, message.create));

    /*
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { 
              $ref: "#/definitions/UsersJobs"
            },
            examples: {
              UsersJobs: { $ref: "#/components/examples/UsersJobs" }
            }
          }
        }
      }

      #swagger.responses[201] = {
        description: 'Successful operation.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                resCode: { type: 'number', example: 201 },
                resDesc: { type: 'string', example: 'Created Success' },
                values: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deskripsi: { type: 'string' },
                    detail: { type: 'string' },
                    catatan: { type: 'string' },
                    alamat: { type: 'string' },
                    no_telpon_pic: { type: 'string' },
                    pic_gedung: { type: 'string' },
                    tanggal_pemasangan: { type: 'string' },
                    status_teknisi: { type: 'string' },
                    status_supervisor: { type: 'string' },
                    users: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' },
                          nomor_telepon: { type: 'string' },
                        }
                      }
                    }
                  }
                }
              }
            }
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

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Inquiry not found!"
        }
      }

      #swagger.responses[422] = {
        description: 'Unprocessable Entity.',
        schema: {
          resCode: "422",
          resDesc: "Users already exists in Jobs!"
        }
      }

    */

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
    
  }
}

exports.deleteUser = async (req, res) => {

  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Delete users from Jobs"
    #swagger.security = [{
      "Token": []
    }]
  */

  const id = req.params.id;
  try {

    const { userId } = req.body;

    const findJobs = await Jobs.findOne({
      id: id
    });
    
    if(!findJobs) {
      return res.status(404).json(response.nodeFound(`Jobs ${message.notFound}`));
    }

    const findUser = await findJobs.collectionFindOne('user', {
      where: {
        userId: userId
      }
    });

    if(!findUser) {
      return res.status(404).json(response.nodeFound(`Users ${message.notFound}`));
    }

    await findUser.destroy();

    return res.status(200).json(response.okDelete(message.delete));

    /*
      #swagger.parameters[id] = {
        in: 'path',
        description: "Jobs id",
        required: true,
      }

      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
              }
            }
          }
        }
      }

      #swagger.responses[200] = {
        description: 'Successful operation.',
        schema: {
          resCode: "200",
          resDesc: "Deleted Success!"
        }
      }

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Inquiry not found!"
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

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
  }
}

exports.addProduct = async (req, res) => {

  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Add products to Jobs"
    #swagger.security = [{
      "Token": []
    }]
  */

  try {

    const { productId, jobId, jumlah, keterangan, lokasi_pemasangan } = req.body;

    const findJobs = await Jobs.findOne({
      id: jobId
    });

    if(!findJobs) {
      return res.status(404).json(response.nodeFound(`Jobs ${message.notFound}`));
    }

    const collectionProduct = await findJobs.collectionFindOne('product', {
      where: {
        productId: productId
      }
    });

    if(collectionProduct) {
      return res.status(422).json(response.found(`Products ${message.alreadyExists} in Jobs`));
    }

    const product = await Products.findOne({
      id: productId
    });

    if(!product) {
      return res.status(404).json(response.nodeFound(`Products ${message.notFound}`));
    }

    if(jumlah > parseInt(product.stock)) {
      return res.status(422).json(response.found(`Jumlah product melampaui stock`));
    }

    const productResult = {
      productId: product.getId(),
      name: product.title,
      jumlah: jumlah,
      keterangan: keterangan,
      lokasi_pemasangan: lokasi_pemasangan,
    };

    await findJobs.collectionCreate('product', productResult);

    product.stock = (parseInt(product.stock) - parseInt(jumlah));
    product.totalOut = (parseInt(product.totalOut) + parseInt(jumlah));
    await product.save();

    const getProduct = await findJobs.collectionFindAll('product');
    let resultProduct = getProduct.map(item => {
      return {
        id: item.productId,
        name: item.name,
        jumlah: item.jumlah,
        keterangan: item.keterangan,
        lokasi_pemasangan: item.lokasi_pemasangan,
      }
    });

    let result = {
      id: findJobs.getId(),
      deskripsi: findJobs.deskripsi,
      detail: findJobs.detail,
      catatan: findJobs.catatan,
      alamat: findJobs.alamat,
      no_telpon_pic: findJobs.no_telpon_pic,
      pic_gedung: findJobs.pic_gedung,
      tanggal_pemasangan: findJobs.tanggal_pemasangan,
      status_teknisi: findJobs.status_teknisi,
      status_supervisor: findJobs.status_supervisor,
      product: resultProduct,
    }

    return res.status(201).json(response.create(result, message.create));

    /*
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: '#/components/schemas/ProductJobs'
            },
            examples: {
              ProductJobs: { $ref: '#/components/examples/ProductJobs' }
            }
          }
        }
      }

      #swagger.responses[201] = {
        description: 'Successful operation.',
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                resCode: { type: 'number', example: '201' },
                resDesc: { type: 'string', example: 'Created Success!' },
                values: {
                  type: "object",
                  properties: {
                    id: { type: 'string' },
                    deskripsi: { type: 'string' },
                    detail: { type: 'string' },
                    catatan: { type: 'string' },
                    alamat: { type: 'string' },
                    no_telpon_pic: { type: 'string' },
                    pic_gedung: { type: 'string' },
                    tanggal_pemasangan: { type: 'string' },
                    status_teknisi: { type: 'string' },
                    status_supervisor: { type: 'string' },
                    product: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          jumlah: { type: 'number' },
                          keterangan: { type: 'string' },
                          lokasi_pemasangan: { type: 'string' },
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Inquiry not found!"
        }
      }

      #swagger.responses[400] = {
        description: 'Bad Request.',
        schema: {
          resCode: "400",
          resDesc: "Bad Request!"
        }
      }

      #swagger.responses[422] = {
        description: 'Unprocessable Entity.',
        schema: {
          resCode: "422",
          resDesc: "Unprocessable Entity!"
        }
      }

    */

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
  }
}

exports.updateProduct = async (req, res) => {
  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Update products to Jobs"
    #swagger.security = [{
      "Token": []
    }]
  */
  try {
    
    const { productId, jobId, jumlah, keterangan, lokasi_pemasangan } = req.body;

    const findJobs = await Jobs.findOne({
      id: jobId
    });

    if(!findJobs) {
      return res.status(404).json(response.nodeFound(`Jobs ${message.notFound}`));
    }

    const collectionProduct = await findJobs.collectionFindOne('product', {
      where: {
        productId: productId
      }
    });

    const findProduct = await Products.findOne({
      id: productId
    });

    if(!collectionProduct) {
      return res.status(404).json(response.nodeFound(`Products in jobs ${message.notFound}`));
    }

    if(jumlah > parseInt(findProduct.stock)) {
      return res.status(422).json(response.found(`Jumlah product melampaui stock`));
    }

    let stockData = 0;
    let totalOutData = 0;

    if (jumlah === parseInt(collectionProduct.jumlah)) {
      stockData = parseInt(findProduct.stock);
      totalOutData = parseInt(findProduct.totalOut);
    } else {
      stockData = (parseInt(findProduct.stock) + parseInt(collectionProduct.jumlah)) - parseInt(jumlah);
      totalOutData = (parseInt(findProduct.totalOut) - parseInt(collectionProduct.jumlah)) + parseInt(jumlah);
    }

    findProduct.stock = stockData;
    findProduct.totalOut = totalOutData;
    await findProduct.save();

    await collectionProduct.update({
      jumlah: jumlah ? parseInt(jumlah) : parseInt(collectionProduct.jumlah),
      keterangan: keterangan ? keterangan : collectionProduct.keterangan,
      lokasi_pemasangan: lokasi_pemasangan ? lokasi_pemasangan : collectionProduct.lokasi_pemasangan,
    });

    const getCollectionProduct = await findJobs.collectionFindOne('product', {
      where: {
        productId: productId
      }
    });
    let result = {
      id: getCollectionProduct.productId,
      name: getCollectionProduct.name,
      jumlah: parseInt(getCollectionProduct.jumlah),
      keterangan: getCollectionProduct.keterangan,
      lokasi_pemasangan: getCollectionProduct.lokasi_pemasangan,
    };

    return res.status(201).json(response.create(result, message.update));
    // return res.status(201).json(totalOutData);

    /*
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: '#/components/schemas/ProductJobs'
            },
            examples: {
              ProductJobs: { $ref: '#/components/examples/ProductJobs' }
            }
          }
        }
      }

      #swagger.responses[201] = {
        description: 'Successful operation.',
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                resCode: { type: 'number', example: '201' },
                resDesc: { type: 'string', example: 'Updated Success!' },
                values: {
                  type: "object",
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    jumlah: { type: 'number' },
                    keterangan: { type: 'string' },
                    lokasi_pemasangan: { type: 'string' },
                  }
                }
              }
            }
          }
        }
      }

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Inquiry not found!"
        }
      }

      #swagger.responses[400] = {
        description: 'Bad Request.',
        schema: {
          resCode: "400",
          resDesc: "Bad Request!"
        }
      }

      #swagger.responses[422] = {
        description: 'Unprocessable Entity.',
        schema: {
          resCode: "422",
          resDesc: "Unprocessable Entity!"
        }
      }

    */

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
  }
}

exports.deleteProduct = async (req, res) => {

  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Delete products to Jobs"
    #swagger.security = [{
      "Token": []
    }]
  */

  const id = req.params.id;
  try {
    
    const { productId } = req.body;

    const findJobs = await Jobs.findOne({
      id: id
    });

    if(!findJobs) {
      return res.status(404).json(response.nodeFound(`Jobs ${message.notFound}`));
    }

    const collectionProduct = await findJobs.collectionFindOne('product', {
      where: {
        productId: productId
      }
    });

    if(!collectionProduct) {
      return res.status(404).json(response.nodeFound(`Products in jobs ${message.notFound}`));
    }

    const findProduct = await Products.findOne({
      id: productId
    });

    findProduct.stock = (parseInt(findProduct.stock) + parseInt(collectionProduct.jumlah));
    findProduct.totalOut = (parseInt(findProduct.totalOut) - parseInt(collectionProduct.jumlah));

    await findProduct.save();
    await collectionProduct.destroy();

    return res.status(200).json(response.okDelete(message.delete));

    /*
      #swagger.parameters[id] = {
        in: 'path',
        description: "Jobs id",
        required: true,
      }

      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
              }
            }
          }
        }
      }

      #swagger.responses[200] = {
        description: 'Successful operation.',
        schema: {
          resCode: "200",
          resDesc: "Deleted Success!"
        }
      }

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Inquiry not found!"
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

  } catch (err) {
    return res.status(400).json(response.bad(err.message));  
  }
}

exports.uploadJobs = async (req, res) => {

  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Upload image jobs"
    #swagger.security = [{
      "Token": []
    }]
  */
  
  const file = req.file;
  try {
    
    const { jobId, keterangan } = req.body;

    const findJobs = await Jobs.findOne({
      id: jobId
    });

    if (!findJobs) {
      return res.status(404).json(response.nodeFound(`Jobs ${message.notFound}`));
    }

    // if (!file.originalname) {
    //   return res.status(404).json(response.nodeFound('Cannot find image'));
    // }

    const findImage = await findJobs.collectionFindAll('image');

    let thumbnail, thumbnailPath = '';

    if (file) {
      if (findImage.length > 0) {
        const imageFile = findImage[0].thumbnailPath.split('/')[1];
        await deleteFile(imageFile);
      }

      const fileImage = await uploadFile(file);
      thumbnail = fileImage.thumbnail;
      thumbnailPath = fileImage.thumbnailPath;
    }

    await findJobs.collectionDrop('image');
        
    let image = {
      keterangan: keterangan ? keterangan : '',
      thumbnail: thumbnail ? thumbnail : findImage[0].thumbnail,
      thumbnailPath: thumbnailPath ? thumbnailPath : findImage[0].thumbnailPath,
    };

    const images = await findJobs.collectionCreate('image', image);
    let resultImage = {
      id: images.getId(),
      keterangan: images.keterangan,
      thumbnail: images.thumbnail,
      thumbnailPath: images.thumbnailPath,
    };

    let result = {
      id: findJobs.getId(),
      deskripsi: findJobs.deskripsi,
      detail: findJobs.detail,
      catatan: findJobs.catatan,
      alamat: findJobs.alamat,
      no_telpon_pic: findJobs.no_telpon_pic,
      pic_gedung: findJobs.pic_gedung,
      status_teknisi: findJobs.status_teknisi,
      status_supervisor: findJobs.status_supervisor,
      tanggal_pemasangan: findJobs.tanggal_pemasangan,
      image: resultImage,
    };

    return res.status(201).json(response.create(result, "Upload image success"));

    /*

      #swagger.requestBody = {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/definitions/ImageJobs' }
          }
        }
      }

      #swagger.responses[201] = {
        description: 'Successful operation.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                resCode: { type: 'number', example: 201 },
                resDesc: { type: 'string', example: 'Upload image success' },
                values: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deskripsi: { type: 'string' },
                    detail: { type: 'string' },
                    catatan: { type: 'string' },
                    alamat: { type: 'string' },
                    no_telpon_pic: { type: 'string' },
                    pic_gedung: { type: 'string' },
                    status_teknisi: { type: 'string' },
                    status_supervisor: { type: 'string' },
                    tanggal_pemasangan: { type: 'string' },
                    image: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        keterangan: { type: 'string' },
                        thumbnail: { type: 'string' },
                        thumbnailPath: { type: 'string' },
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      #swagger.responses[400] = {
        description: 'Bad Request.',
        schema: {
          resCode: 400,
          resDesc: 'Bad Request!'
        }
      }

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: 404,
          resDesc: 'Not found!'
        }
      }

    */

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
  }
}

exports.updateStatusJob = async (req, res) => {

  /*
    #swagger.tags = ["Jobs"]
    #swagger.summary = "Update Status Jobs"
    #swagger.security = [{
      "Token": []
    }]
  */

  try {

    const { jobsId } = req.body;

    const job = await Jobs.findOne({
      id: jobsId
    });

    if(!job) {
      return res.status(404).json(response.nodeFound(`Jobs ${message.notFound}`));
    }

    job.status_job = true;

    await job.save();

    const findJob = await Jobs.findOne({
      id: jobsId
    });

    let result = {
      id: findJob.getId(),
      deskripsi: findJob.deskripsi,
      detail: findJob.detail,
      catatan: findJob.catatan,
      alamat: findJob.alamat,
      no_telpon_pic: findJob.no_telpon_pic,
      pic_gedung: findJob.pic_gedung,
      tanggal_pemasangan: findJob.tanggal_pemasangan,
      status_teknisi: findJob.status_teknisi,
      status_supervisor: findJob.status_supervisor,
      status_job: findJob.status_job,
    };

    return res.status(201).json(response.create(result, message.update));

    /*

      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { 
              type: 'object',
              properties: {
                jobsId: { type: 'string' }
              }
            }
          }
        }
      }

      #swagger.responses[201] = {
        description: 'Successful operation.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                resCode: { type: 'number', example: 201 },
                resDesc: { type: 'string', example: 'Updated Success' },
                values: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deskripsi: { type: 'string' },
                    detail: { type: 'string' },
                    catatan: { type: 'string' },
                    alamat: { type: 'string' },
                    no_telpon_pic: { type: 'string' },
                    pic_gedung: { type: 'string' },
                    tanggal_pemasangan: { type: 'string' },
                    status_teknisi: { type: 'string' },
                    status_supervisor: { type: 'string' },
                    status_job: { type: 'boolean' },
                  }
                }
              }
            }
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

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: "404",
          resDesc: "Jobs not found!"
        }
      }

    */

  } catch (err) {
    return res.status(400).json(response.bad(err.message));
  }
}