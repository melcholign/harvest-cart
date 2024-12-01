/**
 * A utility class for sending emails using Nodemailer.
 *
 * This class provides a convenient wrapper for configuring and sending emails
 * with the ability to customize service options and email details.
 *
 * @class MailSender
 */
export class MailSender {

    /**
     * @private
     * @type {Object} Nodemailer transporter instance for sending emails.
     */
    #transporter;

    /**
     * Creates an instance of MailSender.
     *
     * @constructor
     * @param {string} service - The email service provider (e.g., 'gmail').
     * @param {Object} auth - Authentication credentials.
     * @param {string} auth.user - The email address used for authentication.
     * @param {string} auth.pass - The password or app-specific key for authentication.
     */
    constructor(service, { user, pass }) {
        const options = {
            service,
            auth: {
                user,
                pass,
            }
        };

        this.#transporter = nodemailer.createTransport(options);
    }

    /**
     * Sends an email.
     *
     * @param {Object} mailOptions - Email details.
     * @param {string} mailOptions.from - Sender's email address.
     * @param {string} mailOptions.to - Recipient's email address.
     * @param {string} mailOptions.subject - Email subject.
     * @param {string} [mailOptions.text] - Plain text version of the email content.
     * @param {string} [mailOptions.html] - HTML version of the email content.
     * @returns {Promise<string>} Resolves with the email service's response on success.
     * @throws {Error} Rejects with an error if sending the email fails.
     */
    send({ from, to, subject, text, html }) {
        const mailOptions = {
            from,
            to,
            subject,
            text,
            html,
        };

        return new Promise((resolve, reject) => {
            this.#transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return reject(err);
                }

                return resolve(info.response);
            });
        });
    }
}
