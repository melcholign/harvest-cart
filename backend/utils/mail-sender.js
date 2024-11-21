import nodemailer from 'nodemailer';

export class MailSender {

    #transporter;

    constructor(service, { user, pass }) {
        const options = {
            service,
            auth: {
                user,
                pass,
            }
        }

        this.#transporter = nodemailer.createTransport(options);
    }

    send({ from, to, subject, text, html }) {
        const mailOptions = {
            from,
            to,
            subject,
            text,
            html,
        }

        return new Promise((resolve, reject) => {
            this.#transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return reject(err);
                }

                return resolve(info.response);
            })
        });
    }
}
