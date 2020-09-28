const sgMail = require("@sendgrid/mail");
const Env = use('Env')

sgMail.setApiKey(
    Env.get('SENDGRID_KEY')
  );

class SendMail{
    static async sendEmail(data) {
        return new Promise((resolve, reject) => {

          sgMail.sendMultiple(data, function(error, data) {
            if (error) {
              reject(error);
            }
    
            resolve(data);
          });
        });
    }
}

module.exports = SendMail;