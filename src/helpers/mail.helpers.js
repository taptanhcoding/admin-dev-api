const nodemailer = require('nodemailer')
require('dotenv').config()


var transporter =  nodemailer.createTransport({ // config mail server
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_SEND,
        pass: process.env.PASS_EMAIL
    }
});

module.exports= {
    async mailCreateCustomer(data) {
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'Smart Device',
            to: data.email,
            subject: 'Smart Device - Xác nhận đăng ký',
            text: '',
            html: `
            <div style="border:8px solid #ef0000;line-height:21px;padding:2px">
                <div style="padding:10px">
                        <strong>Chào ${data.fullname}</strong>
                        <p>Cảm ơn quý khách đã đăng ký tài khoản tại <a  href="${""}" target="_blank">SmartDevice</a></p>
                </div>
                <div style="background:none repeat scroll 0 0 #ef0000;color:#ffffff;font-weight:bold;line-height:25px;min-height:27px;padding-left:10px">
                Xác nhận của quý khách
                </div>
                <div  style="padding:10px">
                 Bấm vào <a  href="${""}/verification/${data.token}" target="_blank">Đây</a> để xác minh tài khoản
                </div>
            </div>
            `
        }   
        
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' +  info.response);
            }
        });
    },
    async mailForgotCustomer(data) {
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'Smart Device',
            to: data.email,
            subject: 'Smart Device - Quên mật khẩu',
            text: '',
            html: `<p>Mật khẩu của bạn đã được đặt lại là : ${data.password} </p>`
        }   
        
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' +  info.response);
            }
        });
    },    
    async mailCreatedOrder(email,data) {
        const detaiProduct = () => {
          let tableProduct = "";
          data.detailOrder.forEach((product) => {
            tableProduct += `<tr>
                  <td><a href="${process.env.URL_REACT}detail/${product.slug}" target="_blank">${product.name}</a> màu: ${product.color}</td>
                  <td>${product.price} </td>
                  <td>${product.quanity}</td>
                  <td>${product.total}</td>
                  </tr>`;
          });
          return tableProduct;
        };
        let bodyEmail = `
          <div style="border:8px solid #ef0000;line-height:21px;padding:2px">
              <div style="padding:10px">
                      <strong>Chào ${data.name}</strong>
                      <p>Cảm ơn quý khách đã mua hàng của<a  href="${
                        process.env.URL_REACT
                      }" target="_blank">CHUYENDEV.SITE</a></p>
              </div>
              <div style="background:none repeat scroll 0 0 #ef0000;color:#ffffff;font-weight:bold;line-height:25px;min-height:27px;padding-left:10px">
              Thông tin đơn hàng  của quý khách
              </div>
              <div  style="padding:10px">
              <table cellspacing="0" cellpadding="6" border="0" width="100%">
                  <tbody>
                  <tr> 
                      <td width="173px">Tên Người đặt hàng </td>
                      <td width="5px">:</td>
                      <td>${data.name}</td>
                  </tr>
                  <tr> 
                      <td width="173px">Địa chỉ </td>
                      <td width="5px">:</td>
                      <td>${data.address}</td>
                  </tr>
                  <tr> 
                      <td width="173px">Email </td>
                      <td width="5px">:</td>
                      <td>${data.email}</td>
                  </tr>
                  <tr> 
                      <td width="173px">Số điện thoại </td>
                      <td width="5px">:</td>
                      <td>${data.phone}</td>
                  </tr>
                  </tbody>
              </table>
              </div>
              <div style="background:none repeat scroll 0 0 #ef0000;color:#ffffff;font-weight:bold;line-height:25px;min-height:27px;padding-left:10px">
              Chi tiết đơn hàng
              </div>
              <div  style="padding:10px">
              <table cellspacing="0" cellpadding="6" border="1" width="964" style="border-style:solid;border-collapse:collapse;margin-top:2px">
                  <thead>
                      <tr>
                          <td>
                              Tên sản phẩm
                          </td>
                          <td>
                              Giá
                          </td>
                          <td>
                              Số lượng
                          </td>
                          <td>
                              Tổng
                          </td>
                      </tr>
                  </thead>
                  <tbody>
                      ${detaiProduct()}
                      <tr>
                          <td colspan="3" align="right">
                              Tổng:
                          </td>
                          <td>
                              ${data.totalPay}
                          </td>
                      </tr>
                  </tbody>
              </table>
              </div>
              <div style="padding: 10px">
                  <p>
                  <a  href="${
                    process.env.URL_REACT
                  }" target="_blank">CHUYENDEV.SITE</a> sẽ liên lạc với quý khách và xác nhận lại đơn hàng trong thời gian sớm nhất.<br>Cảm ơn quý khách
                  </p>
              </div>
          </div>
          `;
      
        var mainOptions = {
          // thiết lập đối tượng, nội dung gửi mail
          from: "Chuyendev Shop",
          to: data.email,
          subject: "Chuyendev-Xác nhận đơn hàng",
          text: "",
          html: bodyEmail,
        };
      
        await transporter.sendMail(mainOptions, function (err, info) {
          if (err) {
            console.log(err);
          } else {
            console.log("Message sent: " + info.response);
          }
        });
      },
    async mailAgreeOrder(email,data) {
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'Smart Device',
            to: email,
            subject: 'Smart Device - Xác nhận Đơn hàng',
            text: '',
            html: '<p>Đơn hàng của bạn đã được xử lý </p>'
        }   
        
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' +  info.response);
            }
        });
    },
}