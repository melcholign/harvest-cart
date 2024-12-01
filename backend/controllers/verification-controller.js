import bcrypt from 'bcrypt';
import { MailSender } from '../utils/mail-sender.js';
import { VerificationModel } from '../models/verification-model.js';
import { CustomerModel } from '../models/customer-model.js';

/**
 * @classdesc Controller handling account verification, including initiating and completing account verification.
 */
class VerificationController {

    static #EXPIRY_MINUTES = 5;

    /**
     * Initiates the account verification process by generating a verification code
     * and sending it to the user's email.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     */
    static async initiateAccountVerification(req, res) {
        const { id, email } = req.user;
        const expiryMinutes = VerificationController.#EXPIRY_MINUTES;

        let code;
        try {
            code = await VerificationModel.generateCode(
                id,
                VerificationModel.PURPOSES.VERIFY_ACCOUNT,
                expiryMinutes,
            );
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.sendStatus(409);
            }
        }

        const { MAIL_SERVICE, MAIL_USER, MAIL_PASS } = process.env;
        const mailSender = new MailSender(MAIL_SERVICE, { user: MAIL_USER, pass: MAIL_PASS });
        const mailOptions = {
            from: MAIL_USER,
            to: email,
            subject: 'Account Verification Code',
            html: `<p>Your account verification code is <b>${code}</b>. 
            <p>Expiring in ${expiryMinutes} minutes from when you received this email.`,
        };
        await mailSender.send(mailOptions);
        res.sendStatus(200);
    }

    /**
     * Completes the account verification process by validating the provided code
     * and marking the account as verified if successful.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     */
    static async completeAccountVerification(req, res) {
        const { id } = req.user;
        const verificationRecord = await VerificationModel.get(id, VerificationModel.PURPOSES.VERIFY_ACCOUNT);
        if (!verificationRecord) {
            return res.status(400).json({
                success: false,
                reason: 'nonexistent',
            });
        }

        const { code } = req.body;
        const isCorrectCode = await bcrypt.compare(String(code), verificationRecord.hashedCode);

        if (!isCorrectCode) {
            return res.status(400).json({
                success: false,
                reason: 'incorrect',
            });
        }

        VerificationModel.remove(id, VerificationModel.PURPOSES.VERIFY_ACCOUNT);

        const currentTimeStamp = new Date(Date.now());

        if (verificationRecord.expiryAt < currentTimeStamp) {
            return res.status(400).json({
                success: false,
                reason: 'expired',
            });
        }

        CustomerModel.update(id, 'isVerified', true);

        return res.status(200).json({
            success: true,
        });
    }
}

export {
    VerificationController,
}
