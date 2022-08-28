const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});
// {openapi: '3.0.0'}

const outputFile = './swagger_output.json'
const endpointsFiles = ['./server.js']

const doc = {
  info: {
    version: "1.0.0",
    title: "LDM API",
    description: "Backend of application LDM."
  },
  host: "https://app-backend-ldm.herokuapp.com/",
  basePath: "/",
  schemes: ['https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
      {
        name: "Login",
        description: "Login API"
      },
      {
        "name": "User",
        "description": "Endpoints"
      },
      {
        "name": "Categories",
        "description": "Endpoints"
      },
      {
        "name": "Products",
        "description": "Endpoints"
      },
      {
        "name": "Jobs",
        "description": "Endpoints"
      }
  ],
  securityDefinitions: {
    Token: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  },
  '@definitions': {
    Login: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
        },
        password: {
          type: 'string',
        }
      },
      required: ['username', 'password']
    },
    User: {
      type: 'object',
      properties: {
        username: {
          type: "string",
        },
        password: {
          type: "string",
        },
        nama: {
          type: "string",
        },
        nomor_telepon: {
          type: "string",
        },
        alamat: {
          type: "string",
        },
        jenis_kelamin: {
          type: "string",
        },
        tempat_lahir: {
          type: "string",
        },
        tanggal_lahir: {
          type: "string",
        },
        email: {
          type: "string",
        },
        level: {
          type: "string",
        }
      },
      required: ["username", "password", "nama", "nomor_telepon", "alamat", "jenis_kelamin", "tempat_lahir", "tanggal_lahir", "email", "level"]
    },
    Categories: {
      type: 'object',
      properties: {
        name: {
          type: "string",
        },
        label: {
          type: "string",
        },
        icon: {
          type: "string",
        },
        description: {
          type: "string",
        },
        parent_id: {
          type: "string",
        }
      },
      required: ["name"]
    },
    Products: {
      type: 'object',
      properties: {
        title: {
          type: "string",
        },
        description: {
          type: "string",
        },
        price: {
          type: "number",
        },
        stock: {
          type: "number",
        },
        weight: {
          type: "number",
        },
        categories: {
          type: "string",
        },
        users: {
          type: "string",
        },
        image: {
          type: "string",
          format: "binary",
        }
      },
      required: ["title", "image", "price", "weight", "stock", "categories", "users"]
    },
    Jobs: {
      type: 'object',
      properties: {
        deskripsi: {
          type: "string",
        },
        detail: {
          type: "string",
        },
        catatan: {
          type: "string",
        },
        alamat: {
          type: "string",
        },
        no_telpon_pic: {
          type: "string",
        },
        pic_gedung: {
          type: "string",
        },
        tanggal_pemasangan: {
          type: "string",
        },
        status_teknisi: {
          type: "string",
          default: "Pending"
        },
        status_supervisor: {
          type: "string",
          default: "Pending"
        }
      },
      required: ["deskripsi", "detail", "alamat", "no_telpon_pic", "pic_gedung", "tanggal_pemasangan"]
    },
    UsersJobs: {
      type: 'object',
      properties: {
        users: { type: 'string' },
        jobId: { type: 'string' }
      },
      required: ["users", "jobId"]
    },
    ProductJobs: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        jobId: { type: 'string' },
        jumlah: { type: 'number' },
        keterangan: { type: 'string' },
        lokasi_pemasangan: { type: 'string' },
      },
      required: ['productId', 'jobId', 'jumlah']
    },
    ImageJobs: {
      type: 'object',
      properties: {
        jobId: { 
          type: 'string' 
        },
        keterangan: {
          type: "string",
        },
        image: { 
          type: 'string',
          format: 'binary'
        },
      },
      required: ["jobId", "image"]
    }
  },
  components:{
    examples: {
      Login: {
        value: {
          username: "Deri",
          password: "123456789"
        }
      },
      User: {
        value: {
          username: "rio",
          password: "1234567890",
          nama: "Rio Setiawan",
          nomor_telepon: "089878675432",
          alamat: "Jl. Flamboyan Raya No.53, RT.1/RW.10",
          jenis_kelamin: "L",
          tempat_lahir: "Lampung",
          tanggal_lahir: "2021-10-09",
          email: "rio@mail.com",
          level: "Teknisi"
        }
      },
      Categories: {
        value: {
          name: "SW0892",
          label: "sw0892",
          icon: "sw",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
          parent_id: "akS1kSuHbj85AxJZHULV"
        }
      },
      Products: {
        value: {
          title: "SW8897",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
          price: 30000,
          weight: 2,
          stock: 30,
          categories: "cXcl4V5UEY3NCez4Sqbr",
          users: "ZBJq4HDm5gqWmTUB1zA1",
        }
      },
      Jobs: {
        value: {
          deskripsi: "Pemasangan Internet",
          detail: "Pemasangan Internet di Musium Lampung",
          catatan: "pasang seuai sop",
          alamat: "Jl. Flamboyan Raya No.53, RT.1/RW.10",
          no_telpon_pic: "089878675432",
          pic_gedung: "rio",
          tanggal_pemasangan: "2021-10-09",
          status_teknisi: "Pending",
          status_supervisor: "Pending",
        },
      },
      UsersJobs: {
        value: {
          users: "3vV9Cnl7JJ0oQYMU1c6J",
          jobId: "dUiAebEziGaXn0yUgmhG",
        }
      },
      ProductJobs: {
        value: {
          productId: "lgihoYvdkT7WGJcEhyzU",
          jobId: "dUiAebEziGaXn0yUgmhG",
          jumlah: 5,
          keterangan: "Pasang Internet",
          lokasi_pemasangan: "Lantai 5"
        }
      }
    }
  },

}

swaggerAutogen(outputFile, endpointsFiles, doc);
