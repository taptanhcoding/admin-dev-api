const rules = {
    "owner" : {
        label: "Chủ sở hữu",
        "auth": {
            "suppliers": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "categories": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "employees": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "products": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "sliders": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "customers": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "comments": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            }
          }
    },
    "technicians" : {
        label: "Kỹ thuật viên",
        "auth": {
            "suppliers": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "categories": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "employees": {
              "GET": true,
              "POST": false,
              "PATCH": true,
              "PUT": true,
              "DELETE": false
            },
            "products": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "sliders": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "customers": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            },
            "comment": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            }
          }
    },
    "support": {
        label :"Hỗ trợ",
        "auth": {
            "suppliers": {
              "GET": true,
              "POST": false,
              "PATCH": false,
              "PUT": false,
              "DELETE": false
            },
            "categories": {
              "GET": true,
              "POST": false,
              "PATCH": false,
              "PUT": false,
              "DELETE": false
            },
            "employees": {
              "GET": true,
              "POST": false,
              "PATCH": true,
              "PUT": true,
              "DELETE": false
            },
            "products": {
              "GET": true,
              "POST": false,
              "PATCH": false,
              "PUT": false,
              "DELETE": false
            },
            "sliders": {
              "GET": true,
              "POST": false,
              "PATCH": false,
              "PUT": false,
              "DELETE": false
            },
            "customers": {
              "GET": true,
              "POST": false,
              "PATCH": false,
              "PUT": false,
              "DELETE": false
            },
            "comments": {
              "GET": true,
              "POST": true,
              "PATCH": true,
              "PUT": true,
              "DELETE": true
            }
          }
    }
}